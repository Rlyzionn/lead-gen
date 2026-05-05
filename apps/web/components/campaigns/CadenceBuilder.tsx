"use client";
import { useState } from "react";

type Template = "3-touch" | "5-touch" | "hyper-personalized";

interface Props {
  onNext: (data: { cadenceTemplate: Template; channels: string[]; conditionalLogicDsl: string }) => void;
}

const TEMPLATES: { id: Template; label: string; description: string }[] = [
  { id: "3-touch", label: "3-Touch", description: "SMS day 1, email day 3, call reminder day 7" },
  { id: "5-touch", label: "5-Touch", description: "SMS → email → SMS → call reminder → email follow-up" },
  { id: "hyper-personalized", label: "Hyper-Personalized", description: "All touches draw from enrichment and deep research" },
];

const ALL_CHANNELS = ["sms", "email", "call"];

export default function CadenceBuilder({ onNext }: Props) {
  const [template, setTemplate] = useState<Template>("3-touch");
  const [channels, setChannels] = useState<string[]>(["sms", "email"]);
  const [conditionalLogic, setConditionalLogic] = useState("");

  function toggleChannel(ch: string) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Starter Template</label>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                template === t.id
                  ? "border-brand-500 bg-brand-500/20"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <p className="text-sm font-medium text-gray-100">{t.label}</p>
              <p className="text-xs text-gray-500 mt-1">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">Channels</label>
        <div className="flex gap-3">
          {ALL_CHANNELS.map((ch) => (
            <label key={ch} className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer capitalize">
              <input
                type="checkbox"
                checked={channels.includes(ch)}
                onChange={() => toggleChannel(ch)}
                className="rounded"
              />
              {ch === "call" ? "Call Reminder" : ch.toUpperCase()}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-1">
          Conditional Logic (natural language)
        </label>
        <p className="text-xs text-gray-400 mb-2">
          e.g. "If no reply after touch 2, switch to call reminder" — compiled to
          a workflow definition automatically.
        </p>
        <textarea
          value={conditionalLogic}
          onChange={(e) => setConditionalLogic(e.target.value)}
          rows={4}
          placeholder="Describe any conditional rules in plain English…"
          className="w-full border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-brand-500"
        />
      </div>

      <button
        onClick={() =>
          onNext({ cadenceTemplate: template, channels, conditionalLogicDsl: conditionalLogic })
        }
        className="px-6 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium"
      >
        Next: Review & Launch →
      </button>
    </div>
  );
}
