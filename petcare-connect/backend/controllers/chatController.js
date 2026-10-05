const Groq = require("groq-sdk");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

let groq = null;
if (GROQ_API_KEY) {
  groq = new Groq({ apiKey: GROQ_API_KEY });
}

const SYSTEM_PROMPT = `You are PawBuddy 🐾, the warm, knowledgeable, and empathetic AI pet assistant for PetCare Connect (a veterinary clinic and pet care platform).

Your expertise covers:
• General pet health, nutrition, diet, and wellness tips for dogs, cats, birds, rabbits, and other pets
• Common symptoms, first-aid, and guidance on when to consult a veterinarian
• Grooming, training, behavioral advice, and socialization
• Vaccination schedules and preventive care

Guidelines:
- Maintain a warm, encouraging, pet-loving tone with occasional friendly emojis (🐾, 🐶, 🐱)
- Keep responses concise, clear, and easy to read (use short paragraphs or bullet points)
- For medical emergencies or serious health conditions, always remind owners to see a veterinarian immediately
- Never prescribe prescription medication dosages; advise consulting their veterinarian
- If asked about non-pet topics, gently redirect back to pet care`;

// In-memory conversation history per session
const sessions = new Map();
const MAX_HISTORY = 6; // Keep the last 6 messages (3 turns) for quick, small payloads

/**
 * Call Groq Cloud API for chat completion
 */
const callGroqApi = async (messages) => {
  const client = groq || (process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null);

  if (!client) {
    const error = new Error("Groq API key not configured");
    error.status = 503;
    throw error;
  }

  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    max_tokens: 400,
    temperature: 0.7,
  });

  const choice = completion.choices?.[0]?.message;
  const reply = (choice?.content || "").trim();

  if (!reply) {
    throw new Error("Empty response received from Groq");
  }

  return reply;
};

// POST /api/chat
const sendMessage = async (req, res) => {
  try {
    const currentApiKey = process.env.GROQ_API_KEY || GROQ_API_KEY;
    if (!currentApiKey) {
      return res.status(503).json({
        message: "PawBuddy is temporarily unavailable (Groq API key not configured).",
        reply: "PawBuddy is temporarily unavailable (Groq API key not configured).",
      });
    }

    const { message, sessionId } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const trimmedMsg = message.trim();
    // Session key: user ID if authenticated, else client-supplied sessionId or fallback
    const chatKey = req.user ? req.user._id.toString() : (sessionId || "anonymous");

    if (!sessions.has(chatKey)) {
      sessions.set(chatKey, []);
    }
    const sessionHistory = sessions.get(chatKey);

    // Limit previous context to last MAX_HISTORY messages
    const recentHistory = sessionHistory.slice(-MAX_HISTORY);

    // Build messages payload for Groq
    const groqMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...recentHistory,
      { role: "user", content: trimmedMsg },
    ];

    const reply = await callGroqApi(groqMessages);

    // Update session history
    sessionHistory.push(
      { role: "user", content: trimmedMsg },
      { role: "assistant", content: reply }
    );

    if (sessionHistory.length > MAX_HISTORY) {
      sessionHistory.splice(0, sessionHistory.length - MAX_HISTORY);
    }

    return res.json({ reply, message: reply });
  } catch (error) {
    console.error("PawBuddy (Groq) Error:", error.status || 500, error.message);

    if (error.status === 429 || error?.message?.includes("429") || error?.message?.includes("rate")) {
      const msg = "PawBuddy is taking a quick 30-second breather! Please try again in a moment. 🐾";
      return res.status(429).json({ message: msg, reply: msg });
    }

    const fallbackMsg = "Sorry, PawBuddy couldn't process your question right now. Please try again in a moment! 🐾";
    return res.status(error.status || 500).json({ message: fallbackMsg, reply: fallbackMsg });
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
