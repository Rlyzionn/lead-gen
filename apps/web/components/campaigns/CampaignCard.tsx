"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MoreVertical, Pencil, Trash2, ExternalLink } from "lucide-react";
import { useDeleteCampaign } from "@/lib/hooks/useCampaigns";

interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "draft";
  sourced: number;
  qualified: number;
  sent: number;
  replied: number;
}

const STATUS_COLOR = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  draft: "bg-white/10 text-gray-300",
};

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate: deleteCampaign, isPending: deleting } = useDeleteCampaign();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    deleteCampaign(campaign.id);
    setMenuOpen(false);
  }

  return (
    <div className="relative group">
      <Link
        href={`/campaigns/${campaign.id}`}
        className="block glass-card rounded-xl border border-white/10 p-5 hover:border-brand-400 transition-colors"
      >
        <div className="flex items-start justify-between mb-4 gap-2">
          {/* pr leaves space so title doesn't run under the absolute-positioned actions row */}
          <h3 className="font-semibold text-white pr-20 sm:pr-24 break-words">{campaign.name}</h3>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Sourced", value: campaign.sourced },
            { label: "Qualified", value: campaign.qualified },
            { label: "Sent", value: campaign.sent },
            { label: "Replied", value: campaign.replied },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </Link>

      {/* Top-right cluster: status pill + kebab — always sit together, never overlap */}
      <div ref={menuRef} className="absolute top-3 right-3 flex items-center gap-1.5">
        <span
          className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[campaign.status]}`}
        >
          {campaign.status}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Campaign actions"
        >
          <MoreVertical size={14} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-8 w-44 glass-dropdown rounded-lg z-20 overflow-hidden">
            <Link
              href={`/campaigns/${campaign.id}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
            >
              <ExternalLink size={13} /> Open
            </Link>
            <Link
              href={`/campaigns/${campaign.id}?edit=1`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
            >
              <Pencil size={13} /> Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                confirming
                  ? "bg-red-500/20 text-red-300"
                  : "text-red-400 hover:bg-red-500/10"
              } disabled:opacity-50`}
            >
              <Trash2 size={13} />
              {deleting ? "Deleting…" : confirming ? "Click again to confirm" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
