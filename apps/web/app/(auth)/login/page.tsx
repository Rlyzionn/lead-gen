import Image from "next/image";
import Link from "next/link";
import nextDynamic from "next/dynamic";
import { isAuthDisabled } from "@/lib/auth-mode";

// Force runtime rendering — Clerk components read headers/cookies at request time.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const SignIn = isAuthDisabled
  ? null
  : nextDynamic(() => import("@clerk/nextjs").then((m) => m.SignIn), { ssr: false });

export default function LoginPage() {
  return (
    <main className="min-h-screen glass-panel flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <Image
          src="/whitelogo.png"
          alt="EmpowerAI 365"
          width={220}
          height={56}
          className="object-contain"
          priority
        />
      </div>

      {isAuthDisabled ? (
        <div className="glass-card rounded-2xl p-8 max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold text-white">Demo Mode</h1>
          <p className="text-sm text-gray-300">
            Authentication is disabled in this preview. Click below to enter the dashboard.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-brand-500 text-white rounded-full font-medium hover:bg-brand-600"
          >
            Enter Demo →
          </Link>
        </div>
      ) : (
        SignIn && <SignIn afterSignInUrl="/dashboard" />
      )}

      <p className="mt-8 text-xs text-gray-300">
        Recruiting Automation Platform · EmpowerAI 365
      </p>
    </main>
  );
}
