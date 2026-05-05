"use client";
import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useSearchConfig, useSaveSearchConfig, type SearchConfig } from "@/lib/hooks/useSearchConfig";

const DEFAULT: SearchConfig = {
  jobTitle: "Registered Nurse (RN)",
  shiftType: "Day Shift",
  minExperience: 3,
  locationRadius: 50,
  payRangeMin: 35,
  payRangeMax: 55,
  licenseRequired: true,
  sources: ["indeed", "linkedin", "zipRecruiter", "internalDb"],
};

const JOB_TITLES = [
  "Registered Nurse (RN)",
  "ICU Registered Nurse",
  "Travel Nurse",
  "Nurse Practitioner",
  "Physician Assistant",
  "Medical Assistant",
  "Software Engineer",
  "Sales Representative",
  "Account Executive",
];

const SHIFT_TYPES = ["Day Shift", "Night Shift", "Rotating", "Per Diem", "Travel", "Any"];

const SOURCES: { key: string; label: string }[] = [
  { key: "indeed", label: "Indeed" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "zipRecruiter", label: "ZipRecruiter" },
  { key: "internalDb", label: "Internal DB" },
  { key: "vivianHealth", label: "Vivian Health" },
  { key: "monster", label: "Monster" },
];

export default function DefaultSearchConfig() {
  const { data, isLoading } = useSearchConfig();
  const { mutate: save, isPending, isSuccess } = useSaveSearchConfig();
  const [config, setConfig] = useState<SearchConfig>(DEFAULT);

  useEffect(() => {
    if (data) setConfig({ ...DEFAULT, ...data });
  }, [data]);

  if (isLoading) {
    return <div className="glass-card rounded-xl border border-white/10 p-5 h-96 animate-pulse" />;
  }

  function update<K extends keyof SearchConfig>(key: K, value: SearchConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  function toggleSource(key: string) {
    setConfig((c) => ({
      ...c,
      sources: c.sources.includes(key)
        ? c.sources.filter((s) => s !== key)
        : [...c.sources, key],
    }));
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 p-5 space-y-5">
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-purple-500" />
        <h2 className="font-semibold text-white">Default Search Configuration</h2>
      </div>
      <p className="text-xs text-gray-500 -mt-2">
        Default filters applied when creating a new campaign. Per-campaign overrides are still allowed.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-200 block mb-1">Job Title</label>
          <select
            value={config.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          >
            {JOB_TITLES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-200 block mb-1">Shift Type</label>
          <select
            value={config.shiftType}
            onChange={(e) => update("shiftType", e.target.value)}
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          >
            {SHIFT_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-200 block mb-1">
            Min Experience (years)
          </label>
          <input
            type="number"
            min={0}
            max={40}
            value={config.minExperience}
            onChange={(e) => update("minExperience", Number(e.target.value))}
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-200">Location Radius (miles)</label>
            <span className="text-xs font-mono text-brand-600">{config.locationRadius} mi</span>
          </div>
          <input
            type="range"
            min={5}
            max={250}
            step={5}
            value={config.locationRadius}
            onChange={(e) => update("locationRadius", Number(e.target.value))}
            className="w-full accent-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-200 block mb-1">Pay Range ($/hr)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={config.payRangeMin}
              onChange={(e) => update("payRangeMin", Number(e.target.value))}
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            />
            <span className="text-xs text-gray-400">to</span>
            <input
              type="number"
              min={0}
              value={config.payRangeMax}
              onChange={(e) => update("payRangeMax", Number(e.target.value))}
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="border border-white/10 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">License Required</p>
            <p className="text-xs text-gray-500">
              Only show candidates with a verified or pending license.
            </p>
          </div>
          <button
            type="button"
            onClick={() => update("licenseRequired", !config.licenseRequired)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
              config.licenseRequired ? "bg-brand-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full glass-card shadow transition-transform ${
                config.licenseRequired ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-200 block mb-2">Sources to Search</label>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => {
            const checked = config.sources.includes(s.key);
            return (
              <label
                key={s.key}
                className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                  checked
                    ? "border-brand-500 bg-brand-500/20 text-brand-400"
                    : "border-white/10 text-gray-300 hover:border-white/20"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSource(s.key)}
                  className="rounded accent-brand-500"
                />
                {s.label}
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        {isSuccess ? (
          <span className="text-xs text-green-600">Saved</span>
        ) : (
          <span className="text-xs text-gray-400">Applies to new campaigns</span>
        )}
        <button
          onClick={() => save(config)}
          disabled={isPending}
          className="px-4 py-1.5 bg-brand-500 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-brand-600"
        >
          {isPending ? "Saving…" : "Save Defaults"}
        </button>
      </div>
    </div>
  );
}
