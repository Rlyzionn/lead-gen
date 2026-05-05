export interface Message {
  id: string;
  candidateId: string;
  campaignId: string;
  channel: "sms" | "email";
  direction: "outbound" | "inbound";
  body: string;
  subject?: string;
  externalId?: string;
  touchNumber?: number;
  sentAt: string;
  readAt?: string;
}
