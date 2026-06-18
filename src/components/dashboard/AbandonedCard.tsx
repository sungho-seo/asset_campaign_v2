import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowDown } from 'lucide-react';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { Tabs } from '@/components/layout/Tabs';
import { getAbandoned } from '@/lib/api/dashboard';

type Tab = 'all' | 'withOwner' | 'withAccess';

export function AbandonedCard() {
  const { data } = useQuery({ queryKey: ['dashboard', 'abandoned'], queryFn: getAbandoned });
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('all');

  const rows = data?.tabs[tab] ?? [];

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded-card border border-neutral-200 bg-white p-4 shadow-card transition-colors hover:border-lgred-200"
      >
        <div className="text-xs font-semibold text-neutral-500">방치 자산</div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-danger">{data?.abandoned.toLocaleString() ?? '—'}</span>
          <span className="text-sm text-neutral-400">/ {data?.total.toLocaleString()}</span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-success">
          <ArrowDown size={12} /> 전일 대비 {data?.delta} (방치 감소)
        </div>
      </div>

      <SideDrawer open={open} onClose={() => setOpen(false)} title="방치 자산" subtitle="수정도 최신 확인도 없는 자산">
        <Tabs
          value={tab}
          onChange={(t) => setTab(t as Tab)}
          items={[
            { value: 'all', label: '전체 방치' },
            { value: 'withOwner', label: '담당자 지정' },
            { value: 'withAccess', label: '접속 이력 있음' },
          ]}
        />
        <div className="mt-3 space-y-1.5">
          {tab === 'withAccess' && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
              담당자가 접속해 열람했음에도 갱신하지 않은 자산 — 가장 심각
            </p>
          )}
          {rows.map((r) => (
            <div key={r.id} className="rounded-md border border-neutral-200 px-3 py-2 text-sm">
              <div className="font-medium text-neutral-800">{r.hostname}</div>
              <div className="text-xs text-neutral-400">{r.note}</div>
            </div>
          ))}
        </div>
      </SideDrawer>
    </>
  );
}
