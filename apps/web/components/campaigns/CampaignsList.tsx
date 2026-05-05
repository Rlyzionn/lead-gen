"use client";
import { useCampaigns } from "@/lib/hooks/useCampaigns";
import CampaignCard from "./CampaignCard";

interface CampaignWithStats {
  id: string;
  name: string;
  status: string;
  stats?: {
    sourced: number;
    qualified: number;
    sent: number;
    replied: number;
    booked: number;
  };
}

export default function CampaignsList() {
  const { data: campaigns = [], isLoading } = useCampaigns();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 bg-white/10 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-sm mb-4">No campaigns yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {(campaigns as unknown as CampaignWithStats[]).map((c) => (
        <CampaignCard
          key={c.id}
          campaign={{
            id: c.id,
            name: c.name,
            status: c.status as any,
            sourced: c.stats?.sourced ?? 0,
            qualified: c.stats?.qualified ?? 0,
            sent: c.stats?.sent ?? 0,
            replied: c.stats?.replied ?? 0,
          }}
        />
      ))}
    </div>
  );
}
