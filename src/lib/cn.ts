import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 조건부 className 결합 + Tailwind 충돌 병합 (v1과 동일). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
