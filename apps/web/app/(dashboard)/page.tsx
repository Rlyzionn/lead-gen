import Link from "next/link";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import MetricsRow from "@/components/dashboard/MetricsRow";
import TopCandidates from "@/components/dashboard/TopCandidates";
import AgentStatusStrip from "@/components/dashboard/AgentStatusStrip";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm tracking-tight">Command Center</h1>
        <Link
          href="/agents"
          className="text-sm px-4 py-2 rounded-full glass-button font-medium text-white shadow-sm self-start sm:self-auto whitespace-nowrap"
        >
          View pipeline →
        </Link>
      </div>
      <AgentStatusStrip />
      <MetricsRow />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7">
          <TopCandidates />
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
