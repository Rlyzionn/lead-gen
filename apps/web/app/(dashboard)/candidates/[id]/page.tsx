import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CandidateProfile from "@/components/candidates/CandidateProfile";
import ScoreBreakdown from "@/components/candidates/ScoreBreakdown";
import MessageHistory from "@/components/inbox/MessageHistory";

interface Props {
  params: { id: string };
}

export default function CandidateDetailPage({ params }: Props) {
  return (
    <div className="space-y-4">
      <Link
        href="/candidates"
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-200"
      >
        <ArrowLeft size={14} />
        Back to candidates
      </Link>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <ScoreBreakdown candidateId={params.id} />
          <CandidateProfile candidateId={params.id} />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <MessageHistory candidateId={params.id} />
        </div>
      </div>
    </div>
  );
}
