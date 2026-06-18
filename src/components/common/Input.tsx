import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  mono?: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ className, invalid, mono, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-md border bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400',
        'focus:outline-none focus:ring-2',
        invalid
          ? 'border-danger focus:border-danger focus:ring-danger/30'
          : 'border-neutral-300 focus:border-lgred focus:ring-lgred/30',
        mono && 'font-mono',
        'disabled:cursor-not-allowed disabled:bg-neutral-100',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  ),
);
Input.displayName = 'Input';
