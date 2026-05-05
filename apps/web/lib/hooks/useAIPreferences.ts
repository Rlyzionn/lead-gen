import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AIPreferences {
  tone: "formal" | "casual" | "friendly" | "direct";
  verbosity: "concise" | "balanced" | "detailed";
  creativity: number;
  emojiUsage: "none" | "minimal" | "liberal";
  signOffStyle: "warm" | "professional" | "none";
  customInstructions: string | null;
}

export function useAIPreferences() {
  return useQuery<AIPreferences>({
    queryKey: ["settings", "ai"],
    queryFn: () => api.get("/settings/ai").then((r) => r.data),
  });
}

export function useSaveAIPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prefs: Partial<AIPreferences>) =>
      api.patch("/settings/ai", prefs).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings", "ai"] }),
  });
}
