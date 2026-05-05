import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface DataSource {
  key: string;
  label: string;
  description: string;
  short: string;
  accent: "blue" | "indigo" | "green" | "purple" | "yellow" | "red";
  connected: boolean;
  imported: number;
  lastSyncMinutesAgo: number | null;
}

export interface OutreachChannel {
  key: string;
  label: string;
  description: string;
  icon: "phone" | "message" | "mail" | "database";
  accent: "blue" | "green" | "yellow" | "red";
  active: boolean;
  stat: string;
}

export interface IntegrationsResponse {
  dataSources: DataSource[];
  outreachChannels: OutreachChannel[];
  crm: OutreachChannel[];
  webhookUrl: string;
}

export function useIntegrations() {
  return useQuery<IntegrationsResponse>({
    queryKey: ["integrations"],
    queryFn: () => api.get("/settings/integrations").then((r) => r.data),
  });
}
