"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCandidates } from "@/lib/hooks/useCandidates";
import CandidateCard from "./CandidateCard";
import type { Candidate } from "@hha/shared";

const STATUSES = [
  "all",
  "sourced",
  "enriched",
  "qualified",
  "disqualified",
  "personalized",
  "sent",
  "replied",
  "booked",
  "synced",
];

export default function CandidateList({ campaignId }: { campaignId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status") ?? "all";
  const urlSearch = searchParams.get("search") ?? "";

  const [search, setSearch] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState(urlStatus);

  // Re-sync from URL when it changes (e.g. user clicks a metric card from elsewhere)
  useEffect(() => {
    setStatusFilter(urlStatus);
  }, [urlStatus]);

  // Push filter changes back into the URL so refreshes / sharing keep the filter
  function changeStatus(next: string) {
    setStatusFilter(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("status");
    else params.set("status", next);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  // The "synced" pseudo-filter is handled client-side: candidate.dynamicsSyncedAt != null
  const apiStatus =
    statusFilter === "all" || statusFilter === "synced" ? undefined : statusFilter;

  const { data: candidates = [], isLoading } = useCandidates({
    status: apiStatus,
    campaignId,
  });

  let filtered = candidates;
  if (statusFilter === "synced") {
    filtered = candidates.filter((c: Candidate) => !!c.dynamicsSyncedAt);
  }
  if (search) {
    filtered = filtered.filter((c: Candidate) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search candidates…"
          className="flex-1 glass-input rounded-lg px-3 py-2 text-sm text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => changeStatus(e.target.value)}
          className="glass-input rounded-lg px-3 py-2 text-sm text-white"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "synced"
                ? "In CRM"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter chip — shows what's currently applied */}
      {statusFilter !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Filtering:</span>
          <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-brand-500/15 text-brand-300 border border-brand-500/30">
            {statusFilter === "synced"
              ? "In CRM"
              : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            <button
              onClick={() => changeStatus("all")}
              className="hover:text-white"
              aria-label="Clear filter"
            >
              ×
            </button>
          </span>
          <span className="text-xs text-gray-500">
            {filtered.length} {filtered.length === 1 ? "candidate" : "candidates"}
          </span>
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />
          ))}
        </div>
      )}
      {!isLoading && filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">
          No candidates found.
        </p>
      )}
      {filtered.map((c: Candidate) => (
        <CandidateCard
          key={c.id}
          candidate={{
            id: c.id,
            name: c.name,
            title: c.title ?? "",
            location: c.location ?? "",
            score: c.score ?? 0,
            status: c.status,
            campaign: c.campaignId,
          }}
        />
      ))}
    </div>
  );
}
