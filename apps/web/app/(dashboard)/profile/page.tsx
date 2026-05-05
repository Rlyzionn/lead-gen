"use client";
import { useState } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  Building2,
  Bell,
  Globe,
  Sparkles,
  LogOut,
  Shield,
  Edit3,
  Calendar,
  Activity,
} from "lucide-react";
import Link from "next/link";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const STAT_CARDS = [
  { label: "Active Campaigns", value: "3", icon: Activity, accent: "text-blue-400" },
  { label: "Candidates Sourced", value: "1,245", icon: UserCircle, accent: "text-green-400" },
  { label: "Replies This Week", value: "82", icon: Mail, accent: "text-purple-400" },
  { label: "Meetings Booked", value: "14", icon: Calendar, accent: "text-yellow-400" },
];

const NOTIFICATION_PREFS = [
  { key: "replies", label: "Candidate replies", description: "Notify when a candidate responds to outreach" },
  { key: "qualified", label: "Newly qualified candidates", description: "When candidates pass the IRP threshold" },
  { key: "booked", label: "Meetings booked", description: "When an interview is scheduled" },
  { key: "errors", label: "Sync errors", description: "When CRM or integration sync fails" },
  { key: "milestones", label: "Campaign milestones", description: "First reply, 10th booking, etc." },
];

