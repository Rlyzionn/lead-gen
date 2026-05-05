import AICommandCenter from "@/components/command/AICommandCenter";

export default function CommandPage() {
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-semibold text-white mb-4">AI Command Center</h1>
      <div className="flex-1">
        <AICommandCenter />
      </div>
    </div>
  );
}
