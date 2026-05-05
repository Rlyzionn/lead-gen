"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import ThreadList from "./ThreadList";
import MessageThread from "./MessageThread";

export default function InboxView() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100dvh-9rem)] md:h-[calc(100vh-8rem)] glass-card rounded-xl border border-white/10 overflow-hidden">
      {/* Thread list — hidden on mobile when a thread is selected */}
      <div
        className={`${
          selectedThreadId ? "hidden md:flex" : "flex"
        } w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 flex-col`}
      >
        <div className="p-3 border-b border-white/5">
          <select className="w-full text-sm border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none bg-transparent text-white">
            <option value="all">All Campaigns</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ThreadList
            selectedId={selectedThreadId}
            onSelect={setSelectedThreadId}
          />
        </div>
      </div>

      {/* Message thread — full width on mobile when a thread is selected */}
      <div
        className={`${
          selectedThreadId ? "flex" : "hidden md:flex"
        } flex-1 flex-col min-w-0`}
      >
        {selectedThreadId ? (
          <>
            {/* Mobile back button */}
            <button
              onClick={() => setSelectedThreadId(null)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-white/5 text-sm text-gray-300 hover:bg-white/5"
            >
              <ArrowLeft size={14} /> Back to inbox
            </button>
            <div className="flex-1 min-h-0">
              <MessageThread threadId={selectedThreadId} />
            </div>
          </>
        ) : (
          <div className="hidden md:flex h-full items-center justify-center text-gray-400 text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
