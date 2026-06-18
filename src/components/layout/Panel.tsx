import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/** 카드 컨테이너. */
export function Panel({ title, actions, children, className, bodyClassName }: Props) {
  return (
    <section className={cn('rounded-card border border-neutral-200 bg-white shadow-card', className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          {title && <h2 className="text-sm font-semibold text-neutral-800">{title}</h2>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('p-4', bodyClassName)}>{children}</div>
    </section>
  );
}
