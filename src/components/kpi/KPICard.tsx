import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/cn';

type Delta = { value: string; positive?: boolean };

type KPICardProps = {
  label: string;
  icon: LucideIcon;
  value: string | number;
  unit?: string;
  delta?: Delta;
  variant?: 'default' | 'progress';
  progressFill?: number;
  progressMeta?: { left: string; right: string };
  /** (i) 호버 정의 (PRD §7.9) */
  hint?: string;
  /** 하단 보조 줄 (예: 누적 N) */
  footnote?: string;
  onClick?: () => void;
};

/** v1 이식 — KPI 카드. v8용으로 hint/onClick/footnote 확장. */
export function KPICard({
  label,
  icon: Icon,
  value,
  unit,
  delta,
  variant = 'default',
  progressFill,
  progressMeta,
  hint,
  footnote,
  onClick,
}: KPICardProps) {
  const clickable = !!onClick;
  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        'relative overflow-hidden rounded-lg border border-line p-5 shadow-sm',
        variant === 'progress' ? 'bg-gradient-to-b from-white to-bg-soft/40' : 'bg-white',
        clickable && 'cursor-pointer transition-colors hover:border-brand/40',
      )}
    >
      <div className="mb-2.5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-3">
        <span className="grid h-[18px] w-[18px] place-items-center rounded bg-bg-soft text-text-3">
          <Icon className="h-2.5 w-2.5" />
        </span>
        {label}
        {hint && (
          <span className="group/hint relative ml-0.5 inline-flex">
            <Info className="h-3 w-3 cursor-help text-text-4" />
            <span className="pointer-events-none absolute left-1/2 top-5 z-10 w-56 -translate-x-1/2 rounded-md bg-text px-2.5 py-1.5 text-[11px] normal-case leading-snug tracking-normal text-white opacity-0 shadow-lg transition-opacity group-hover/hint:opacity-100">
              {hint}
            </span>
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 leading-none">
        <div className="text-[26px] font-semibold tracking-tighter2">{value}</div>
        {unit && <span className="text-[13px] font-medium text-text-3">{unit}</span>}
      </div>
      {variant === 'progress' && progressFill !== undefined ? (
        <>
          <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-bg-soft">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-[width] duration-500"
              style={{ width: `${Math.min(progressFill, 100)}%` }}
            />
          </div>
          {progressMeta && (
            <div className="mt-1.5 flex justify-between font-mono text-[11px] text-text-3">
              <span>{progressMeta.left}</span>
              <span>{progressMeta.right}</span>
            </div>
          )}
        </>
      ) : (
        <div className="mt-2 flex items-center gap-2 text-[11.5px] text-text-3">
          {delta && (
            <span className="flex items-center gap-1.5">
              <strong
                className={cn(
                  'font-mono font-semibold',
                  delta.positive === false ? 'text-danger' : 'text-success',
                )}
              >
                {delta.value}
              </strong>
              어제 대비
            </span>
          )}
          {footnote && <span className="font-mono text-text-4">{footnote}</span>}
        </div>
      )}
    </div>
  );
}
