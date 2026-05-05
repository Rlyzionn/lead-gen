import CandidateList from "@/components/candidates/CandidateList";

export default function CandidatesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white drop-shadow-sm tracking-tight">Candidates</h1>
      <CandidateList />
    </div>
  );
}
