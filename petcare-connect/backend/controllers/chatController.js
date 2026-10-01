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
const MODELS = ["gemini-3.5-flash", "gemini-3.8-flash"];

// Keep a lightweight in-memory history per session (cleared on server restart)
const sessions = new Map();
const MAX_HISTORY = 20;

// Helper: try sending with retries and model fallback
const tryGenerateReply = async (message, history) => {
  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
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
        const status = err?.status || err?.message || "";
        console.warn(`Model ${modelName} attempt ${attempt + 1} failed: ${status}`);

        // If it's a 503 (overloaded), wait briefly then retry or try next model
        if (String(status).includes("503") || String(status).includes("Service Unavailable")) {
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 1500)); // wait 1.5s before retry
            continue;
          }
          break; // move to next model
        }
        // For other errors, throw immediately
        throw err;
      }
    }
  }
  throw new Error("All models are currently unavailable. Please try again later.");
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
