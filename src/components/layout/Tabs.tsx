import { cn } from '@/lib/cn';

export type TabItem<T extends string> = { value: T; label: string; count?: number };

type Props<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function Tabs<T extends string>({ items, value, onChange, className }: Props<T>) {
  return (
    <div role="tablist" className={cn('flex gap-1 border-b border-neutral-200', className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'border-lgred text-lgred'
                : 'border-transparent text-neutral-500 hover:text-neutral-800',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
                  active ? 'bg-lgred-50 text-lgred-700' : 'bg-neutral-100 text-neutral-500',
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
