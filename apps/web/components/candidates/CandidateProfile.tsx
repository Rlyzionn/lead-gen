"use client";
import {
  useCandidate,
  useForceCandidateSync,
  useRegenerateScore,
  useRegeneratePersonalization,
} from "@/lib/hooks/useCandidates";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  Building2,
  GraduationCap,
  Award,
  Phone,
  Mail,
  MapPin,
  Briefcase,
} from "lucide-react";

interface Props {
  candidateId: string;
}

interface EnrichedData {
  company?: string;
  yearsExperience?: number;
  education?: string;
  certifications?: string[];
  previousRoles?: string[];
}

interface PersonalizationTokens {
  firstName?: string;
  currentRole?: string;
  specificCompliment?: string;
  relevantAchievement?: string;
  openingHook?: string;
}

export default function CandidateProfile({ candidateId }: Props) {
  const { data: candidate, isLoading } = useCandidate(candidateId);
  const { mutate: syncNow, isPending: syncing } = useForceCandidateSync(candidateId);
  const { mutate: regenScore, isPending: regenScoring } = useRegenerateScore(candidateId);
  const { mutate: regenTokens, isPending: regenTokensPending } =
    useRegeneratePersonalization(candidateId);

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl border border-white/10 p-5 animate-pulse h-96" />
    );
  }
  if (!candidate) return null;

  const enriched = (candidate.enrichedData as EnrichedData | null) ?? {};
  const tokens = (candidate.personalizationTokens as PersonalizationTokens | null) ?? {};

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xl shrink-0">
            {candidate.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{candidate.name}</p>
            <p className="text-xs text-gray-500 truncate">{candidate.title ?? "—"}</p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge ok={candidate.identityVerified} label="Identity" />
          <Badge ok={candidate.credentialsVerified} label="Credentials" />
          <Badge ok={!!candidate.dynamicsSyncedAt} label="In CRM" />
        </div>

        <div className="space-y-2 border-t border-white/5 pt-3">
          <Row icon={<Mail size={13} />} label="Email" value={candidate.email ?? "—"} />
          <Row icon={<Phone size={13} />} label="Phone" value={candidate.phone ?? "—"} />
          <Row icon={<MapPin size={13} />} label="Location" value={candidate.location ?? "—"} />
          <Row icon={<Briefcase size={13} />} label="Source" value={candidate.source} />
          <Row icon={<RefreshCw size={13} />} label="Status" value={candidate.status} />
        </div>

        <button
          onClick={() => syncNow()}
          disabled={syncing}
          className="w-full px-4 py-2 border border-white/10 rounded-lg text-sm text-gray-200 hover:bg-white/5 disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Force CRM Sync"}
        </button>
      </div>

      {Object.keys(enriched).length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Building2 size={14} className="text-brand-500" />
            Enrichment Data
          </h3>
          {enriched.company && (
            <Row icon={<Building2 size={13} />} label="Company" value={enriched.company} />
          )}
          {enriched.yearsExperience != null && (
            <Row
              icon={<Briefcase size={13} />}
              label="Experience"
              value={`${enriched.yearsExperience} years`}
            />
          )}
          {enriched.education && (
            <Row
              icon={<GraduationCap size={13} />}
              label="Education"
              value={enriched.education}
            />
          )}
          {enriched.certifications && enriched.certifications.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                <Award size={13} /> Certifications
              </p>
              <div className="flex flex-wrap gap-1.5">
                {enriched.certifications.map((c) => (
                  <span
                    key={c}
                    className="text-xs px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded-full font-medium"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {enriched.previousRoles && enriched.previousRoles.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Previous roles</p>
              <ul className="space-y-1">
                {enriched.previousRoles.map((r, i) => (
                  <li
                    key={i}
                    className="text-xs text-gray-200 pl-2 border-l-2 border-white/5"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {candidate.deepResearch && (
        <div className="glass-card rounded-xl border border-white/10 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles size={14} className="text-brand-500" />
            Deep Research
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            {candidate.deepResearch}
          </p>
        </div>
      )}

      {Object.keys(tokens).length > 0 && (
        <div className="glass-card rounded-xl border border-white/10 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles size={14} className="text-brand-500" />
              Personalization Tokens
            </h3>
            <button
              onClick={() => regenTokens()}
              disabled={regenTokensPending}
              className="text-xs px-2 py-1 rounded border border-white/10 hover:bg-white/5 text-gray-300 disabled:opacity-50 flex items-center gap-1"
            >
              <RefreshCw size={11} className={regenTokensPending ? "animate-spin" : ""} />
              Regenerate
            </button>
          </div>
          <div className="space-y-2">
            {Object.entries(tokens).map(([k, v]) => (
              <div key={k} className="text-xs">
                <p className="text-gray-400 font-mono">{`{{${k}}}`}</p>
                <p className="text-gray-200 leading-relaxed pl-2 border-l-2 border-brand-100">
                  {String(v)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-brand-50/60 to-white rounded-xl border border-brand-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles size={14} className="text-brand-500" />
          AI Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => regenScore()}
            disabled={regenScoring}
            className="text-sm px-3 py-2 glass-card border border-brand-200 rounded-lg text-brand-400 hover:bg-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw size={13} className={regenScoring ? "animate-spin" : ""} />
            {regenScoring ? "Re-scoring…" : "Re-score"}
          </button>
          <button
            onClick={() => regenTokens()}
            disabled={regenTokensPending}
            className="text-sm px-3 py-2 glass-card border border-brand-200 rounded-lg text-brand-400 hover:bg-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles size={13} />
            {regenTokensPending ? "Generating…" : "Re-personalize"}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Re-runs scoring and message personalization using the campaign's IRP and your current AI personality settings.
        </p>
      </div>
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
        ok ? "bg-green-50 text-green-700" : "bg-white/10 text-gray-500"
      }`}
    >
      {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {label}
    </span>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-gray-500 flex items-center gap-1.5 shrink-0">
        {icon}
        {label}
      </span>
      <span className="text-gray-100 text-right break-words capitalize">{value}</span>
    </div>
  );
}
