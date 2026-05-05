import Link from "next/link";

export interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  score: number;
  status: string;
  campaign: string;
}

export default function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <Link
      href={`/candidates/${candidate.id}`}
      className="flex items-center gap-4 glass-card rounded-xl p-4 hover:border-brand-400 hover:bg-white/5 transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-400 font-bold text-sm shrink-0">
        {candidate.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{candidate.name}</p>
        <p className="text-xs text-gray-400 truncate">{candidate.title} · {candidate.location}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-brand-400">{candidate.score}<span className="text-xs text-gray-500">/100</span></p>
        <p className="text-xs text-gray-500">{candidate.status}</p>
      </div>
    </Link>
  );
}
