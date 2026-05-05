"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div className="w-full bg-amber-400 text-amber-950 text-sm font-medium py-1.5 px-4 flex items-center justify-center gap-3">
      <span>
        Demo Mode — all integrations are simulated. No real emails, SMS, or CRM writes will occur.
      </span>
      <Link
        href="/upgrade"
        className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-950 text-amber-100 hover:bg-amber-900 text-xs font-semibold transition-colors"
      >
        Exit Demo Mode
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}
