import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { isAuthDisabled } from "@/lib/auth-mode";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthDisabled) {
    const { auth } = require("@clerk/nextjs");
    const { userId } = auth();
    if (!userId) redirect("/login");
  }

  return (
    <div className="flex h-screen bg-transparent p-4 sm:p-6 overflow-hidden gap-6 animate-fade-in-up">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden rounded-[2.5rem] glass-card">
        <DemoBanner />
        <TopBar />
        <main className="flex-1 overflow-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
