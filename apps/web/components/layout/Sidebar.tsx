"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Inbox,
  MessageSquareCode,
  Settings,
  Bot,
  Plug,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Active Agents", icon: Bot },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/command", label: "AI Command", icon: MessageSquareCode },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile hamburger — visible only on small screens, sits at top-left of TopBar area */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 sm:top-4 sm:left-4 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center text-gray-700 shadow-lg hover:bg-white/60 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Backdrop on mobile when drawer is open */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          aria-hidden="true"
        />
      )}

      {/* Sidebar — slide-in drawer on mobile, static on desktop */}
      <aside
        className={cn(
          "glass-panel flex flex-col overflow-hidden shadow-2xl",
          // Mobile: fixed slide-in drawer
          "fixed inset-y-0 left-0 z-50 w-72 rounded-r-[2.5rem] transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: static, in flex flow, full rounded
          "lg:static lg:translate-x-0 lg:w-64 lg:rounded-[2.5rem] lg:z-auto",
        )}
        aria-label="Primary navigation"
      >
        {/* Glow effect (desktop only — looks weird in a fixed drawer) */}
        <div className="hidden lg:block absolute -inset-4 bg-white/5 blur-xl -z-10 rounded-full" />

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>

        {/* Logo */}
        <div className="h-20 lg:h-24 flex items-center px-5 shrink-0 border-b border-white/10">
          <Link href="/" className="flex items-center overflow-hidden">
            <Image
              src="/whitelogo.png"
              alt="EmpowerAI 365"
              width={140}
              height={35}
              className="object-contain drop-shadow-md"
              priority
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 lg:py-8 space-y-2 lg:space-y-3 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 lg:gap-4 p-2 rounded-full font-medium transition-all duration-300 group/item relative",
                  isActive ? "text-white" : "text-white/70 hover:text-white",
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full shadow-inner border border-white/30" />
                )}

                <div
                  className={cn(
                    "w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 shadow-sm",
                    isActive
                      ? "bg-red-500 text-white shadow-red-500/50 shadow-lg border border-red-400"
                      : "bg-white/5 border border-white/10 group-hover/item:bg-white/20",
                  )}
                >
                  <Icon size={18} className={isActive ? "animate-pulse" : ""} />
                </div>

                <span className="whitespace-nowrap relative z-10 text-sm lg:text-base">
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
