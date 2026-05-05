"use client";
import { useState } from "react";
import ThreadList from "./ThreadList";
import MessageThread from "./MessageThread";

export default function InboxView() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-8rem)] glass-card rounded-xl border border-white/10 overflow-hidden">
      <div className="w-80 border-r border-white/5 flex flex-col">
        {/* Filters */}
        <div className="p-3 border-b border-white/5">
          <select className="w-full text-sm border border-white/10 rounded-lg px-2 py-1.5 focus:outline-none">
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
      <div className="flex-1">
        {selectedThreadId ? (
          <MessageThread threadId={selectedThreadId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
