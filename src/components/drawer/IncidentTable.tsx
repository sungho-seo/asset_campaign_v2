import { cn } from '@/lib/cn';

type IncidentTableProps = {
  columns: string[];
  rows: string[][];
  filter?: string;
  /** 취소선 처리할 컬럼 인덱스 (예: overwrite 이전 사용자) */
  strikeColumn?: number;
};

/** v1 이식 — 이상 징후 상세 테이블 (mono 헤더, hover 행). */
export function IncidentTable({ columns, rows, filter = '', strikeColumn }: IncidentTableProps) {
  const needle = filter.trim().toLowerCase();
  const filtered = needle
    ? rows.filter((r) => r.some((c) => c.toLowerCase().includes(needle)))
    : rows;

  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c}
              className="sticky top-0 z-[1] border-b border-line bg-bg-soft/60 px-6 py-2.5 text-left font-mono text-[10.5px] font-medium uppercase tracking-wider text-text-3"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filtered.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-6 py-12 text-center text-[12.5px] text-text-3"
            >
              조건에 맞는 결과가 없습니다.
            </td>
          </tr>
        ) : (
          filtered.map((row, i) => (
            <tr key={i} className="border-b border-line transition-colors hover:bg-bg-soft/50">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={cn(
                    'px-6 py-3.5 align-top',
                    j === 0
                      ? 'font-mono text-[12.5px] font-medium text-text'
                      : 'text-[12px] text-text-2',
                    strikeColumn === j && 'text-text-4 line-through',
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
