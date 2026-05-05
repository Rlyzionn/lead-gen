export interface Campaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  sourcingSpec?: string;
  irpPrompt?: string;
  threshold: number;
  channels: string[];
  cadenceTemplate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignBrief {
  role: string;
  mustHaveCredentials: string[];
  niceToHaves: string[];
  location: string;
  compensation?: string;
  seniority?: string;
  disqualifiers: string[];
  irpPrompt: string;
  threshold: number;
}
