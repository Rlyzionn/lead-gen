import CampaignBuilder from "@/components/campaigns/CampaignBuilder";

export default function NewCampaignPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-white">New Campaign</h1>
      <CampaignBuilder />
    </div>
  );
}
