"use client";
import { useState, useEffect } from "react";
import { useDynamicsSettings, useSaveDynamicsSettings } from "@/lib/hooks/useSettings";

const EVENT_TYPES = [
  "candidateCreated",
  "messageSent",
  "replyReceived",
  "meetingBooked",
  "statusChange",
];

const CADENCE_OPTIONS = [
  { value: "realtime", label: "Real-time" },
  { value: "every-5-min", label: "Every 5 min" },
  { value: "hourly", label: "Hourly" },
  { value: "batch-nightly", label: "Batch nightly" },
];

export default function DynamicsSettings() {
  const { data } = useDynamicsSettings();
  const { mutate: save, isPending, isSuccess } = useSaveDynamicsSettings();

  const [tenantId, setTenantId] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [cadences, setCadences] = useState<Record<string, string>>(
    Object.fromEntries(EVENT_TYPES.map((e) => [e, "realtime"]))
  );

  useEffect(() => {
    if (data?.cadences) {
      const merged = { ...cadences };
      for (const c of data.cadences) merged[c.eventType] = c.cadence;
      setCadences(merged);
    }
  }, [data]);

  function handleSave() {
    save({ tenantId, resourceUrl, cadences });
  }

  return (
    <div className="glass-card rounded-xl border border-white/10 p-5 space-y-4">
      <h2 className="font-semibold text-white">Microsoft Dynamics CRM</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Tenant ID</label>
          <input
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Resource URL</label>
          <input
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            placeholder="https://your-org.crm.dynamics.com"
            className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-200 mb-2">Sync Cadence per Event</h3>
        <div className="space-y-2">
          {EVENT_TYPES.map((event) => (
            <div key={event} className="flex items-center justify-between">
              <span className="text-sm text-gray-300 capitalize">
                {event.replace(/([A-Z])/g, " $1")}
              </span>
              <select
                value={cadences[event] ?? "realtime"}
                onChange={(e) =>
                  setCadences((c) => ({ ...c, [event]: e.target.value }))
                }
                className="border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none"
              >
                {CADENCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        {isSuccess && (
          <span className="text-xs text-green-600">Settings saved</span>
        )}
        {!isSuccess && <span />}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-4 py-1.5 bg-brand-500 text-white rounded-lg text-sm disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save & Test Connection"}
        </button>
      </div>
    </div>
  );
}
