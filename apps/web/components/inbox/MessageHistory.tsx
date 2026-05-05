"use client";

interface Props {
  candidateId: string;
}

export default function MessageHistory({ candidateId }: Props) {
  // TODO: fetch from GET /api/candidates/:id/messages
  return (
    <div className="glass-card rounded-xl border border-white/10 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-white">Message History</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>
      </div>
    </div>
  );
}
