"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { getPusher } from "@/lib/pusher";
import { api } from "@/lib/api";
import type { ActivityEvent } from "@hha/shared";

const TYPE_COLORS: Record<string, string> = {
  sourced: "bg-blue-500/20 text-blue-400",
  qualified: "bg-green-100 text-green-700",
  sent: "bg-purple-100 text-purple-700",
  replied: "bg-yellow-100 text-yellow-700",
  booked: "bg-emerald-100 text-emerald-700",
  error: "bg-red-100 text-red-700",
  synced: "bg-white/10 text-gray-200",
  enriched: "bg-indigo-100 text-indigo-700",
  disqualified: "bg-orange-100 text-orange-700",
};

export default function ActivityFeed() {
  const { data: initial = [] } = useQuery<ActivityEvent[]>({
    queryKey: ["activity"],
    queryFn: () => api.get("/activity").then((r) => r.data),
  });

  const [events, setEvents] = useState<ActivityEvent[]>([]);

  // Seed from initial fetch, then prepend live events
  useEffect(() => {
    setEvents(initial);
  }, [initial]);

  useEffect(() => {
    const pusher = getPusher();
    const channel = pusher.subscribe("activity");
    channel.bind("event", (data: ActivityEvent) => {
      setEvents((prev) => [data, ...prev].slice(0, 100));
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe("activity");
    };
  }, []);

  return (
    <div className="glass-card rounded-2xl h-96 flex flex-col overflow-hidden shadow-lg border border-white/40">
      <div className="px-5 py-4 border-b border-white/20 bg-white/10 backdrop-blur-md">
        <h2 className="font-semibold text-sm text-gray-100 drop-shadow-sm">Live Activity</h2>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-white/10 p-1">
        {events.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">No activity yet.</p>
        )}
        {events.map((ev) => (
          <div key={ev.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/20 transition-colors duration-200 rounded-xl mx-2 my-1">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                TYPE_COLORS[ev.type] ?? "bg-white/10 text-gray-300"
              }`}
            >
              {ev.type}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {ev.candidateName}
              </p>
              {ev.detail && (
                <p className="text-xs text-gray-500 truncate">{ev.detail}</p>
              )}
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {formatDistanceToNow(new Date(ev.ts), { addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
