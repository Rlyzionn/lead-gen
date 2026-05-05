import Link from "next/link";
import CampaignsList from "@/components/campaigns/CampaignsList";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600"
        >
          New Campaign
        </Link>
      </div>
      <CampaignsList />
    </div>
  );
}
