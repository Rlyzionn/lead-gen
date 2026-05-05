"use client";
import Link from "next/link";
import { useCandidates } from "@/lib/hooks/useCandidates";
import type { Candidate } from "@hha/shared";

export default function TopCandidates() {
  const { data: candidates = [], isLoading } = useCandidates({ status: "qualified" });

  const top = [...candidates]
    .sort((a: Candidate, b: Candidate) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 8);

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-lg border border-white/40">
      <div className="px-5 py-4 border-b border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-between">
        <h2 className="font-semibold text-sm text-gray-100 drop-shadow-sm">Top Candidates</h2>
        <Link href="/candidates" className="text-xs text-brand-600 font-medium hover:text-brand-400 hover:underline">
          View all
        </Link>
      </div>
      <div className="divide-y divide-white/10 p-1">
        {isLoading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-white/10 rounded animate-pulse" />
            ))}
          </div>
        )}
        {!isLoading && top.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">
            No qualified candidates yet.
          </p>
        )}
        {top.map((c: Candidate) => (
          <div key={c.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/20 transition-colors duration-200 rounded-xl mx-2 my-1">
            <div className="flex-1 min-w-0">
              <Link
                href={`/candidates/${c.id}`}
                className="text-sm font-medium text-white hover:text-brand-500 truncate block"
              >
                {c.name}
              </Link>
              <p className="text-xs text-gray-500">{c.title ?? "—"}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 shrink-0">
              {c.status}
            </span>
            <div className="w-12 text-right shrink-0">
              <span className="text-sm font-bold text-brand-400">{c.score ?? "—"}</span>
              {c.score != null && <span className="text-xs text-gray-400">/100</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
