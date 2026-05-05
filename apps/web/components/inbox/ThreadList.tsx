"use client";
import { formatDistanceToNow } from "date-fns";
import { useThreads } from "@/lib/hooks/useInbox";

interface Thread {
  id: string;
  candidateName: string;
  lastMessage: string;
  lastTs: string;
  channel: "sms" | "email";
  unread: boolean;
}

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
  campaignId?: string;
}

const CHANNEL_BADGE = { sms: "SMS", email: "Email" };

export default function ThreadList({ selectedId, onSelect, campaignId }: Props) {
  const { data: threads = [], isLoading } = useThreads(campaignId);

  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-white/10 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {(threads as Thread[]).length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No conversations yet.</p>
      )}
      {(threads as Thread[]).map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
            selectedId === t.id ? "bg-brand-500/20" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {t.unread && (
                <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />
              )}
              <p
                className={`text-sm truncate ${
                  t.unread ? "font-semibold text-white" : "text-gray-200"
                }`}
              >
                {t.candidateName}
              </p>
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {formatDistanceToNow(new Date(t.lastTs), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs px-1.5 py-0.5 bg-white/10 text-gray-500 rounded">
              {CHANNEL_BADGE[t.channel]}
            </span>
            <p className="text-xs text-gray-400 truncate">{t.lastMessage}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
