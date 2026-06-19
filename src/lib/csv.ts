/** 클라이언트 CSV 다운로드 — 목록 사이드 패널 공통. */
function escapeCell(v: string): string {
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const lines = [headers, ...rows].map((r) => r.map(escapeCell).join(','));
  // 엑셀 한글 깨짐 방지 BOM
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
