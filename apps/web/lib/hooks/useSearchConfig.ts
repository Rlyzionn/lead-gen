import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface SearchConfig {
  jobTitle: string;
  shiftType: string;
  minExperience: number;
  locationRadius: number;
  payRangeMin: number;
  payRangeMax: number;
  licenseRequired: boolean;
  sources: string[];
}

export function useSearchConfig() {
  return useQuery<SearchConfig>({
    queryKey: ["settings", "search-config"],
    queryFn: () => api.get("/settings/search-config").then((r) => r.data),
  });
}

export function useSaveSearchConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<SearchConfig>) =>
      api.patch("/settings/search-config", config).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "search-config"] }),
  });
}
