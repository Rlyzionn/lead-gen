import Link from "next/link";
import CampaignsList from "@/components/campaigns/CampaignsList";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-white">Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 self-start sm:self-auto whitespace-nowrap"
        >
          New Campaign
        </Link>
      </div>
      <CampaignsList />
    </div>
  );
}
