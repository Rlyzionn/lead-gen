"use client";
import { useCampaignCandidates } from "@/lib/hooks/useCampaigns";
import CandidateCard from "./CandidateCard";
import type { Candidate } from "@hha/shared";

interface Props {
  campaignId: string;
}

export default function CandidatePipeline({ campaignId }: Props) {
  const { data: candidates = [], isLoading } = useCampaignCandidates(campaignId);

  return (
    <div className="glass-card rounded-xl border border-white/10">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Candidate Pipeline</h2>
        <span className="text-xs text-gray-400">{candidates.length} candidates</span>
      </div>
      <div className="p-4 space-y-3">
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/10 rounded-xl animate-pulse" />
            ))}
          </div>
        )}
        {!isLoading && candidates.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No candidates yet — sourcing will begin automatically.
          </p>
        )}
        {(candidates as Candidate[]).map((c) => (
          <CandidateCard
            key={c.id}
            candidate={{
              id: c.id,
              name: c.name,
              title: c.title ?? "",
              location: c.location ?? "",
              score: c.score ?? 0,
              status: c.status,
              campaign: campaignId,
            }}
          />
        ))}
      </div>
    </div>
  );
}
