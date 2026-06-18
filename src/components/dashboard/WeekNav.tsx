import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  week: number; // 0-based
  total: number;
  onChange: (week: number) => void;
};

/** 주 단위 < W1/W2/W3/W4 > 네비게이션 (진척률 추이·히트맵 공통). */
export function WeekNav({ week, total, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => onChange(Math.max(0, week - 1))}
        disabled={week === 0}
        className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
        aria-label="이전 주"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="min-w-[2.5rem] text-center font-medium text-neutral-700">W{week + 1}</span>
      <button
        onClick={() => onChange(Math.min(total - 1, week + 1))}
        disabled={week === total - 1}
        className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
        aria-label="다음 주"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
