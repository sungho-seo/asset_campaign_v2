import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { InfoHint } from './InfoHint';

type Props = {
  title: string;
  hint?: string;
  children: ReactNode;
  onClick?: () => void;
};

export function KpiCard({ title, hint, children, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-card border border-neutral-200 bg-white p-4 shadow-card',
        onClick && 'cursor-pointer transition-colors hover:border-lgred-200',
      )}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
        {title}
        {hint && <InfoHint text={hint} />}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/** 식별률/참여율 공통 프로그레스 표현. */
export function RateBody({
  rate,
  numer,
  denom,
  unit,
}: {
  rate: number;
  numer: number;
  denom: number;
  unit: string;
}) {
  const pct = Math.round(rate * 1000) / 10;
  return (
    <div>
      <div className="text-3xl font-bold text-lgred">{pct}%</div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-lgred" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="mt-1.5 text-xs text-neutral-500">
        {unit} {numer.toLocaleString()} / 전체 {denom.toLocaleString()}
      </div>
    </div>
  );
}
