import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeVariant =
  | 'mine'
  | 'unassigned'
  | 'assigned'
  | 'success'
  | 'warn'
  | 'danger'
  | 'neutral'
  | 'info';

const variantClasses: Record<BadgeVariant, string> = {
  mine: 'bg-lgred-50 text-lgred-700 ring-1 ring-inset ring-lgred-200',
  unassigned: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  assigned: 'bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200',
  success: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
  warn: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
  neutral: 'bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
};

type Props = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

export function Badge({ variant = 'neutral', children, className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
