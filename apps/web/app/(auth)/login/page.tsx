import Image from "next/image";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <main className="min-h-screen glass-panel flex flex-col items-center justify-center px-4">
      {/* Logo above the card */}
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

      <SignIn afterSignInUrl="/dashboard" />

      <p className="mt-8 text-xs text-gray-300">
        Recruiting Automation Platform · EmpowerAI 365
      </p>
    </main>
  );
}
