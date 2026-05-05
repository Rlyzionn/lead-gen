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
    <div className="flex h-screen bg-transparent p-0 sm:p-4 lg:p-6 overflow-hidden gap-0 lg:gap-6 animate-fade-in-up">
      {/* Sidebar handles its own mobile drawer; on desktop it's a flex child. */}
      <Sidebar />

      {/* Main content panel — full width on mobile, glass card on desktop */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden lg:rounded-[2.5rem] lg:glass-card">
        <DemoBanner />
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 pb-6 pt-2 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
