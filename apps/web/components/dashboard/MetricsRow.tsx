"use client";
import Link from "next/link";
import { useDashboardMetrics } from "@/lib/hooks/useMetrics";

export default function MetricsRow({ campaignId }: { campaignId?: string }) {
  const { data: metrics = [], isLoading } = useDashboardMetrics(campaignId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="glass-card p-5 animate-pulse h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {(metrics as { label: string; value: number; href: string }[]).map((m) => (
        <Link
          key={m.label}
          href={m.href}
          className="glass-card p-5 rounded-2xl hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
        >
          {/* subtle glow on hover */}
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
          <p className="text-xs font-medium text-gray-300/80 mb-1 relative z-10">{m.label}</p>
          <p className="text-3xl font-bold text-gray-100 drop-shadow-sm relative z-10">{m.value.toLocaleString()}</p>
        </Link>
      ))}
    </div>
  );
}
