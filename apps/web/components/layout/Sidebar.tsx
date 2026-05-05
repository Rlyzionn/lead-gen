"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Inbox,
  MessageSquareCode,
  Settings,
  Bot,
  Plug,
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
  
  return (
    <aside className="w-[88px] hover:w-64 lg:w-64 transition-all duration-300 ease-in-out glass-panel rounded-[2.5rem] flex flex-col overflow-hidden group shadow-2xl relative">
      {/* Glow effect behind sidebar */}
      <div className="absolute -inset-4 bg-white/5 blur-xl -z-10 rounded-full" />

      {/* Logo Area */}
      <div className="h-24 flex items-center px-4 shrink-0 border-b border-white/10 justify-center group-hover:justify-start lg:justify-start">
        <Link href="/" className="flex items-center overflow-hidden">
          {/* Collapsed state icon (only visible when width is small and not hovered) */}
          <div className="lg:hidden group-hover:hidden w-12 h-12 flex items-center justify-center">
            <Image
              src="/whitelogo.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-contain drop-shadow-md"
              style={{ objectPosition: 'left center' }}
              priority
            />
          </div>
          {/* Expanded state logo */}
          <div className="hidden lg:block group-hover:block px-2">
            <Image
              src="/whitelogo.png"
              alt="EmpowerAI 365"
              width={140}
              height={35}
              className="object-contain drop-shadow-md"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {nav.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-4 p-2 rounded-full font-medium transition-all duration-300 group/item relative",
                isActive
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              )}
            >
              {/* Active Indicator Background */}
              {isActive && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-full shadow-inner border border-white/30" />
              )}
              
              {/* Circle Icon */}
              <div className={cn(
                "w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 shadow-sm",
                isActive 
                  ? "bg-red-500 text-white shadow-red-500/50 shadow-lg border border-red-400" 
                  : "bg-white/5 border border-white/10 group-hover/item:bg-white/20"
              )}>
                <Icon size={18} className={isActive ? "animate-pulse" : ""} />
              </div>
              
              {/* Label */}
              <span className="whitespace-nowrap opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity duration-300 relative z-10">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>


    </aside>
  );
}
