"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateCampaign } from "@/lib/hooks/useCampaigns";
import TranscriptParser from "./TranscriptParser";
import IdealRecruitProfile from "./IdealRecruitProfile";
import CadenceBuilder from "./CadenceBuilder";

type Step = "input" | "irp" | "cadence" | "review";

export default function CampaignBuilder() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("input");
  const [campaignBrief, setCampaignBrief] = useState<Record<string, unknown> | null>(null);
  const [irpData, setIrpData] = useState<{ prompt: string; threshold: number } | null>(null);
  const [cadenceData, setCadenceData] = useState<Record<string, unknown> | null>(null);

  const { mutate: createCampaign, isPending } = useCreateCampaign();

  function handleLaunch() {
    createCampaign(
      {
        name: (campaignBrief?.role as string) ?? "New Campaign",
        irpPrompt: irpData?.prompt,
        threshold: irpData?.threshold,
        ...(cadenceData ?? {}),
        sourcingSpec: JSON.stringify(campaignBrief),
      } as any,
      {
        onSuccess: (campaign: any) => router.push(`/campaigns/${campaign.id}`),
      }
    );
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 p-6 space-y-6">
      <ol className="flex gap-6 text-sm">
        {(["input", "irp", "cadence", "review"] as Step[]).map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-2 ${
              step === s ? "text-brand-500 font-medium" : "text-gray-400"
            }`}
          >
            <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs">
              {i + 1}
            </span>
            {{ input: "Describe Role", irp: "Ideal Recruit Profile", cadence: "Outreach Cadence", review: "Review & Launch" }[s]}
          </li>
        ))}
      </ol>

      {step === "input" && (
        <TranscriptParser
          onParsed={(brief) => {
            setCampaignBrief(brief);
            setStep("irp");
          }}
        />
      )}
      {step === "irp" && campaignBrief && (
        <IdealRecruitProfile
          campaignBrief={campaignBrief}
          onNext={(data) => {
            setIrpData(data);
            setStep("cadence");
          }}
        />
      )}
      {step === "cadence" && (
        <CadenceBuilder
          onNext={(data) => {
            setCadenceData(data);
            setStep("review");
          }}
        />
      )}
      {step === "review" && (
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-5 space-y-3 text-sm">
            <h3 className="font-medium text-white">Campaign Summary</h3>
            <p><span className="text-gray-500">Role:</span> {campaignBrief?.role as string ?? "—"}</p>
            <p><span className="text-gray-500">IRP Threshold:</span> {irpData?.threshold ?? "—"}/100</p>
            <p><span className="text-gray-500">Template:</span> {(cadenceData?.cadenceTemplate as string) ?? "—"}</p>
          </div>
          <button
            onClick={handleLaunch}
            disabled={isPending}
            className="px-6 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {isPending ? "Launching…" : "Launch Campaign"}
          </button>
        </div>
      )}
    </div>
  );
}
