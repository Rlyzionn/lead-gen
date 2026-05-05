"use client";
import { useCandidateScore } from "@/lib/hooks/useCandidates";

interface Props {
  candidateId: string;
}

export default function ScoreBreakdown({ candidateId }: Props) {
  const { data, isLoading } = useCandidateScore(candidateId);

  return (
    <div className="glass-card rounded-xl border border-white/10 p-5">
      <h3 className="text-sm font-semibold text-white mb-3">IRP Score</h3>
      {isLoading ? (
        <div className="animate-pulse h-24 bg-white/10 rounded-lg" />
      ) : (
        <>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-bold text-brand-400">
              {data?.score ?? "—"}
            </span>
            {data?.score != null && (
              <span className="text-gray-400 text-sm mb-1">/ 100</span>
            )}
          </div>
          {data?.score != null && (
            <div className="mb-3">
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-brand-500 h-2 rounded-full"
                  style={{ width: `${data.score}%` }}
                />
              </div>
            </div>
          )}
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-300 mb-1">Reasoning</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              {data?.scoreReasoning ?? "No reasoning available."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
