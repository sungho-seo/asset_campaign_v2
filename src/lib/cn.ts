/** 조건부 className 결합 유틸 (clsx 경량 대체). */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
