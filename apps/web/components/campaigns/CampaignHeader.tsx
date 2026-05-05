"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Pause,
  Play,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
  usePauseCampaign,
  useForceCampaignSync,
} from "@/lib/hooks/useCampaigns";

interface Props {
  campaignId: string;
}

const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-500/15 text-green-300 border border-green-500/30",
  paused: "bg-yellow-500/15 text-yellow-300 border border-yellow-500/30",
  draft: "bg-white/10 text-gray-300 border border-white/10",
  completed: "bg-gray-500/15 text-gray-300 border border-gray-500/30",
};

export default function CampaignHeader({ campaignId }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const editParam = params.get("edit") === "1";

  const { data: campaign, isLoading } = useCampaign(campaignId);
  const { mutate: update, isPending: saving } = useUpdateCampaign(campaignId);
  const { mutate: del, isPending: deleting } = useDeleteCampaign();
  const { mutate: pauseToggle } = usePauseCampaign(campaignId);
  const { mutate: forceSync, isPending: syncing } = useForceCampaignSync(campaignId);

  const [editing, setEditing] = useState(editParam);
  const [confirming, setConfirming] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sourcingSpec: "",
    irpPrompt: "",
    threshold: 70,
  });

  useEffect(() => {
    if (campaign) {
      setForm({
        name: campaign.name,
        sourcingSpec: campaign.sourcingSpec ?? "",
        irpPrompt: campaign.irpPrompt ?? "",
        threshold: campaign.threshold ?? 70,
      });
    }
  }, [campaign]);

  useEffect(() => {
    if (editParam) setEditing(true);
  }, [editParam]);

  if (isLoading) {
    return <div className="glass-card rounded-xl h-24 animate-pulse" />;
  }
  if (!campaign) return null;

  function handleSave() {
    update(form, {
      onSuccess: () => {
        setEditing(false);
        // strip ?edit=1 from URL
        const next = new URLSearchParams(params.toString());
        next.delete("edit");
        router.replace(`?${next.toString()}`, { scroll: false });
      },
    });
  }

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    del(campaignId, {
      onSuccess: () => router.push("/campaigns"),
    });
  }

  function handlePauseResume() {
    pauseToggle();
  }

  return (
    <div className="space-y-3">
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white"
      >
        <ArrowLeft size={14} /> Back to campaigns
      </Link>

      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full text-2xl font-semibold text-white bg-transparent border-b border-white/20 focus:outline-none focus:border-brand-500 pb-1"
              />
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-semibold text-white">{campaign.name}</h1>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    STATUS_COLOR[campaign.status] ?? STATUS_COLOR.draft
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1 font-mono">
              ID: {campaign.id} · Created{" "}
              {new Date(campaign.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/5 flex items-center gap-1.5"
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 bg-brand-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save size={13} /> {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handlePauseResume}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-sm text-gray-200 hover:bg-white/5 flex items-center gap-1.5"
                >
                  {campaign.status === "paused" ? (
                    <>
                      <Play size={13} /> Resume
                    </>
                  ) : (
                    <>
                      <Pause size={13} /> Pause
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="px-3 py-1.5 border border-white/10 rounded-lg text-sm text-gray-200 hover:bg-white/5 flex items-center gap-1.5"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => forceSync()}
                  disabled={syncing}
                  className="px-3 py-1.5 bg-brand-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
                >
                  <RefreshCw
                    size={13}
                    className={syncing ? "animate-spin" : ""}
                  />
                  {syncing ? "Syncing…" : "Force CRM Sync"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 transition-colors ${
                    confirming
                      ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                  } disabled:opacity-50`}
                >
                  <Trash2 size={13} />
                  {deleting ? "Deleting…" : confirming ? "Confirm?" : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>

        {editing && (
          <div className="space-y-4 pt-3 border-t border-white/10">
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Sourcing spec (what to look for)
              </label>
              <textarea
                value={form.sourcingSpec}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sourcingSpec: e.target.value }))
                }
                rows={2}
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm bg-white/5 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1">
                Ideal Recruit Profile (IRP) prompt
              </label>
              <textarea
                value={form.irpPrompt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, irpPrompt: e.target.value }))
                }
                rows={6}
                className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm bg-white/5 text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-300">
                  Qualification threshold
                </label>
                <span className="text-xs font-mono text-brand-400">
                  {form.threshold}/100
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={form.threshold}
                onChange={(e) =>
                  setForm((f) => ({ ...f, threshold: Number(e.target.value) }))
                }
                className="w-full accent-brand-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
