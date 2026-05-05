"use client";
import { useEffect, useState } from "react";
import { Sparkles, Smile, Feather, Zap, MessageCircle, Bot } from "lucide-react";
import { useAIPreferences, useSaveAIPreferences, type AIPreferences } from "@/lib/hooks/useAIPreferences";

const DEFAULT: AIPreferences = {
  tone: "friendly",
  verbosity: "balanced",
  creativity: 0.7,
  emojiUsage: "minimal",
  signOffStyle: "warm",
  customInstructions: null,
};

const TONE_OPTIONS: { value: AIPreferences["tone"]; label: string; description: string }[] = [
  { value: "formal", label: "Formal", description: "Polished, professional, no contractions" },
  { value: "casual", label: "Casual", description: "Conversational, easygoing" },
  { value: "friendly", label: "Friendly", description: "Warm, like a trusted colleague" },
  { value: "direct", label: "Direct", description: "Straight to the point — no fluff" },
];

const VERBOSITY_OPTIONS: { value: AIPreferences["verbosity"]; label: string }[] = [
  { value: "concise", label: "Concise" },
  { value: "balanced", label: "Balanced" },
  { value: "detailed", label: "Detailed" },
];

const EMOJI_OPTIONS: { value: AIPreferences["emojiUsage"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "minimal", label: "Minimal" },
  { value: "liberal", label: "Liberal" },
];

const SIGNOFF_OPTIONS: { value: AIPreferences["signOffStyle"]; label: string }[] = [
  { value: "warm", label: "Warm" },
  { value: "professional", label: "Professional" },
  { value: "none", label: "None" },
];

export default function AISettings() {
  const { data, isLoading } = useAIPreferences();
  const { mutate: save, isPending, isSuccess } = useSaveAIPreferences();
  const [prefs, setPrefs] = useState<AIPreferences>(DEFAULT);

  useEffect(() => {
    if (data) setPrefs({ ...DEFAULT, ...data });
  }, [data]);

  if (isLoading) {
    return <div className="glass-card rounded-xl border border-white/10 p-5 h-72 animate-pulse" />;
  }

  function update<K extends keyof AIPreferences>(key: K, value: AIPreferences[K]) {
    setPrefs((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-brand-500" />
        <h2 className="font-semibold text-white">AI Personality</h2>
      </div>
      <p className="text-xs text-gray-500 -mt-2">
        Controls how the AI sounds across outreach drafts, replies, and the Command Center.
      </p>

      {/* Tone */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-100">Tone</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {TONE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => update("tone", o.value)}
              className={`text-left rounded-lg border px-3 py-2 transition-colors ${
                prefs.tone === o.value
                  ? "border-brand-500 bg-brand-500/20"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <p className="text-sm font-medium text-white">{o.label}</p>
              <p className="text-xs text-gray-500">{o.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Verbosity */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Feather size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-100">Verbosity</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {VERBOSITY_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => update("verbosity", o.value)}
              className={`rounded-lg border py-2 text-sm transition-colors ${
                prefs.verbosity === o.value
                  ? "border-brand-500 bg-brand-500/20 text-brand-400 font-medium"
                  : "border-white/10 text-gray-300 hover:border-white/20"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Creativity slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-100">Creativity</span>
          </div>
          <span className="text-xs font-mono text-brand-600">{prefs.creativity.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={prefs.creativity}
          onChange={(e) => update("creativity", Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Predictable</span>
          <span>Balanced</span>
          <span>Creative</span>
        </div>
      </div>

      {/* Emoji usage */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Smile size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-100">Emoji usage</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {EMOJI_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => update("emojiUsage", o.value)}
              className={`rounded-lg border py-2 text-sm transition-colors ${
                prefs.emojiUsage === o.value
                  ? "border-brand-500 bg-brand-500/20 text-brand-400 font-medium"
                  : "border-white/10 text-gray-300 hover:border-white/20"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sign-off */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bot size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-100">Sign-off style</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {SIGNOFF_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => update("signOffStyle", o.value)}
              className={`rounded-lg border py-2 text-sm transition-colors ${
                prefs.signOffStyle === o.value
                  ? "border-brand-500 bg-brand-500/20 text-brand-400 font-medium"
                  : "border-white/10 text-gray-300 hover:border-white/20"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom instructions */}
      <div>
        <span className="text-sm font-medium text-gray-100 block mb-2">
          Custom instructions
        </span>
        <textarea
          value={prefs.customInstructions ?? ""}
          onChange={(e) =>
            update("customInstructions", e.target.value || null)
          }
          rows={3}
          placeholder="e.g. Always mention our $8k sign-on bonus. Never use the word 'opportunity'."
          className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-brand-500"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        {isSuccess ? (
          <span className="text-xs text-green-600">Saved — applies to all new drafts</span>
        ) : (
          <span className="text-xs text-gray-400">Changes apply on save</span>
        )}
        <button
          onClick={() => save(prefs)}
          disabled={isPending}
          className="px-4 py-1.5 bg-brand-500 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-brand-600"
        >
          {isPending ? "Saving…" : "Save AI Personality"}
        </button>
      </div>
    </div>
  );
}
