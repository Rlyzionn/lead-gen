"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { UserCircle } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";
import { isAuthDisabled } from "@/lib/auth-mode";

const UserButton = isAuthDisabled
  ? null
  : dynamic(() => import("@clerk/nextjs").then((m) => m.UserButton), { ssr: false });

export default function TopBar() {
  return (
    <header className="h-16 sm:h-20 flex items-center justify-end pl-16 lg:pl-8 pr-4 sm:pr-6 lg:pr-8 bg-transparent shrink-0 gap-2 sm:gap-3">
      {/* Mobile hamburger lives in Sidebar at fixed top-left.
          We reserve pl-16 on mobile to keep notifications/avatar from overlapping it. */}

      {/* "Presented by" — hidden on mobile (sidebar hamburger needs space), visible md+ */}
      <div className="hidden md:flex items-center gap-3 pr-4 lg:pr-6 border-r border-white/10">
        <span className="text-xs font-medium text-gray-500 hidden lg:block">Presented by</span>
        <div className="bg-white/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/50 shadow-sm flex items-center">
          <Image
            src="/blacklogo.png"
            alt="EmpowerAI 365"
            width={90}
            height={22}
            className="object-contain"
          />
        </div>
      </div>

      <NotificationsDropdown />

      {isAuthDisabled ? (
        <Link
          href="/profile"
          className="flex items-center gap-2 sm:gap-3 bg-white/40 backdrop-blur-md border border-white/50 rounded-full pl-1.5 sm:pl-2 pr-3 sm:pr-4 py-1 sm:py-1.5 shadow-sm hover:bg-white/60 transition-colors"
        >
          <UserCircle size={22} className="text-gray-700 sm:w-6 sm:h-6" />
          <span className="hidden sm:block text-sm font-medium text-gray-800 whitespace-nowrap">
            Demo User
          </span>
        </Link>
      ) : (
        <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-full p-1 shadow-sm flex items-center justify-center">
          {UserButton && <UserButton afterSignOutUrl="/login" />}
        </div>
      )}
    </header>
  );
}
