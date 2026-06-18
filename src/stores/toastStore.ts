import { create } from 'zustand';

export type ToastVariant = 'success' | 'info' | 'warn' | 'danger';

export type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastState = {
  toasts: Toast[];
  show: (message: string, variant?: ToastVariant) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (message, variant = 'success') => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** 컴포넌트 밖에서도 호출 가능한 헬퍼. */
export const toast = {
  success: (m: string) => useToastStore.getState().show(m, 'success'),
  info: (m: string) => useToastStore.getState().show(m, 'info'),
  warn: (m: string) => useToastStore.getState().show(m, 'warn'),
  danger: (m: string) => useToastStore.getState().show(m, 'danger'),
};
