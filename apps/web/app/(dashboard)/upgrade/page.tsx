import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Mail,
  Globe,
  CheckCircle2,
} from "lucide-react";

const FEATURES = [
  "Real Twilio 10DLC SMS at scale with carrier-friendly pacing",
  "Live Apify scraping across LinkedIn, Indeed, ZipRecruiter",
  "Apollo enrichment with multi-source identity verification",
  "Microsoft Dynamics CRM bidirectional sync",
  "Gmail OAuth + Instantly cold email rotation",
  "Custom AI voice agent integration (Vapi / Retell)",
  "Headhunter Academy playbook RAG ingestion",
  "Per-recruiter number pool routing & 10DLC compliance",
];

export default function UpgradePage() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <div className="glass-card rounded-2xl p-8 md:p-12 space-y-6 text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-amber-400/20 items-center justify-center mx-auto">
          <Sparkles size={32} className="text-amber-300" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Ready to go live?
          </h1>
          <p className="text-base text-gray-300 max-w-lg mx-auto">
            You're currently using a fully-functional demo. To unlock real candidate
            sourcing, outreach, and CRM integration, contact{" "}
            <span className="font-semibold text-white">EmpowerAI 365</span> for a
            full personalized experience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            href="mailto:hello@empowerai365.com?subject=Exit%20Demo%20Mode%20—%20Full%20Setup"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 text-amber-950 rounded-full font-semibold hover:bg-amber-300 transition-colors shadow-lg"
          >
            <Mail size={16} />
            Contact EmpowerAI 365
          </a>
          <a
            href="https://empowerai365.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-white border border-white/20 hover:bg-white/10 transition-colors"
          >
            <Globe size={16} />
            empowerai365.com
          </a>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          What you unlock with the full experience
        </h2>
        <ul className="space-y-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
              <CheckCircle2
                size={16}
                className="text-green-400 shrink-0 mt-0.5"
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Demo Mode is a sandbox. No real candidates are contacted, no SMS or emails are
        sent, and no CRM writes occur. Disable Demo Mode by setting{" "}
        <code className="text-gray-400">DEMO_MODE=false</code> in your environment after
        connecting your live credentials.
      </p>
    </div>
  );
}
