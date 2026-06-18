import { useRef } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  parts: [string, string, string, string];
  onChange: (parts: [string, string, string, string]) => void;
  invalid?: boolean;
};

/** IP 마스크 입력 ___.___.___.___ (PRD §4.3 IP 탭). */
export function IpMaskInput({ parts, onChange, invalid }: Props) {
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const setPart = (i: number, raw: string) => {
    const v = raw.replace(/\D/g, '').slice(0, 3);
    const next = [...parts] as [string, string, string, string];
    next[i] = v;
    onChange(next);
    if (v.length === 3 && i < 3) refs[i + 1]?.current?.focus();
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md border bg-white px-2',
        invalid ? 'border-danger' : 'border-neutral-300',
      )}
    >
      {parts.map((p, i) => (
        <span key={i} className="flex items-center">
          <input
            ref={refs[i]}
            inputMode="numeric"
            value={p}
            onChange={(e) => setPart(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && p === '' && i > 0) refs[i - 1]?.current?.focus();
            }}
            placeholder="___"
            className="h-9 w-12 bg-transparent text-center font-mono text-sm focus:outline-none"
            aria-label={`IP 부분 ${i + 1}`}
          />
          {i < 3 && <span className="text-neutral-400">.</span>}
        </span>
      ))}
    </div>
  );
}
