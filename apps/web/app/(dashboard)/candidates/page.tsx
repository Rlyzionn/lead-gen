import CandidateList from "@/components/candidates/CandidateList";

// CandidateList reads ?status= from the URL via useSearchParams,
// so this route must render at request time (not pre-built).
export const dynamic = "force-dynamic";

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm tracking-tight">Candidates</h1>
      <CandidateList />
    </div>
  );
}
