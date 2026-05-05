"use client";

const EVENTS = [
  "Reply needs human response",
  "Candidate above threshold",
  "Meeting booked",
  "Call notification",
  "Sync error",
  "Campaign milestone",
];

const CHANNELS = ["In-app", "Email", "Slack"];

export default function NotificationSettings() {
  return (
    <div className="glass-card rounded-xl border border-white/10 p-5">
      <h2 className="font-semibold text-white mb-4">Notification Preferences</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left text-xs text-gray-500 pb-2">Event</th>
            {CHANNELS.map((ch) => (
              <th key={ch} className="text-center text-xs text-gray-500 pb-2 px-2">
                {ch}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {EVENTS.map((ev) => (
            <tr key={ev}>
              <td className="py-2 text-gray-200">{ev}</td>
              {CHANNELS.map((ch) => (
                <td key={ch} className="text-center py-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button className="mt-4 px-4 py-1.5 bg-brand-500 text-white rounded-lg text-sm">
        Save Preferences
      </button>
    </div>
  );
}
