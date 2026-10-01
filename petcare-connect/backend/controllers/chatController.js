const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are PawBuddy 🐾, the friendly and knowledgeable AI assistant for PetCare Connect — a veterinary clinic and pet care platform.

Your expertise covers:
• General pet health & wellness tips (dogs, cats, birds, rabbits, fish, reptiles)
• Nutrition, diet, and feeding schedules
• Common symptoms and when to see a vet (but always recommend visiting a professional for serious concerns)
• Pet grooming and hygiene
• Training and behavioral advice
• Vaccination schedules and preventive care
• Post-surgery / post-treatment care tips

Personality:
- Warm, empathetic, and encouraging
- Use occasional pet-related emojis (🐾 🐶 🐱 🐰 🐦 🐠) but don't overdo it
- Keep answers concise (2-4 short paragraphs max) unless the user asks for detail
- Always remind users to consult their veterinarian for medical emergencies or serious health concerns
- If asked about non-pet topics, gently redirect: "I'm PawBuddy, your pet care specialist! I'd love to help with any pet-related questions 🐾"

Important: NEVER provide specific medication dosages. Always say "Your vet can prescribe the right dosage based on your pet's weight and condition."`;

// Models to try in order — if one is overloaded, fall back to the next
const MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

// Keep a lightweight in-memory history per session (cleared on server restart)
const sessions = new Map();
const MAX_HISTORY = 20;
const MAX_RETRIES = 3;

// Helper: sleep ms
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Helper: try sending with retries and model fallback
const tryGenerateReply = async (message, history) => {
  const errors = [];

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        const chat = model.startChat({
          history: [
            { role: "user", parts: [{ text: "Hi, what can you help me with?" }] },
            { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
            ...history,
          ],
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
      } catch (err) {
        const errMsg = err?.message || String(err);
        const is503 = errMsg.includes("503") || errMsg.includes("Service Unavailable") || errMsg.includes("overloaded");
        const is429 = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("rate");

        console.warn(`[Chat] ${modelName} attempt ${attempt + 1}/${MAX_RETRIES}: ${is503 ? "503 overloaded" : is429 ? "429 rate limited" : errMsg.slice(0, 80)}`);
        errors.push(`${modelName}:${errMsg.slice(0, 60)}`);

        if (is503 || is429) {
          // Exponential backoff: 2s, 4s, 8s
          await sleep(2000 * Math.pow(2, attempt));
          continue;
        }
        // For non-retryable errors (auth, bad request), throw immediately
        throw err;
      }
    }
    // All retries exhausted for this model, try next
  }

  console.error("[Chat] All models exhausted:", errors.join(" | "));
  throw new Error("SERVICE_UNAVAILABLE");
};

// POST /api/chat
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Use authenticated user ID if available, otherwise use client sessionId
    const chatKey = req.user ? req.user._id.toString() : (sessionId || "anonymous");

    // Retrieve or create session history
    if (!sessions.has(chatKey)) {
      sessions.set(chatKey, []);
    }
    const history = sessions.get(chatKey);

    const reply = await tryGenerateReply(message.trim(), history);

    // Store in session
    history.push(
      { role: "user", parts: [{ text: message.trim() }] },
      { role: "model", parts: [{ text: reply }] }
    );
    // Keep history bounded
    if (history.length > MAX_HISTORY * 2) {
      history.splice(0, history.length - MAX_HISTORY * 2);
    }

    return res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err.message || err);

    if (err.message === "SERVICE_UNAVAILABLE") {
      return res.status(503).json({
        message: "PawBuddy is experiencing high demand right now. Please try again in a few seconds! 🐾",
        retryable: true,
      });
    }

    return res.status(500).json({
      message: "Sorry, I couldn't process your message right now. Please try again.",
    });
  }
};

// DELETE /api/chat/clear  — reset chat history
const clearHistory = (req, res) => {
  const { sessionId } = req.body || {};
  const chatKey = req.user ? req.user._id.toString() : (sessionId || "anonymous");
  sessions.delete(chatKey);
  res.json({ message: "Chat history cleared" });
};

module.exports = { sendMessage, clearHistory };
