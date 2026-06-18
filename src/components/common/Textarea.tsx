import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, invalid, rows = 3, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400',
        'focus:outline-none focus:ring-2',
        invalid
          ? 'border-danger focus:border-danger focus:ring-danger/30'
          : 'border-neutral-300 focus:border-lgred focus:ring-lgred/30',
        className,
      )}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  ),
);
Textarea.displayName = 'Textarea';