export default function ProfilePage() {
  const [user, setUser] = useState({
    fullName: isDemo ? "Demo Recruiter" : "",
    email: isDemo ? "demo@empowerai365.com" : "",
    phone: isDemo ? "+1 (214) 555-0100" : "",
    title: "Senior Recruiter",
    org: "Headhunter Academy",
    timezone: "America/Chicago",
  });

  const [prefs, setPrefs] = useState<Record<string, { app: boolean; email: boolean; slack: boolean }>>(
    Object.fromEntries(
      NOTIFICATION_PREFS.map((p) => [p.key, { app: true, email: true, slack: false }])
    )
  );
  const [saved, setSaved] = useState(false);

  function update<K extends keyof typeof user>(key: K, value: string) {
    setUser((u) => ({ ...u, [key]: value }));
  }

  function togglePref(key: string, channel: "app" | "email" | "slack") {
    setPrefs((p) => ({
      ...p,
      [key]: { ...p[key], [channel]: !p[key][channel] },
    }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">
            Personal account settings, notification preferences, and activity overview.
          </p>
        </div>
        <Link
          href="/settings"
          className="text-xs px-4 py-2 rounded-full glass-button font-medium text-white self-start sm:self-auto whitespace-nowrap"
        >
          Workspace Settings →
        </Link>
      </div>

      {/* Header card */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 flex items-start gap-4 sm:gap-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shrink-0 shadow-lg">
          {user.fullName.charAt(0) || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-semibold text-white">{user.fullName || "Unnamed"}</h2>
            {isDemo && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium">
                DEMO
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 truncate">{user.title} · {user.org}</p>
          <p className="text-xs text-gray-500 mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="flex items-center gap-1 truncate"><Mail size={11} className="shrink-0" /> {user.email}</span>
            <span className="flex items-center gap-1"><Phone size={11} className="shrink-0" /> {user.phone}</span>
          </p>
        </div>
        <button className="p-2 rounded-full glass-button text-white shrink-0">
          <Edit3 size={14} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">{label}</p>
              <Icon size={14} className={accent} />
            </div>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Personal info */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserCircle size={18} className="text-brand-500" />
          <h3 className="font-semibold text-white">Personal Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Full Name"
            icon={<UserCircle size={13} />}
            value={user.fullName}
            onChange={(v) => update("fullName", v)}
          />
          <Field
            label="Email"
            icon={<Mail size={13} />}
            value={user.email}
            onChange={(v) => update("email", v)}
          />
          <Field
            label="Phone"
            icon={<Phone size={13} />}
            value={user.phone}
            onChange={(v) => update("phone", v)}
          />
          <Field
            label="Job Title"
            icon={<Building2 size={13} />}
            value={user.title}
            onChange={(v) => update("title", v)}
          />
          <Field
            label="Organization"
            icon={<Building2 size={13} />}
            value={user.org}
            onChange={(v) => update("org", v)}
          />
          <Field
            label="Timezone"
            icon={<Globe size={13} />}
            value={user.timezone}
            onChange={(v) => update("timezone", v)}
          />
        </div>
      </div>

      {/* Notification preferences */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-yellow-400" />
          <h3 className="font-semibold text-white">Notification Preferences</h3>
        </div>
        <p className="text-xs text-gray-500">
          Pick which channels each event type fires on.
        </p>

        {/* Desktop / tablet: clean table */}
        <table className="hidden sm:table w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide">
              <th className="text-left pb-2">Event</th>
              <th className="text-center pb-2">In-App</th>
              <th className="text-center pb-2">Email</th>
              <th className="text-center pb-2">Slack</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {NOTIFICATION_PREFS.map((p) => (
              <tr key={p.key}>
                <td className="py-3 pr-4">
                  <p className="text-sm text-white">{p.label}</p>
                  <p className="text-xs text-gray-500">{p.description}</p>
                </td>
                {(["app", "email", "slack"] as const).map((ch) => (
                  <td key={ch} className="text-center py-3">
                    <Toggle
                      on={prefs[p.key][ch]}
                      onClick={() => togglePref(p.key, ch)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile: stacked card list */}
        <div className="sm:hidden space-y-4 divide-y divide-white/5">
          {NOTIFICATION_PREFS.map((p) => (
            <div key={p.key} className="pt-4 first:pt-0">
              <p className="text-sm text-white font-medium">{p.label}</p>
              <p className="text-xs text-gray-500 mb-3">{p.description}</p>
              <div className="grid grid-cols-3 gap-2">
                {(["app", "email", "slack"] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => togglePref(p.key, ch)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs ${
                      prefs[p.key][ch]
                        ? "border-brand-500/50 bg-brand-500/15 text-brand-300"
                        : "border-white/10 text-gray-400"
                    }`}
                  >
                    <span className="capitalize">{ch === "app" ? "In-App" : ch}</span>
                    <Toggle on={prefs[p.key][ch]} onClick={() => togglePref(p.key, ch)} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Sparkles size={18} className="text-purple-400" />
          Quick Links
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          <QuickLink href="/settings" label="AI Personality" description="Tone, verbosity, creativity" />
          <QuickLink href="/settings" label="Search Defaults" description="Job filters & sources" />
          <QuickLink href="/integrations" label="Integrations" description="Data sources & channels" />
          <QuickLink href="/settings" label="Dynamics CRM" description="Sync settings" />
          <QuickLink href="/settings" label="Field Mappings" description="CRM field mapping" />
          <QuickLink href="/agents" label="Active Agents" description="Live pipeline view" />
        </div>
      </div>

      {/* Security / Sign out */}
      <div className="glass-card rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Shield size={18} className="text-red-400" />
          Account
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600"
          >
            {saved ? "Saved ✓" : "Save Profile"}
          </button>
          {!isDemo && (
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-red-500/40 text-red-400 rounded-lg text-sm hover:bg-red-500/10">
              <LogOut size={14} />
              Sign Out
            </button>
          )}
          {isDemo && (
            <Link
              href="/upgrade"
              className="flex items-center justify-center gap-2 px-4 py-2 border border-amber-400/40 text-amber-300 rounded-lg text-sm hover:bg-amber-400/10"
            >
              Exit Demo Mode →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5 mb-1">
        {icon}
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 bg-white/5 text-white"
      />
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-9 h-5 rounded-full transition-colors ${
        on ? "bg-brand-500" : "bg-white/10"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/10 shadow transition-transform ${
          on ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

function QuickLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block glass-card rounded-lg p-3 hover:border-white/20 transition-colors"
    >
      <p className="text-sm font-medium text-white">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </Link>
  );
}
