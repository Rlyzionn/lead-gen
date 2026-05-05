"use client";
import { useState } from "react";

interface Props {
  campaignBrief: Record<string, unknown>;
  onNext: (data: { prompt: string; threshold: number }) => void;
}

export default function IdealRecruitProfile({ campaignBrief, onNext }: Props) {
  const [prompt, setPrompt] = useState(
    (campaignBrief.irpPrompt as string) ?? ""
  );
  const [threshold, setThreshold] = useState<number>(
    (campaignBrief.threshold as number) ?? 70
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Ideal Recruit Profile Prompt
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Candidates scoring ≥ threshold proceed to outreach. All others are
          filtered before stack-ranking.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          className="w-full border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-brand-500 font-mono"
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-200">
          Score Threshold:{" "}
          <span className="text-brand-500">{threshold}</span>/100
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="flex-1"
        />
      </div>
      <div className="border border-dashed border-white/10 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-300 mb-1">
          Past Placement Learning (optional)
        </p>
        <p className="text-xs text-gray-400 mb-2">
          Upload a CSV of past successful placements — used as few-shot examples
          during scoring.
        </p>
        <input type="file" accept=".csv" className="text-xs text-gray-500" />
      </div>
      <button
        onClick={() => onNext({ prompt, threshold })}
        className="px-6 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium"
      >
        Next: Outreach Cadence →
      </button>
    </div>
  );
}
