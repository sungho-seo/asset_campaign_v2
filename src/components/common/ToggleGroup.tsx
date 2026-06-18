import { cn } from '@/lib/cn';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  value: T | null;
  onChange: (value: T) => void;
  options: [Option<T>, Option<T>];
  name?: string;
  disabled?: boolean;
  className?: string;
};

/** yes/no 2-state 토글 (외부 접속 여부 등). */
export function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
  name,
  disabled,
  className,
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={cn('inline-flex rounded-md border border-neutral-300 p-0.5', className)}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-8 min-w-[64px] rounded px-3 text-sm font-medium transition-colors',
              active ? 'bg-lgred text-white' : 'text-neutral-600 hover:bg-neutral-100',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
