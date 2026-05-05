"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  action?: { type: string; params: Record<string, unknown> } | null;
}

const EXAMPLE_QUERIES = [
  "How many of the 800 emails got replies?",
  "Show me qualified RNs in Texas who didn't reply to touch 1",
  "What's the reply rate on the 5-touch vs 3-touch template?",
  "Create a campaign targeting ICU nurses in Dallas",
  "Pause all sends for the Chicago campaign",
  "Force Dynamics sync for all candidates in the Dallas RN campaign",
];

export default function AICommandCenter() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.content, action: data.action ?? null },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full glass-card rounded-xl border border-white/10 overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Bot size={20} className="text-brand-500" />
              <p className="text-sm text-gray-200">
                Ask me anything about your campaigns, candidates, or metrics. I can also take actions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-left text-xs px-3 py-2 border border-white/10 rounded-lg text-gray-300 hover:border-brand-400 hover:text-brand-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-brand-500" />
              </div>
            )}
            <div
              className={`max-w-2xl px-4 py-3 rounded-xl text-sm ${
                m.role === "user"
                  ? "bg-brand-500 text-white"
                  : "bg-white/5 text-gray-100"
              }`}
            >
              {m.content}
              {m.action && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs font-medium text-yellow-800 mb-2">
                    Action: {m.action.type}
                  </p>
                  <button className="text-xs px-3 py-1 bg-yellow-500 text-white rounded-lg mr-2">
                    Confirm
                  </button>
                  <button className="text-xs px-3 py-1 border border-yellow-300 text-yellow-700 rounded-lg">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center">
              <Bot size={14} className="text-brand-500" />
            </div>
            <div className="px-4 py-3 bg-white/5 rounded-xl">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-white/5">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask a question or give a command…"
            className="flex-1 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-brand-500 text-white rounded-xl disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
