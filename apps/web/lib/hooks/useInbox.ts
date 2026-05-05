import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useThreads(campaignId?: string) {
  return useQuery({
    queryKey: ["inbox", "threads", campaignId],
    queryFn: () =>
      api.get("/inbox", { params: { campaignId } }).then((r) => r.data),
    refetchInterval: 15_000,
  });
}

export function useSendReply(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { body: string; channel: string }) =>
      api.post(`/inbox/${threadId}/messages`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inbox"] });
      qc.invalidateQueries({ queryKey: ["candidates", threadId, "messages"] });
    },
  });
}

export function useAiDraft(threadId: string | null) {
  return useQuery({
    queryKey: ["inbox", "draft", threadId],
    queryFn: () =>
      api.get(`/inbox/${threadId}/draft`).then((r) => r.data.draft),
    enabled: !!threadId,
    staleTime: 0,
  });
}

export function useMarkRead(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post(`/inbox/${threadId}/read`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inbox"] }),
  });
}
