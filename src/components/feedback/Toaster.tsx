import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useToastStore } from '@/stores/toastStore';
import type { ToastVariant } from '@/stores/toastStore';
import { cn } from '@/lib/cn';

const config: Record<ToastVariant, { icon: typeof Info; cls: string }> = {
  success: { icon: CheckCircle2, cls: 'border-green-200 bg-green-50 text-green-800' },
  info: { icon: Info, cls: 'border-blue-200 bg-blue-50 text-blue-800' },
  warn: { icon: AlertTriangle, cls: 'border-amber-200 bg-amber-50 text-amber-800' },
  danger: { icon: XCircle, cls: 'border-red-200 bg-red-50 text-red-800' },
};

/** 전역 토스트 표시 영역. App 루트에 1회 마운트. */
export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const { icon: Icon, cls } = config[t.variant];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'flex items-start gap-2 rounded-md border px-3 py-2.5 text-sm shadow-card',
              cls,
            )}
          >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="닫기"
              className="shrink-0 opacity-60 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
