import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Option = { value: string; label: string };

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  options: Option[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ className, invalid, options, placeholder, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border bg-white px-3 text-sm text-neutral-900',
        'focus:outline-none focus:ring-2',
        invalid
          ? 'border-danger focus:border-danger focus:ring-danger/30'
          : 'border-neutral-300 focus:border-lgred focus:ring-lgred/30',
        'disabled:cursor-not-allowed disabled:bg-neutral-100',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
);
Select.displayName = 'Select';
