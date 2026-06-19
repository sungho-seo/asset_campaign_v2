import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** v1 이식 — 대시보드 본문 컨테이너 (max-width 1280px). */
export function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto max-w-[1280px] px-8 pb-20 pt-8', className)}>{children}</div>;
}
