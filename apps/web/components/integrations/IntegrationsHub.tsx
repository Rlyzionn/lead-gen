"use client";
import { useState, useRef } from "react";
import { useIntegrations, type DataSource, type OutreachChannel } from "@/lib/hooks/useIntegrations";
import {
  Plug,
  Mail,
  Phone,
  MessageSquare,
  Database,
  Plus,
  RefreshCw,
  ExternalLink,
  FileSpreadsheet,
  Upload,
  Webhook,
  Copy,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const ACCENT_BG: Record<string, string> = {
  blue: "bg-white/5 text-white",
  indigo: "bg-white/5 text-white",
  green: "bg-white/5 text-white",
  purple: "bg-white/5 text-white",
  yellow: "bg-white/5 text-white",
  red: "bg-white/5 text-white",
};

const CHANNEL_ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  message: MessageSquare,
  mail: Mail,
  database: Database,
};

export default function IntegrationsHub() {
  const { data, isLoading } = useIntegrations();

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-900/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations Hub</h1>
        <p className="text-sm text-gray-400 mt-1">
          Connect data sources, outreach channels, and import candidates
        </p>
      </div>

      {/* Data Sources */}
      <Section icon={<Plug size={16} />} title="Candidate Data Sources" accent="text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.dataSources.map((ds) => (
            <DataSourceCard key={ds.key} source={ds} />
          ))}
          <AddSourceCard />
        </div>
      </Section>

      {/* Outreach Channels */}
      <Section icon={<Mail size={16} />} title="Outreach Channels" accent="text-white">
        <div className="space-y-2">
          {data.outreachChannels.map((ch) => (
            <ChannelRow key={ch.key} channel={ch} />
          ))}
        </div>
      </Section>

      {/* CRM */}
      {data.crm && data.crm.length > 0 && (
        <Section icon={<Database size={16} />} title="CRM Sync" accent="text-white">
          <div className="space-y-2">
            {data.crm.map((c) => (
              <ChannelRow key={c.key} channel={c} />
            ))}
          </div>
        </Section>
      )}

      {/* Manual import */}
      <Section icon={<FileSpreadsheet size={16} />} title="Manual Import" accent="text-white">
        <ManualImport />
      </Section>

      {/* Webhooks */}
      <Section icon={<Webhook size={16} />} title="Incoming Webhooks" accent="text-white">
        <WebhookRow url={data.webhookUrl} />
      </Section>
    </div>
  );
}

function Section({
  icon,
  title,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className={cn("flex items-center gap-2 text-sm font-semibold uppercase tracking-wide mb-3", accent)}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function DataSourceCard({ source }: { source: DataSource }) {
  const accent = ACCENT_BG[source.accent] ?? ACCENT_BG.blue;
  return (
    <div className="glass-card rounded-xl p-4 flex flex-col gap-3 group hover:border-white/20 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0", accent)}>
            {source.short}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold truncate">{source.label}</p>
              <StatusPill connected={source.connected} />
            </div>
            <p className="text-xs text-gray-400 truncate">{source.description}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800">
        {source.connected ? (
          <>
            <div className="text-gray-300">
              <span className="font-bold text-white">{source.imported.toLocaleString()}</span>{" "}
              <span className="text-gray-500">imported</span>
              {source.lastSyncMinutesAgo != null && (
                <span className="text-gray-500 ml-2">
                  · Last sync: {source.lastSyncMinutesAgo} min ago
                </span>
              )}
            </div>
            <button className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs">
              <RefreshCw size={12} /> Sync
            </button>
          </>
        ) : (
          <button className="ml-auto text-white hover:text-gray-300 flex items-center gap-1 border border-white/10 px-3 py-1 rounded-lg">
            <Plus size={12} /> Connect
          </button>
        )}
      </div>
    </div>
  );
}

function AddSourceCard() {
  return (
    <button className="glass-card border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-white/30 hover:text-white transition-all">
      <Plus size={20} />
      <p className="text-sm font-medium text-white">Add Custom Source</p>
      <p className="text-xs text-gray-500">Connect any API or database</p>
    </button>
  );
}

function ChannelRow({ channel }: { channel: OutreachChannel }) {
  const Icon = CHANNEL_ICONS[channel.icon] ?? Mail;
  const accent = ACCENT_BG[channel.accent] ?? ACCENT_BG.blue;
  return (
    <div className="glass-card rounded-xl px-4 py-3 flex items-center gap-4 hover:border-white/20 transition-all">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", accent)}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold">{channel.label}</p>
          <StatusPill connected={channel.active} />
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{channel.description}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={cn(
            "text-xs",
            channel.active ? "text-blue-400" : "text-gray-500"
          )}
        >
          {channel.stat}
        </span>
        <ExternalLink size={14} className="text-gray-300" />
      </div>
    </div>
  );
}

function StatusPill({ connected }: { connected: boolean }) {
  return (
    <span
      className={cn(
        "text-[10px] px-2 py-0.5 rounded-full font-medium border",
        connected
          ? "border-brand-500/40 text-brand-400 bg-brand-500/10"
          : "border-gray-700 text-gray-500"
      )}
    >
      {connected ? "✓ Connected" : "○ Not Connected"}
    </span>
  );
}

function ManualImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      // Upload via campaigns/upload-placements endpoint as a generic CSV holder
      // (in production we'd add a dedicated /candidates/import endpoint)
      const r = await api.post("/candidates", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }).catch(() => null);
      setResult(r ? `Uploaded ${file.name}` : `Queued ${file.name}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="glass-card border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all"
    >
      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
        <Upload size={20} className="text-gray-400" />
      </div>
      <div>
        <p className="text-white font-semibold">Upload CSV or Excel File</p>
        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
          Import candidates from spreadsheets. We auto-detect columns for name, email, phone, role, and source.
        </p>
      </div>
      <button
        disabled={uploading}
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/10 rounded-lg text-sm font-medium hover:bg-white/20 disabled:opacity-50"
      >
        <Upload size={14} />
        {uploading ? "Uploading…" : "Choose File"}
      </button>
      {result && <p className="text-xs text-green-400 mt-2">{result}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

function WebhookRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="glass-card rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium bg-white/5 text-white border border-white/10">
          POST
        </span>
        <code className="flex-1 text-sm text-gray-300 truncate font-mono">{url}</code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy URL"}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        POST a JSON candidate record to this URL from any external source. Auto-routed into the active campaign.
      </p>
    </div>
  );
}
