"use client";
import { useEffect, useState } from "react";
import { Send, Bot, User } from "lucide-react";
import { useCandidateMessages } from "@/lib/hooks/useCandidates";
import { useSendReply, useAiDraft, useMarkRead } from "@/lib/hooks/useInbox";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@hha/shared";

interface Props {
  threadId: string;
}

export default function MessageThread({ threadId }: Props) {
  const [aiMode, setAiMode] = useState(true);
  const [channel, setChannel] = useState<"sms" | "email">("sms");
  const [draft, setDraft] = useState("");

  const { data: messages = [], isLoading } = useCandidateMessages(threadId);
  const { data: aiDraft } = useAiDraft(aiMode ? threadId : null);
  const { mutate: sendReply, isPending: sending } = useSendReply(threadId);
  const { mutate: markRead } = useMarkRead(threadId);

  // Pre-fill draft with AI suggestion
  useEffect(() => {
    if (aiMode && aiDraft && !draft) setDraft(aiDraft);
  }, [aiDraft, aiMode]);

  // Mark thread as read when opened
  useEffect(() => {
    markRead();
  }, [threadId]);

  function handleSend() {
    if (!draft.trim() || sending) return;
    sendReply({ body: draft, channel });
    setDraft("");
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex gap-2">
          {(["sms", "email"] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                channel === ch
                  ? "border-brand-500 bg-brand-500/20 text-brand-400"
                  : "border-white/10 text-gray-300 hover:bg-white/5"
              }`}
            >
              {ch.toUpperCase()}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
          {aiMode ? <Bot size={14} /> : <User size={14} />}
          <input
            type="checkbox"
            checked={aiMode}
            onChange={(e) => setAiMode(e.target.checked)}
            className="rounded"
          />
          AI mode
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <p className="text-sm text-gray-400 text-center">Loading…</p>}
        {!isLoading && (messages as Message[]).length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>
        )}
        {(messages as Message[]).map((m) => (
          <div
            key={m.id}
            className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-sm px-3 py-2 rounded-xl text-sm ${
                m.direction === "outbound"
                  ? "bg-brand-500 text-white"
                  : "bg-white/10 text-gray-100"
              }`}
            >
              <p>{m.body}</p>
              <p
                className={`text-xs mt-1 ${
                  m.direction === "outbound" ? "text-brand-200" : "text-gray-400"
                }`}
              >
                {formatDistanceToNow(new Date(m.sentAt), { addSuffix: true })} ·{" "}
                {m.channel}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-white/5">
        {aiMode && aiDraft && (
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Bot size={12} /> AI draft loaded — edit or send as-is
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            rows={2}
            placeholder="Write a message…"
            className="flex-1 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-500"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="px-4 py-2 bg-brand-500 text-white rounded-lg disabled:opacity-50 self-end"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
