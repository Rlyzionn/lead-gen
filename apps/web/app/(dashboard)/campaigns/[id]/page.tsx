import CandidatePipeline from "@/components/candidates/CandidatePipeline";
import CampaignHeader from "@/components/campaigns/CampaignHeader";

interface Props {
  params: { id: string };
}

export default function CampaignDetailPage({ params }: Props) {
  return (
    <div className="space-y-6">
      <CampaignHeader campaignId={params.id} />
      <CandidatePipeline campaignId={params.id} />
    </div>
  );
}
