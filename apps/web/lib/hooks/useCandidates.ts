import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Candidate } from "@hha/shared";

export function useCandidates(filters?: {
  status?: string;
  campaignId?: string;
  search?: string;
}) {
  return useQuery<Candidate[]>({
    queryKey: ["candidates", filters],
    queryFn: () =>
      api.get("/candidates", { params: filters }).then((r) => r.data),
  });
}

export function useCandidate(id: string) {
  return useQuery<Candidate>({
    queryKey: ["candidates", id],
    queryFn: () => api.get(`/candidates/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCandidateScore(id: string) {
  return useQuery<{ score: number; scoreReasoning: string }>({
    queryKey: ["candidates", id, "score"],
    queryFn: () => api.get(`/candidates/${id}/score`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCandidateMessages(id: string) {
  return useQuery({
    queryKey: ["candidates", id, "messages"],
    queryFn: () => api.get(`/candidates/${id}/messages`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useForceCandidateSync(id: string) {
  return useMutation({
    mutationFn: () => api.post(`/candidates/${id}/sync`).then((r) => r.data),
  });
}

export function useRegenerateScore(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/candidates/${id}/regenerate-score`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates", id] });
      qc.invalidateQueries({ queryKey: ["candidates", id, "score"] });
    },
  });
}

export function useRegeneratePersonalization(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post(`/candidates/${id}/regenerate-personalization`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates", id] }),
  });
}
