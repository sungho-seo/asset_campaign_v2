import { Info } from 'lucide-react';

/** (i) 호버 툴팁 — 지표 분모/분자 정의 표기 (PRD §7.9). */
export function InfoHint({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <Info size={14} className="cursor-help text-neutral-400" />
      <span className="pointer-events-none absolute left-1/2 top-5 z-10 w-60 -translate-x-1/2 rounded-md bg-neutral-800 px-2.5 py-1.5 text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}
