"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getPusher } from "@/lib/pusher";

const AGENTS = [
  "sourcing",
  "enrichment",
  "qualification",
  "personalization",
  "sending",
  "calling",
] as const;
type AgentName = (typeof AGENTS)[number];

interface AgentState {
  name: AgentName;
  active: boolean;
  count: number;
}

export default function AgentStatusStrip() {
  const [agents, setAgents] = useState<AgentState[]>(
    AGENTS.map((name) => ({ name, active: false, count: 0 }))
  );

  useEffect(() => {
    const pusher = getPusher();
    const channel = pusher.subscribe("agents");

    channel.bind("status", (data: { agent: string; active: boolean; count?: number }) => {
      setAgents((prev) =>
        prev.map((a) =>
          a.name === data.agent
            ? { ...a, active: data.active, count: data.count ?? a.count }
            : a
        )
      );
      // Auto-clear active state after 8s of no updates
      if (data.active) {
        setTimeout(() => {
          setAgents((prev) =>
            prev.map((a) => (a.name === data.agent ? { ...a, active: false } : a))
          );
        }, 8_000);
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("agents");
    };
  }, []);

  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {agents.map((agent) => (
        <div
          key={agent.name}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border backdrop-blur-md transition-all duration-300 shadow-sm",
            agent.active
              ? "bg-green-400/20 border-green-400/50 text-green-900 drop-shadow-sm"
              : "bg-white/30 border-white/40 text-gray-200 hover:bg-white/40"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              agent.active ? "bg-green-500 animate-pulse" : "bg-gray-300"
            )}
          />
          {agent.name}
          {agent.active && agent.count > 0 && (
            <span className="ml-1 text-green-600">({agent.count})</span>
          )}
        </div>
      ))}
    </div>
  );
}
