import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Users, UserCheck, FileText } from 'lucide-react';
import { KPICard } from '@/components/kpi/KPICard';
import { ListSidePanel } from '@/components/drawer/ListSidePanel';
import { getKpi, getAccessLog, getUpdatedAssets } from '@/lib/api/dashboard';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';
import { AbandonedCard } from './AbandonedCard';

const HINT_IDENTIFY = '5개 역할 중 누구라도 자산 정보를 갱신했거나 최신 정보임을 확인한 비율입니다.';
const HINT_PARTICIPATE = '보유 자산 유무에 관계없이 안내 페이지에 응답한 임직원 비율입니다.';

export function KpiCards() {
  const { data: kpi } = useQuery({ queryKey: ['dashboard', 'kpi'], queryFn: getKpi });
  const [panel, setPanel] = useState<'access' | 'update' | null>(null);

  if (!kpi) {
    return (
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-bg-soft" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KPICard
          label="식별률"
          icon={CheckCircle2}
          value={(kpi.identifyRate * 100).toFixed(1)}
          unit="%"
          variant="progress"
          progressFill={kpi.identifyRate * 100}
          progressMeta={{
            left: `${kpi.identifiedCount.toLocaleString()} / ${kpi.totalAssets.toLocaleString()}`,
            right: '전체 자산 대비',
          }}
          hint={HINT_IDENTIFY}
        />
        <KPICard
          label="참여율"
          icon={Users}
          value={(kpi.participateRate * 100).toFixed(1)}
          unit="%"
          variant="progress"
          progressFill={kpi.participateRate * 100}
          progressMeta={{
            left: `${kpi.participantCount.toLocaleString()} / ${kpi.totalEmployees.toLocaleString()}`,
            right: '안내 응답 완료',
          }}
          hint={HINT_PARTICIPATE}
        />
        <KPICard
          label="접속자"
          icon={UserCheck}
          value={kpi.visitorsToday.toLocaleString()}
          unit="명"
          delta={{ value: `+${kpi.visitorsDelta}`, positive: true }}
          footnote={`· 누적 ${kpi.visitorsCumulative.toLocaleString()}`}
          onClick={() => setPanel('access')}
        />
        <KPICard
          label="업데이트 (수정 / 신규)"
          icon={FileText}
          value={kpi.modifiedCount.toLocaleString()}
          unit={`/ ${kpi.newCount.toLocaleString()}`}
          delta={{ value: `+${kpi.modifiedDelta} / +${kpi.newDelta}`, positive: true }}
          onClick={() => setPanel('update')}
        />
        <AbandonedCard />
      </div>

      <AccessPanel open={panel === 'access'} onClose={() => setPanel(null)} />
      <UpdatePanel open={panel === 'update'} onClose={() => setPanel(null)} />
    </>
  );
}

function AccessPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useQuery({ queryKey: ['dashboard', 'access'], queryFn: getAccessLog, enabled: open });
  const rows = data ?? [];
  const team = (p: string) => p.split('>').pop()?.trim() ?? p;
  const match = (e: (typeof rows)[number], f: string) =>
    !f || `${e.empName} ${e.deptPath} ${e.action}`.toLowerCase().includes(f.toLowerCase());

  return (
    <ListSidePanel
      open={open}
      onClose={onClose}
      eyebrow="KPI · 접속자"
      title="당일 접속자 목록"
      desc="타임스탬프 · 이름·소속 · 액션 종류"
      stats={[{ label: '접속자', value: `${rows.length}명` }]}
      searchPlaceholder="이름 / 소속 / 액션 필터"
      padded
      csv={{
        filename: 'visitors.csv',
        headers: ['시각', '이름', '소속', '액션'],
        rows: rows.map((e) => [formatDateTime(e.at), e.empName, e.deptPath, e.action]),
      }}
    >
      {(filter) => (
        <div className="space-y-1.5">
          {rows.filter((e) => match(e, filter)).map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-[12.5px]">
              <div className="min-w-0">
                <div className="font-medium text-text">{e.empName}</div>
                <div className="truncate text-[10.5px] text-text-4">{team(e.deptPath)}</div>
              </div>
              <div className="ml-2 shrink-0 text-right">
                <span className={cn('rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium',
                  e.action === '담당자삭제' ? 'bg-danger-soft text-danger' : e.action === '단순접속' ? 'bg-bg-soft text-text-3' : 'bg-success-soft text-success')}>
                  {e.action}
                </span>
                <div className="mt-0.5 font-mono text-[11px] text-text-4">{formatDateTime(e.at).slice(-5)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ListSidePanel>
  );
}

function UpdatePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useQuery({ queryKey: ['dashboard', 'updated'], queryFn: getUpdatedAssets, enabled: open });
  const rows = data ?? [];
  const counts = { mod: rows.filter((r) => r.kind === 'modified').length, neo: rows.filter((r) => r.kind === 'new').length };
  const match = (e: (typeof rows)[number], f: string) =>
    !f || `${e.hostname} ${e.by} ${e.csp ?? ''}`.toLowerCase().includes(f.toLowerCase());

  return (
    <ListSidePanel
      open={open}
      onClose={onClose}
      eyebrow="KPI · 업데이트"
      title="업데이트 자산 목록"
      desc="수정 / 신규 구분"
      stats={[
        { label: '수정', value: `${counts.mod}건` },
        { label: '신규', value: `${counts.neo}건` },
      ]}
      searchPlaceholder="자산명 / 수정자 필터"
      padded
      csv={{
        filename: 'updated-assets.csv',
        headers: ['자산명', '구분', '수정자', '시각', 'CSP'],
        rows: rows.map((e) => [e.hostname, e.kind === 'new' ? '신규' : '수정', e.by, formatDateTime(e.at), e.csp ?? '']),
      }}
    >
      {(filter) => (
        <div className="space-y-1.5">
          {rows.filter((e) => match(e, filter)).map((e) => (
            <div key={e.id} className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-[12.5px]">
              <div className="min-w-0">
                <div className="font-medium text-text">
                  {e.hostname}
                  {e.csp && <span className="ml-1.5 font-mono text-[11px] text-text-4">{e.csp}</span>}
                </div>
                <div className="font-mono text-[11px] text-text-3">{e.by} · {formatDateTime(e.at)}</div>
              </div>
              <span className={cn('rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium',
                e.kind === 'new' ? 'bg-purple-soft text-purple' : 'bg-success-soft text-success')}>
                {e.kind === 'new' ? '신규' : '수정'}
              </span>
            </div>
          ))}
        </div>
      )}
    </ListSidePanel>
  );
}
