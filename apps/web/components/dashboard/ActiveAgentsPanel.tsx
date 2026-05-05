"use client";
import { useAgentStats, type AgentStat } from "@/lib/hooks/useMetrics";
import { Globe, Users, ShieldCheck, Sparkles, Mail, Phone, Calendar, Sparkle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  globe: Globe,
  users: Users,
  "shield-check": ShieldCheck,
  sparkles: Sparkles,
  mail: Mail,
  phone: Phone,
  calendar: Calendar,
};

const ACCENT_STYLES: Record<
  AgentStat["accent"],
  { iconBg: string; iconColor: string; bar: string; ring: string; pct: string }
> = {
  blue: {
    iconBg: "bg-white/5",
    iconColor: "text-white",
    bar: "bg-brand-500",
    ring: "ring-white/10",
    pct: "text-brand-400",
  },
  green: {
    iconBg: "bg-white/5",
    iconColor: "text-white",
    bar: "bg-brand-500",
    ring: "ring-white/10",
    pct: "text-brand-400",
  },
  purple: {
    iconBg: "bg-white/5",
    iconColor: "text-white",
    bar: "bg-brand-500",
    ring: "ring-white/10",
    pct: "text-brand-400",
  },
  pink: {
    iconBg: "bg-white/5",
    iconColor: "text-white",
    bar: "bg-brand-500",
    ring: "ring-white/10",
    pct: "text-brand-400",
  },
  yellow: {
    iconBg: "bg-white/5",
    iconColor: "text-white",
    bar: "bg-brand-500",
    ring: "ring-white/10",
    pct: "text-brand-400",
  },
  emerald: {
    iconBg: "bg-white/5",
    iconColor: "text-white",
    bar: "bg-brand-500",
    ring: "ring-white/10",
    pct: "text-brand-400",
  },
};

export default function ActiveAgentsPanel({ campaignId }: { campaignId?: string }) {
  const { data, isLoading } = useAgentStats(campaignId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Active Agents</h2>
          <p className="text-sm text-gray-400 mt-1">
            Autonomous workflow pipeline — every node is an AI agent
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-medium">
          <Sparkle size={14} className="text-brand-400" />
          {data ? `${data.activeCount}/${data.totalCount}` : "—"} Agents Active
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 glass-card rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <div className="flex flex-col items-stretch max-w-3xl mx-auto">
          {data.agents.map((agent, idx) => (
            <div key={agent.key} className="flex flex-col items-center">
              <AgentCard agent={agent} />
              {idx < data.agents.length - 1 && (
                <div className="text-gray-200 my-2 text-lg leading-none">↓</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentStat }) {
  const Icon = ICONS[agent.icon] ?? Sparkles;
  const accent = ACCENT_STYLES[agent.accent];
  const isRunning = agent.status === "running";
  const pct = Math.min(100, Math.round((agent.processed / Math.max(agent.total, 1)) * 100));

  return (
    <div
      className={cn(
        "w-full glass-card rounded-xl p-5",
        isRunning ? `border-gray-800 ${accent.ring} ring-1` : "border-white/5 opacity-80 hover:opacity-100 transition-opacity"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", accent.iconBg)}>
          <Icon size={20} className={accent.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold">{agent.label}</h3>
            <span className={cn("w-1.5 h-1.5 rounded-full", isRunning ? "bg-brand-400 animate-pulse" : "bg-gray-600")} />
            {isRunning && (
              <span className="text-xs px-2 py-0.5 rounded-full border border-brand-500/40 text-brand-400 font-medium">
                Running
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{agent.description}</p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {agent.processed.toLocaleString()} / {agent.total.toLocaleString()} processed
              </span>
              <span className={cn("font-semibold", accent.pct)}>{pct}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", accent.bar)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
              <span>
                Success rate: <span className="text-gray-300 font-semibold">{agent.successRate}%</span>
              </span>
              <span>
                Throughput: <span className="text-gray-300 font-semibold">~{agent.throughputPerHour}/hr</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
