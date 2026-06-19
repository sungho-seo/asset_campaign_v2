import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type PanelProps = {
  title?: ReactNode;
  subtitle?: string;
  /** 헤더 우측 영역 (v1 headerRight / v2 actions 호환) */
  headerRight?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  padded?: boolean;
};

/** v1 이식 — 카드 컨테이너. v2 임직원 화면(title/actions)과 대시보드(subtitle/padded) 모두 호환. */
export function Panel({
  title,
  subtitle,
  headerRight,
  actions,
  children,
  className,
  bodyClassName,
  padded = true,
}: PanelProps) {
  const right = headerRight ?? actions;
  return (
    <section
      className={cn('overflow-hidden rounded-lg border border-line bg-panel shadow-sm', className)}
    >
      {(title || right) && (
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex flex-col gap-[1px]">
            {title && (
              <h3 className="text-[13.5px] font-semibold tracking-tightish text-text">{title}</h3>
            )}
            {subtitle && <div className="font-mono text-[11.5px] text-text-3">{subtitle}</div>}
          </div>
          {right && <div className="flex items-center gap-1.5 text-xs text-text-3">{right}</div>}
        </header>
      )}
      <div className={cn(padded && 'px-5 py-4', bodyClassName)}>{children}</div>
    </section>
  );
}
