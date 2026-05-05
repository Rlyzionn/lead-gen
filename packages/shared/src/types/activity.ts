export type ActivityEventType =
  | "sourced"
  | "enriched"
  | "qualified"
  | "disqualified"
  | "sent"
  | "replied"
  | "booked"
  | "error"
  | "synced";

export interface ActivityEvent {
  id: string;
  campaignId: string;
  candidateId?: string;
  candidateName?: string;
  type: ActivityEventType;
  detail?: string;
  ts: string;
}
