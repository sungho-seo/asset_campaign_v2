import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  onClose: () => void;
  width?: number;
  /** v1 스타일 커스텀 헤더. 주어지면 title/subtitle/eyebrow 대신 사용. */
  header?: ReactNode;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  ariaLabel?: string;
  padded?: boolean;
  children: ReactNode;
};

/**
 * 재사용 사이드 패널 — v1 룩(좌측 브랜드 막대 + 핑크 그라데이션 헤더, portal, ESC).
 * v2 임직원/대시보드 호환: header 미지정 시 eyebrow/title/subtitle 자동 렌더.
 */
export function SideDrawer({
  open,
  onClose,
  width = 680,
  header,
  eyebrow,
  title,
  subtitle,
  toolbar,
  footer,
  ariaLabel,
  padded = true,
  children,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-text/30 transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        style={{ width: `min(${width}px, 100vw)` }}
        className={cn(
          'fixed inset-y-0 right-0 z-[41] flex flex-col bg-white shadow-lg',
          'transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="relative flex flex-shrink-0 items-start justify-between gap-4 border-b border-line bg-gradient-to-r from-brand-soft/55 via-white to-white px-6 py-4">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-brand" />
          <div className="min-w-0 flex-1">
            {header ?? (
              <>
                {eyebrow && (
                  <div className="font-mono text-[11px] uppercase tracking-wider text-text-3">
                    {eyebrow}
                  </div>
                )}
                {title && (
                  <h2 className="truncate text-base font-semibold tracking-tightish text-text">
                    {title}
                  </h2>
                )}
                {subtitle && <p className="mt-0.5 text-[12.5px] text-text-3">{subtitle}</p>}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-md border border-line bg-white text-text-3 hover:bg-bg-soft hover:text-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {toolbar && (
          <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-line bg-bg/40 px-6 py-2.5">
            {toolbar}
          </div>
        )}
        <div className={cn('scrollbar-thin flex-1 overflow-y-auto', padded && 'px-6 py-4')}>
          {children}
        </div>
        {footer && (
          <div className="flex-shrink-0 border-t border-line bg-bg/40 px-6 py-3">{footer}</div>
        )}
      </aside>
    </>,
    document.body,
  );
}
