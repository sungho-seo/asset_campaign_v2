import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  width?: number; // px
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * 재사용 사이드 패널 — 임직원 자산 편집 + 대시보드 사이드 패널 양쪽에서 사용.
 * ESC로 닫기, 오버레이 클릭으로 닫기 지원.
 */
export function SideDrawer({
  open,
  onClose,
  title,
  subtitle,
  width = 560,
  footer,
  children,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'absolute right-0 top-0 flex h-full max-w-[95vw] flex-col bg-white shadow-drawer',
          'animate-[slidein_0.2s_ease-out]',
        )}
        style={{ width }}
      >
        <header className="flex items-start justify-between border-b border-neutral-200 px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h2 className="truncate text-base font-semibold text-neutral-900">{title}</h2>
            )}
            {subtitle && <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="ml-3 rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="border-t border-neutral-200 px-5 py-3">{footer}</footer>
        )}
      </aside>
    </div>
  );
}
