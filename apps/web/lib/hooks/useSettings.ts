import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDynamicsSettings() {
  return useQuery({
    queryKey: ["settings", "dynamics"],
    queryFn: () => api.get("/settings/dynamics").then((r) => r.data),
  });
}

export function useSaveDynamicsSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch("/settings/dynamics", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "dynamics"] }),
  });
}

export function useFieldMappings() {
  return useQuery({
    queryKey: ["settings", "field-mappings"],
    queryFn: () => api.get("/settings/field-mappings").then((r) => r.data),
  });
}

export function useSaveFieldMappings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mappings: Record<string, string>) =>
      api.patch("/settings/field-mappings", { mappings }).then((r) => r.data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["settings", "field-mappings"] }),
  });
}

export function useGmailStatus() {
  return useQuery({
    queryKey: ["oauth", "google", "status"],
    queryFn: () => api.get("/oauth/google/status").then((r) => r.data),
  });
}
