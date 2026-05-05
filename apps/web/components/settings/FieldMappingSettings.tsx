"use client";
import { useState } from "react";
import { useFieldMappings, useSaveFieldMappings } from "@/lib/hooks/useSettings";

const DEFAULT_FIELDS = [
  { platform: "name", dynamics: "fullname" },
  { platform: "email", dynamics: "emailaddress1" },
  { platform: "phone", dynamics: "mobilephone" },
  { platform: "title", dynamics: "jobtitle" },
  { platform: "location", dynamics: "address1_city" },
  { platform: "score", dynamics: "new_aiqualificationscore" },
  { platform: "status", dynamics: "new_candidatestatus" },
];

export default function FieldMappingSettings() {
  const { data } = useFieldMappings();
  const { mutate: save, isPending, isSuccess } = useSaveFieldMappings();

  const [mappings, setMappings] = useState<Record<string, string>>(
    Object.fromEntries(DEFAULT_FIELDS.map((f) => [f.platform, f.dynamics]))
  );

  return (
    <div className="glass-card rounded-xl border border-white/10 p-5 space-y-4">
      <h2 className="font-semibold text-white">Dynamics Field Mappings</h2>
      <p className="text-xs text-gray-500">
        Map platform fields to your Dynamics entity fields. Changes apply to all future syncs.
      </p>
      <div className="space-y-2">
        <div className="hidden sm:grid grid-cols-2 gap-2 text-xs text-gray-400 font-medium uppercase tracking-wide px-1">
          <span>Platform field</span>
          <span>Dynamics field</span>
        </div>
        {DEFAULT_FIELDS.map(({ platform }) => (
          <div key={platform} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
            <span className="text-sm text-gray-300 font-mono bg-white/5 px-2 py-1.5 rounded">
              {platform}
            </span>
            <input
              value={mappings[platform] ?? ""}
              onChange={(e) =>
                setMappings((m) => ({ ...m, [platform]: e.target.value }))
              }
              className="border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-1">
        {isSuccess ? (
          <span className="text-xs text-green-600">Mappings saved</span>
        ) : (
          <span />
        )}
        <button
          onClick={() => save(mappings)}
          disabled={isPending}
          className="px-4 py-1.5 bg-brand-500 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save Mappings"}
        </button>
      </div>
    </div>
  );
}
