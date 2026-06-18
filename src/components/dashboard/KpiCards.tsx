import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUp } from 'lucide-react';
import { KpiCard, RateBody } from './KpiCard';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { Badge } from '@/components/common/Badge';
import { getKpi, getAccessLog, getUpdatedAssets } from '@/lib/api/dashboard';
import { formatDateTime } from '@/lib/format';

const HINT_IDENTIFY =
  '5개 역할 중 누구라도 자산 정보를 갱신했거나 최신 정보임을 확인한 비율입니다.';
const HINT_PARTICIPATE = '보유 자산 유무에 관계없이 안내 페이지에 응답한 임직원 비율입니다.';

export function KpiCards() {
  const { data: kpi } = useQuery({ queryKey: ['dashboard', 'kpi'], queryFn: getKpi });
  const [panel, setPanel] = useState<'access' | 'update' | null>(null);

  if (!kpi) {
    return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => (
      <div key={i} className="h-32 animate-pulse rounded-card bg-neutral-100" />
    ))}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="식별률" hint={HINT_IDENTIFY}>
          <RateBody rate={kpi.identifyRate} numer={kpi.identifiedCount} denom={kpi.totalAssets} unit="식별" />
        </KpiCard>

        <KpiCard title="참여율" hint={HINT_PARTICIPATE}>
          <RateBody rate={kpi.participateRate} numer={kpi.participantCount} denom={kpi.totalEmployees} unit="참여" />
        </KpiCard>

        <KpiCard title="접속자" onClick={() => setPanel('access')}>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">{kpi.visitorsToday}</span>
            <span className="text-sm text-neutral-400">/ 누적 {kpi.visitorsCumulative.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-success">
            <ArrowUp size={12} /> 전일 대비 +{kpi.visitorsDelta} (당일)
          </div>
        </KpiCard>

        <KpiCard title="업데이트 (수정/신규)" onClick={() => setPanel('update')}>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-neutral-900">{kpi.modifiedCount.toLocaleString()}</span>
            <span className="text-lg text-neutral-300">/</span>
            <span className="text-2xl font-bold text-info">{kpi.newCount.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-success">
            <span className="flex items-center gap-0.5"><ArrowUp size={12} /> 수정 +{kpi.modifiedDelta}</span>
            <span className="flex items-center gap-0.5"><ArrowUp size={12} /> 신규 +{kpi.newDelta}</span>
          </div>
        </KpiCard>
      </div>

      <AccessPanel open={panel === 'access'} onClose={() => setPanel(null)} />
      <UpdatePanel open={panel === 'update'} onClose={() => setPanel(null)} />
    </>
  );
}

function AccessPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useQuery({ queryKey: ['dashboard', 'access'], queryFn: getAccessLog, enabled: open });
  return (
    <SideDrawer open={open} onClose={onClose} title="당일 접속자" subtitle="타임스탬프 · 이름·소속 · 액션">
      <div className="space-y-1.5">
        {data?.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="font-medium text-neutral-800">{e.empName}</div>
              <div className="truncate text-xs text-neutral-400">{e.deptPath}</div>
            </div>
            <div className="ml-2 shrink-0 text-right">
              <Badge variant={e.action === '담당자삭제' ? 'danger' : e.action === '단순접속' ? 'neutral' : 'success'}>
                {e.action}
              </Badge>
              <div className="mt-0.5 text-xs text-neutral-400">{formatDateTime(e.at).slice(11)}</div>
            </div>
          </div>
        ))}
      </div>
    </SideDrawer>
  );
}

function UpdatePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useQuery({ queryKey: ['dashboard', 'updated'], queryFn: getUpdatedAssets, enabled: open });
  return (
    <SideDrawer open={open} onClose={onClose} title="업데이트 자산" subtitle="수정 / 신규 구분">
      <div className="space-y-1.5">
        {data?.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="font-medium text-neutral-800">
                {e.hostname}
                {e.csp && <span className="ml-1.5 text-xs text-neutral-400">{e.csp}</span>}
              </div>
              <div className="text-xs text-neutral-400">{e.by} · {formatDateTime(e.at)}</div>
            </div>
            <Badge variant={e.kind === 'new' ? 'info' : 'success'}>
              {e.kind === 'new' ? '신규' : '수정'}
            </Badge>
          </div>
        ))}
      </div>
    </SideDrawer>
  );
}
