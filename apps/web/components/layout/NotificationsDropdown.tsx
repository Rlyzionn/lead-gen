"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, X, CheckCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ActivityEvent {
  id: string;
  type: string;
  candidateId: string | null;
  candidateName: string | null;
  detail: string | null;
  ts: string;
}

const TYPE_LABEL: Record<string, string> = {
  sourced: "Sourced",
  enriched: "Enriched",
  qualified: "Qualified",
  disqualified: "Disqualified",
  sent: "Outreach sent",
  replied: "Reply received",
  booked: "Meeting booked",
  synced: "CRM sync",
  error: "Error",
};

const TYPE_DOT: Record<string, string> = {
  sourced: "bg-blue-400",
  enriched: "bg-indigo-400",
  qualified: "bg-green-400",
  disqualified: "bg-orange-400",
  sent: "bg-purple-400",
  replied: "bg-yellow-400",
  booked: "bg-emerald-400",
  synced: "bg-gray-400",
  error: "bg-red-400",
};

const NOTIFY_TYPES = new Set(["replied", "booked", "qualified", "error"]);

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: events = [] } = useQuery<ActivityEvent[]>({
    queryKey: ["activity"],
    queryFn: () => api.get("/activity").then((r) => r.data),
    refetchInterval: 30_000,
  });

  // Notifications = important activity events not dismissed
  const notifications = events
    .filter((e) => NOTIFY_TYPES.has(e.type) && !dismissedIds.has(e.id))
    .slice(0, 20);

  const unreadCount = notifications.length;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function dismissOne(id: string) {
    setDismissedIds((s) => new Set(s).add(id));
  }

  function dismissAll() {
    setDismissedIds((s) => {
      const next = new Set(s);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2.5 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-gray-700 transition-all duration-300 shadow-sm"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] glass-dropdown rounded-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-gray-300" />
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-gray-400">({unreadCount})</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={dismissAll}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-gray-400">You're all caught up.</p>
                <p className="text-xs text-gray-500 mt-1">
                  We'll notify you when candidates reply, book, or need attention.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  event={n}
                  onDismiss={() => dismissOne(n.id)}
                  onClose={() => setOpen(false)}
                />
              ))
            )}
          </div>

          <Link
            href="/inbox"
            onClick={() => setOpen(false)}
            className="block text-center text-xs text-blue-400 hover:text-blue-300 py-3 border-t border-white/10"
          >
            Open Inbox →
          </Link>
        </div>
      )}
    </div>
  );
}

function NotificationRow({
  event,
  onDismiss,
  onClose,
}: {
  event: ActivityEvent;
  onDismiss: () => void;
  onClose: () => void;
}) {
  const href = event.candidateId ? `/candidates/${event.candidateId}` : "/inbox";
  const dot = TYPE_DOT[event.type] ?? "bg-gray-400";
  const label = TYPE_LABEL[event.type] ?? event.type;
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group">
      <span className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", dot)} />
      <Link href={href} onClick={onClose} className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white truncate">
            {event.candidateName ?? "System"}
          </p>
          <span className="text-xs text-gray-500 shrink-0">{label}</span>
        </div>
        {event.detail && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{event.detail}</p>
        )}
        <p className="text-xs text-gray-500 mt-0.5">
          {formatDistanceToNow(new Date(event.ts), { addSuffix: true })}
        </p>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss();
        }}
        className="p-1 text-gray-500 hover:text-white transition-opacity shrink-0"
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </div>
  );
}
