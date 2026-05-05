import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const metadata: Metadata = {
  title: "EmpowerAI 365 — Recruiting Automation",
  description: "AI-powered recruiting automation platform by EmpowerAI 365",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
  // Only wrap with ClerkProvider when both: NOT in demo mode AND a publishable key exists.
  // Otherwise the provider throws a hard client-side error and the whole app
  // shows a generic "Application error" overlay.
  if (isDemo || !hasClerkKey) return body;
  return <ClerkProvider>{body}</ClerkProvider>;
}
