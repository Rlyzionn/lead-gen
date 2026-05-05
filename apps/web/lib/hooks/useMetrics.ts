import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDashboardMetrics(campaignId?: string) {
  return useQuery({
    queryKey: ["metrics", campaignId],
    queryFn: () =>
      api.get("/metrics", { params: { campaignId } }).then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useCampaignMetrics(campaignId: string) {
  return useQuery({
    queryKey: ["metrics", "campaign", campaignId],
    queryFn: () =>
      api.get(`/metrics/campaigns/${campaignId}`).then((r) => r.data),
    enabled: !!campaignId,
  });
}

export interface AgentStat {
  key: string;
  label: string;
  icon: string;
  accent: "blue" | "green" | "purple" | "pink" | "yellow" | "emerald";
  description: string;
  processed: number;
  total: number;
  successRate: number;
  throughputPerHour: number;
  status: "running" | "idle";
}

export interface AgentStatsResponse {
  agents: AgentStat[];
  activeCount: number;
  totalCount: number;
}

export function useAgentStats(campaignId?: string) {
  return useQuery<AgentStatsResponse>({
    queryKey: ["metrics", "agents", campaignId],
    queryFn: () =>
      api.get("/metrics/agents", { params: { campaignId } }).then((r) => r.data),
    refetchInterval: 10_000,
  });
}
