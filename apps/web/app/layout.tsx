import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

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
  if (isDemo) return body;
  return <ClerkProvider>{body}</ClerkProvider>;
}
