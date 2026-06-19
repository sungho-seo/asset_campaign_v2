import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { KPICard } from '@/components/kpi/KPICard';
import { ListSidePanel } from '@/components/drawer/ListSidePanel';
import { getAbandoned } from '@/lib/api/dashboard';
import { cn } from '@/lib/cn';

type Tab = 'all' | 'withOwner' | 'withAccess';

const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: '전체 방치' },
  { value: 'withOwner', label: '담당자 지정' },
  { value: 'withAccess', label: '접속 이력 있음' },
];

/** 방치 자산 — KPI 카드 레벨 + 3탭 드로어(검색·CSV·상세 stats). */
export function AbandonedCard() {
  const { data } = useQuery({ queryKey: ['dashboard', 'abandoned'], queryFn: getAbandoned });
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const delta = data?.delta ?? 0;
  const rows = data?.tabs[tab] ?? [];

  return (
    <>
      <KPICard
        label="방치 자산"
        icon={Clock}
        value={data?.abandoned.toLocaleString() ?? '—'}
        unit={data ? `/ ${data.total.toLocaleString()}` : undefined}
        delta={{ value: `${delta > 0 ? '+' : '−'}${Math.abs(delta)}`, positive: delta < 0 }}
        onClick={() => setOpen(true)}
      />

      <ListSidePanel
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="방치 자산"
        title="방치 자산 목록"
        desc="수정도 최신 확인도 없는 자산"
        stats={
          data
            ? [
                { label: '방치 자산', value: `${data.abandoned.toLocaleString()}건` },
                { label: '전체 자산', value: `${data.total.toLocaleString()}건` },
                { label: '전일 대비', value: `${delta}건` },
              ]
            : undefined
        }
        searchPlaceholder="자산명 필터"
        padded
        csv={{
          filename: `abandoned-${tab}.csv`,
          headers: ['자산명', '분류'],
          rows: rows.map((r) => [r.hostname, r.note]),
        }}
      >
        {(filter) => (
          <>
            <div className="mb-3 flex gap-1 border-b border-line">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    '-mb-px border-b-2 px-3 py-2 text-[12.5px] font-medium transition-colors',
                    tab === t.value
                      ? 'border-brand text-brand'
                      : 'border-transparent text-text-3 hover:text-text',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'withAccess' && (
              <p className="mb-2 rounded-md bg-danger-soft px-3 py-2 text-[11.5px] text-danger">
                담당자가 접속·열람했음에도 갱신하지 않은 자산 — 가장 심각
              </p>
            )}

            <div className="space-y-1.5">
              {rows
                .filter((r) => !filter || `${r.hostname} ${r.note}`.toLowerCase().includes(filter.toLowerCase()))
                .map((r) => (
                  <div key={r.id} className="rounded-md border border-line px-3 py-2 text-[12.5px]">
                    <div className="font-medium text-text">{r.hostname}</div>
                    <div className="text-[11.5px] text-text-3">{r.note}</div>
                  </div>
                ))}
            </div>
          </>
        )}
      </ListSidePanel>
    </>
  );
}
