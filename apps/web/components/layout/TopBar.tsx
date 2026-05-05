"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { UserCircle } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const UserButton = isDemo
  ? null
  : dynamic(() => import("@clerk/nextjs").then((m) => m.UserButton), { ssr: false });

export default function TopBar() {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-transparent shrink-0">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-6 border-r border-white/10/20">
          <span className="text-xs font-medium text-gray-500 hidden sm:block">Presented by</span>
          <div className="bg-white/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/50 shadow-sm flex items-center">
            <Image
              src="/blacklogo.png"
              alt="EmpowerAI 365"
              width={100}
              height={24}
              className="object-contain"
            />
          </div>
        </div>

        <NotificationsDropdown />

        {isDemo ? (
          <Link
            href="/profile"
            className="flex items-center gap-3 bg-white/40 backdrop-blur-md border border-white/50 rounded-full pl-2 pr-4 py-1.5 shadow-sm hover:bg-white/60 transition-colors"
          >
            <UserCircle size={24} className="text-gray-700" />
            <span className="hidden sm:block text-sm font-medium text-gray-800">Demo User</span>
          </Link>
        ) : (
          <div className="bg-white/40 backdrop-blur-md border border-white/50 rounded-full p-1 shadow-sm flex items-center justify-center">
            {UserButton && <UserButton afterSignOutUrl="/login" />}
          </div>
        )}
      </div>
    </header>
  );
}
