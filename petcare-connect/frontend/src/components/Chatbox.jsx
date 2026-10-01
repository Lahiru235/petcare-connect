import { useState, useRef, useEffect, useCallback } from "react";
import { chatApi } from "../api/services";
import { useAuth } from "../context/AuthContext";

/* ───────── tiny markdown-ish formatter ───────── */
const fmt = (text) =>
  text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br/>");

const GREETING = `Hey there! 🐾 I'm **PawBuddy**, your pet care assistant.\n\nAsk me anything about pet health, nutrition, grooming, training, or when to visit the vet!`;

// Generate a random session ID for anonymous users
const getSessionId = () => {
  let id = localStorage.getItem("pcc_chat_session");
  if (!id) {
    id = "anon_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("pcc_chat_session", id);
  }
  return id;
};

const Chatbox = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: GREETING, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Auto-retry with exponential backoff for 503 errors
  const sendToApi = useCallback(async (text, retries = 3) => {
    const sessionId = user ? undefined : getSessionId();
    for (let i = 0; i < retries; i++) {
      try {
        return await chatApi.send(text, sessionId);
      } catch (err) {
        const status = err?.response?.status;
        if ((status === 503 || status === 429) && i < retries - 1) {
          // Wait 3s, 6s, 12s before retrying
          await new Promise((r) => setTimeout(r, 3000 * Math.pow(2, i)));
          continue;
        }
        throw err;
      }
    }
  }, [user]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await sendToApi(text);
      setMessages((m) => [
        ...m,
        { role: "bot", text: data.reply, ts: Date.now() },
      ]);
      if (!open) setHasUnread(true);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "PawBuddy is experiencing high demand right now. Please wait a moment and try again! 🐾",
          ts: Date.now(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, open, sendToApi]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = async () => {
    try {
      const sessionId = user ? undefined : getSessionId();
      await chatApi.clear(sessionId);
    } catch {}
    setMessages([{ role: "bot", text: GREETING, ts: Date.now() }]);
  };

  const toggleOpen = () => {
    setOpen((o) => !o);
    setHasUnread(false);
  };

  const handleQuickQuestion = async (q) => {
    const userMsg = { role: "user", text: q, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);
    setInput("");
    try {
      const { data } = await sendToApi(q);
      setMessages((m) => [
        ...m,
        { role: "bot", text: data.reply, ts: Date.now() },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          text: "PawBuddy is experiencing high demand right now. Please wait a moment and try again! 🐾",
          ts: Date.now(),
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "What vaccines does my puppy need?",
    "Best diet for an indoor cat?",
    "How often should I groom my dog?",
  ];

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        className="chatbox-fab"
        onClick={toggleOpen}
        aria-label={open ? "Close chat" : "Open PawBuddy chat"}
        title="PawBuddy AI Assistant"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
              <circle cx="8" cy="10" r="1.2"/>
              <circle cx="12" cy="10" r="1.2"/>
              <circle cx="16" cy="10" r="1.2"/>
            </svg>
            {hasUnread && <span className="chatbox-unread-dot" />}
          </>
        )}
      </button>

      {/* ── Chat Window ── */}
      <div className={`chatbox-window ${open ? "chatbox-open" : ""}`}>
        {/* Header */}
        <div className="chatbox-header">
          <div className="chatbox-header-info">
            <span className="chatbox-header-avatar">🐾</span>
            <div>
              <strong className="chatbox-header-name">PawBuddy</strong>
              <span className="chatbox-header-status">
                <span className="chatbox-status-dot" />
                Online · AI Pet Assistant
              </span>
            </div>
          </div>
          <div className="chatbox-header-actions">
            <button
              className="chatbox-icon-btn"
              onClick={clearChat}
              title="Clear chat"
              aria-label="Clear chat history"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
            <button
              className="chatbox-icon-btn"
              onClick={toggleOpen}
              title="Close chat"
              aria-label="Close chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbox-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chatbox-msg chatbox-msg-${m.role} ${m.error ? "chatbox-msg-error" : ""}`}>
              {m.role === "bot" && <span className="chatbox-msg-avatar">🐾</span>}
              <div
                className="chatbox-msg-bubble"
                dangerouslySetInnerHTML={{ __html: fmt(m.text) }}
              />
            </div>
          ))}

          {loading && (
            <div className="chatbox-msg chatbox-msg-bot">
              <span className="chatbox-msg-avatar">🐾</span>
              <div className="chatbox-msg-bubble chatbox-typing">
                <span className="chatbox-dot" />
                <span className="chatbox-dot" />
                <span className="chatbox-dot" />
              </div>
            </div>
          )}

          {/* Quick question chips — show only when there's just the greeting */}
          {messages.length === 1 && !loading && (
            <div className="chatbox-quick">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  className="chatbox-quick-btn"
                  onClick={() => handleQuickQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chatbox-input-bar">
          <textarea
            ref={inputRef}
            className="chatbox-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about pet care..."
            rows={1}
            disabled={loading}
          />
          <button
            className="chatbox-send-btn"
            onClick={send}
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbox;
