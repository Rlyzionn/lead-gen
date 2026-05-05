"use client";
import { useState, useRef } from "react";
import { Mic, Upload, FileText, Type } from "lucide-react";
import { useParseCampaign } from "@/lib/hooks/useCampaigns";

type InputMode = "transcript" | "audio-upload" | "voice-note" | "text";

interface Props {
  onParsed: (brief: Record<string, unknown>) => void;
}

const MODES = [
  { id: "transcript" as InputMode, label: "Paste Transcript", icon: FileText },
  { id: "audio-upload" as InputMode, label: "Upload Audio", icon: Upload },
  { id: "voice-note" as InputMode, label: "Voice Note", icon: Mic },
  { id: "text" as InputMode, label: "Type Description", icon: Type },
];

export default function TranscriptParser({ onParsed }: Props) {
  const [mode, setMode] = useState<InputMode>("transcript");
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutate: parse, isPending } = useParseCampaign();

  function handleParse() {
    parse({ mode, text }, { onSuccess: (brief) => onParsed(brief) });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              mode === id
                ? "bg-brand-500/20 border-brand-500 text-brand-400"
                : "border-white/10 text-gray-300 hover:border-white/20"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {(mode === "transcript" || mode === "text") && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={
            mode === "transcript"
              ? "Paste your Zoom or Otter.ai transcript here…"
              : "Describe the role, requirements, and ideal candidate…"
          }
          className="w-full border border-white/10 rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-brand-500"
        />
      )}

      {mode === "audio-upload" && (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center cursor-pointer hover:border-brand-400 transition-colors"
        >
          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Click to upload an audio file (mp3, m4a, wav)</p>
          <input ref={fileRef} type="file" accept="audio/*" className="hidden" />
        </div>
      )}

      {mode === "voice-note" && (
        <div className="flex flex-col items-center gap-4 py-8">
          <button className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors">
            <Mic size={24} className="text-white" />
          </button>
          <p className="text-sm text-gray-500">Press to record a voice note</p>
        </div>
      )}

      <button
        onClick={handleParse}
        disabled={isPending || ((mode === "transcript" || mode === "text") && !text.trim())}
        className="px-6 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
      >
        {isPending ? "Parsing…" : "Parse Requirements →"}
      </button>
    </div>
  );
}
