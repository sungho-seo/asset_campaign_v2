/** IPv4 / 도메인 / 이메일 검증 (PRD §5.2). */

const IPV4_RE =
  /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export function isValidIPv4(value: string): boolean {
  return IPV4_RE.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidDomain(value: string): boolean {
  if (!value.trim()) return true; // 선택 항목
  return /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(value.trim());
}

/** IP 마스크 입력(___.___.___.___)을 조립. parts 4개를 받아 IPv4 문자열로. */
export function joinIpParts(parts: string[]): string {
  return parts.map((p) => p.trim()).join('.');
}
