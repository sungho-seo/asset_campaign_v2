import { useState } from 'react';
import type { ReactNode } from 'react';
import { Search, Download } from 'lucide-react';
import { SideDrawer } from './SideDrawer';
import { Input } from '@/components/common/Input';
import { downloadCsv } from '@/lib/csv';

export type StatItem = { label: string; value: string };
export type CsvSpec = { filename: string; headers: string[]; rows: string[][] };

type Props = {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  desc?: string;
  stats?: StatItem[];
  width?: number;
  padded?: boolean;
  /** 검색창 노출 시 placeholder */
  searchPlaceholder?: string;
  /** CSV 내보내기 (현재 데이터 전체) */
  csv?: CsvSpec;
  /** filter 문자열을 받아 목록을 렌더 */
  children: (filter: string) => ReactNode;
};

/**
 * 목록 사이드 패널 공통 스캐폴드 (v1 룩).
 * 상단: 제목 + 설명 + 상세 stats(발생 건수/최근 24h/최초 발생 등)
 * 툴바: 검색창 + CSV 다운로드
 */
export function ListSidePanel({
  open,
  onClose,
  eyebrow,
  title,
  desc,
  stats,
  width = 720,
  padded = false,
  searchPlaceholder,
  csv,
  children,
}: Props) {
  const [filter, setFilter] = useState('');

  const handleClose = () => {
    setFilter('');
    onClose();
  };

  const hasToolbar = !!searchPlaceholder || !!csv;

  return (
    <SideDrawer
      open={open}
      onClose={handleClose}
      width={width}
      padded={padded}
      header={
        <>
          {eyebrow && (
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-3">{eyebrow}</div>
          )}
          <h2 className="text-base font-semibold tracking-tightish text-text">{title}</h2>
          {desc && <p className="mt-0.5 text-[12.5px] text-text-3">{desc}</p>}
          {stats && stats.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-5">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-mono text-[10.5px] uppercase tracking-wider text-text-3">
                    {s.label}
                  </span>
                  <span className="text-[15px] font-semibold tracking-tightish text-text">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      }
      toolbar={
        hasToolbar ? (
          <>
            {searchPlaceholder ? (
              <div className="relative max-w-[280px] flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-4" />
                <Input
                  mono
                  className="h-8 py-1.5 pl-7 text-xs"
                  placeholder={searchPlaceholder}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
            ) : (
              <span />
            )}
            {csv && (
              <button
                type="button"
                onClick={() => downloadCsv(csv.filename, csv.headers, csv.rows)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-xs font-medium text-text-2 hover:bg-bg-soft"
              >
                <Download className="h-3 w-3" /> CSV
              </button>
            )}
          </>
        ) : undefined
      }
    >
      {children(filter)}
    </SideDrawer>
  );
}
