import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, ArrowDown } from 'lucide-react';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { getAbandoned } from '@/lib/api/dashboard';
import { cn } from '@/lib/cn';

type Tab = 'all' | 'withOwner' | 'withAccess';

const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: '전체 방치' },
  { value: 'withOwner', label: '담당자 지정' },
  { value: 'withAccess', label: '접속 이력 있음' },
];

export function AbandonedCard() {
  const { data } = useQuery({ queryKey: ['dashboard', 'abandoned'], queryFn: getAbandoned });
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const rows = data?.tabs[tab] ?? [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-line bg-white px-5 py-4 text-left shadow-sm transition-colors hover:border-brand/40"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-bg-soft text-text-3">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-3">방치 자산</div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-[22px] font-semibold tracking-tighter2 text-danger">
                {data?.abandoned.toLocaleString() ?? '—'}
              </span>
              <span className="font-mono text-[12px] text-text-3">
                / {data?.total.toLocaleString()}건
              </span>
            </div>
          </div>
        </div>
        <span className="flex items-center gap-1 font-mono text-[12px] text-success">
          <ArrowDown className="h-3 w-3" /> {data?.delta} (전일 대비)
        </span>
      </button>

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="방치 자산"
        title="방치 자산 목록"
        subtitle="수정도 최신 확인도 없는 자산"
      >
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
          {rows.map((r) => (
            <div key={r.id} className="rounded-md border border-line px-3 py-2 text-[12.5px]">
              <div className="font-medium text-text">{r.hostname}</div>
              <div className="text-[11.5px] text-text-3">{r.note}</div>
            </div>
          ))}
        </div>
      </SideDrawer>
    </>
  );
}
