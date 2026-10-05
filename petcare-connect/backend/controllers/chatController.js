const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are PawBuddy 🐾, the friendly and knowledgeable AI assistant for PetCare Connect — a veterinary clinic and pet care platform.

Your expertise covers:
• General pet health & wellness tips (dogs, cats, birds, rabbits, fish, reptiles)
• Nutrition, diet, and feeding schedules
• Common symptoms and when to see a vet (always recommend visiting a professional for serious concerns)
• Pet grooming and hygiene
• Training and behavioral advice
• Vaccination schedules and preventive care
• Post-surgery / post-treatment care tips

Personality:
- Warm, empathetic, and encouraging
- Use occasional pet-related emojis (🐾 🐶 🐱 🐰 🐦 🐠)
- Keep answers concise (1-2 short paragraphs max)
- Always remind users to consult their veterinarian for medical emergencies or serious health concerns
- If asked about non-pet topics, gently redirect: "I'm PawBuddy, your pet care specialist! I'd love to help with any pet-related questions 🐾"

Important: NEVER provide specific medication dosages. Always say "Your vet can prescribe the right dosage based on your pet's weight and condition."`;

// Keep a lightweight in-memory history per session
const sessions = new Map();
const MAX_HISTORY = 6; // Limit chat history to the last 4-6 messages so payloads stay small and fast

// Helper: sleep ms
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 404 = model retired for this key, 429 = rate limited, 503 = overloaded
const RETRYABLE_STATUSES = new Set([404, 429, 503]);

// Helper: send message, retrying the same model then falling back to the next
const generateReply = async (message, history) => {
  const modelsToTry = ["gemini-flash-lite-latest", "gemini-3.5-flash"];
  const attemptsPerModel = 3;
  let lastError = null;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < attemptsPerModel; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
          },
        });

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
        lastError = err;
        // Bad key or malformed request — retrying will not help
        if (!RETRYABLE_STATUSES.has(err.status)) throw err;
        if (attempt < attemptsPerModel - 1) {
          await sleep(1000 * Math.pow(2, attempt));
        }
      }
    }
    // Attempts exhausted on this model — continue to the next one
  }

  throw lastError;
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
    const sessionHistory = sessions.get(chatKey);

    // Limit chat history to the last 4-6 messages so payloads stay small and fast
    const recentHistory = sessionHistory.slice(-MAX_HISTORY);

    const reply = await generateReply(message.trim(), recentHistory);

    // Store in session
    sessionHistory.push(
      { role: "user", parts: [{ text: message.trim() }] },
      { role: "model", parts: [{ text: reply }] }
    );

    // Keep history bounded
    if (sessionHistory.length > MAX_HISTORY) {
      sessionHistory.splice(0, sessionHistory.length - MAX_HISTORY);
    }

    return res.json({ reply, message: reply });
  } catch (error) {
    console.error("PawBuddy Error Code/Message:", error.status, error.message);

    if (error.status === 429 || error?.message?.includes("429")) {
      return res.status(429).json({
        message: "PawBuddy is taking a quick 30-second breather! Please try again in a moment.",
        reply: "PawBuddy is taking a quick 30-second breather! Please try again in a moment.",
      });
    }

    if (RETRYABLE_STATUSES.has(error.status)) {
      return res.status(503).json({
        message: "PawBuddy is busy right now. Please try again in a moment!",
        reply: "PawBuddy is busy right now. Please try again in a moment!",
      });
    }

    return res.status(500).json({
      message: "Sorry, I couldn't process your message right now. Please try again.",
      reply: "Sorry, I couldn't process your message right now. Please try again.",
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
