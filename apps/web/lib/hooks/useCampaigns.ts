import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Campaign } from "@hha/shared";

export function useCampaigns() {
  return useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: () => api.get("/campaigns").then((r) => r.data),
  });
}

export function useCampaign(id: string) {
  return useQuery<Campaign>({
    queryKey: ["campaigns", id],
    queryFn: () => api.get(`/campaigns/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Campaign>) =>
      api.post("/campaigns", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}

export function useParseCampaign() {
  return useMutation({
    mutationFn: (data: { text?: string; mode: string; audioUrl?: string }) =>
      api.post("/campaigns/parse", data).then((r) => r.data),
  });
}

export function usePauseCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/campaigns/${id}/pause`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns", id] }),
  });
}

export function useForceCampaignSync(id: string) {
  return useMutation({
    mutationFn: () => api.post(`/campaigns/${id}/sync`).then((r) => r.data),
  });
}

export function useCampaignCandidates(id: string) {
  return useQuery({
    queryKey: ["campaigns", id, "candidates"],
    queryFn: () => api.get(`/campaigns/${id}/candidates`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useUpdateCampaign(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Campaign>) =>
      api.patch(`/campaigns/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      qc.invalidateQueries({ queryKey: ["campaigns", id] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campaigns"] }),
  });
}
