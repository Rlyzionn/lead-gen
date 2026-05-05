export interface Candidate {
  id: string;
  externalId: string;
  name: string;
  email?: string;
  phone?: string;
  title?: string;
  location?: string;
  source: "linkedin" | "indeed" | "csv";
  status: CandidateStatus;
  score?: number;
  scoreReasoning?: string;
  identityVerified: boolean;
  credentialsVerified: boolean;
  campaignId: string;
  recruiterId?: string;
  dynamicsSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CandidateStatus =
  | "sourced"
  | "enriched"
  | "verified"
  | "qualified"
  | "disqualified"
  | "personalized"
  | "sent"
  | "replied"
  | "booked";
