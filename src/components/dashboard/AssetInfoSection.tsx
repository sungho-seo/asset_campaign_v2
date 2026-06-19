import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Cloud, UserX, LogOut, Copy, RefreshCw, ChevronDown } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { MetricRow } from '@/components/kpi/MetricRow';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import {
  getAssetTypeSummary,
  getAssetList,
  getDupIpNew,
  getDupIpUpdate,
} from '@/lib/api/dashboard';
import { cn } from '@/lib/cn';

type PanelKey = 'onprem' | 'cloud' | 'unassigned' | 'retired' | 'dup-ip-new' | 'dup-ip-update';

export function AssetInfoSection() {
  const { data } = useQuery({ queryKey: ['dashboard', 'asset-types'], queryFn: getAssetTypeSummary });
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const d = data;

  return (
    <Panel title="IT 자산 정보" subtitle="자산 유형별 분류 · 클릭하여 목록 보기" padded={false}>
      <MetricRow
        icon={Server}
        iconColor="green"
        name="온프레미스"
        description={`갱신 ${d?.onprem.modified ?? 0} · 신규 ${d?.onprem.neo ?? 0}`}
        value={d?.onprem.total.toLocaleString() ?? '—'}
        unit="건"
        onClick={() => setPanel('onprem')}
      />
      <MetricRow
        icon={Cloud}
        iconColor="blue"
        name="클라우드"
        description={`갱신 ${d?.cloud.modified ?? 0} · 신규 ${d?.cloud.neo ?? 0}`}
        value={d?.cloud.total.toLocaleString() ?? '—'}
        unit="건"
        onClick={() => setPanel('cloud')}
      />
      <MetricRow
        icon={UserX}
        iconColor="amber"
        name="담당자 미지정"
        description="담당자가 전혀 없는 자산"
        value={d?.unassigned.toLocaleString() ?? '—'}
        unit="건"
        onClick={() => setPanel('unassigned')}
      />
      <MetricRow
        icon={LogOut}
        iconColor="red"
        name="담당자 전원 퇴사"
        description="인사 시스템 별도 쿼리 결과"
        value={d?.retired ?? '—'}
        unit="건"
        onClick={() => setPanel('retired')}
      />
      <MetricRow
        icon={Copy}
        iconColor="purple"
        name="IP 중복 · 신규 등록"
        description="다중 중복으로 신규 등록된 자산"
        value={d?.dupIpNew ?? 0}
        unit="건"
        onClick={() => setPanel('dup-ip-new')}
      />
      <MetricRow
        icon={RefreshCw}
        iconColor="gray"
        name="IP 중복 · 정보 갱신"
        description="단일 중복 → 현업 담당자 추가"
        value={d?.dupIpUpdate ?? 0}
        unit="건"
        onClick={() => setPanel('dup-ip-update')}
      />

      {(['onprem', 'cloud', 'unassigned', 'retired'] as const).map((k) => (
        <AssetListDrawer key={k} kind={k} open={panel === k} onClose={() => setPanel(null)} />
      ))}
      <DupIpNewDrawer open={panel === 'dup-ip-new'} onClose={() => setPanel(null)} />
      <DupIpUpdateDrawer open={panel === 'dup-ip-update'} onClose={() => setPanel(null)} />
    </Panel>
  );
}

const TITLES: Record<string, string> = {
  onprem: '온프레미스 자산',
  cloud: '클라우드 자산',
  unassigned: '담당자 미지정 자산',
  retired: '담당자 전원 퇴사 자산',
};

function Tag({ kind }: { kind: 'modified' | 'new' | 'unassigned' }) {
  return (
    <span
      className={cn(
        'rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium',
        kind === 'new'
          ? 'bg-purple-soft text-purple'
          : kind === 'unassigned'
            ? 'bg-warn-soft text-warn'
            : 'bg-success-soft text-success',
      )}
    >
      {kind === 'new' ? '신규' : kind === 'unassigned' ? '미지정' : '수정'}
    </span>
  );
}

function AssetListDrawer({
  kind,
  open,
  onClose,
}: {
  kind: 'onprem' | 'cloud' | 'unassigned' | 'retired';
  open: boolean;
  onClose: () => void;
}) {
  const { data } = useQuery({
    queryKey: ['dashboard', 'asset-list', kind],
    queryFn: () => getAssetList(kind),
    enabled: open,
  });
  return (
    <SideDrawer open={open} onClose={onClose} eyebrow="IT 자산 정보" title={TITLES[kind]}>
      <div className="space-y-1.5">
        {data?.length === 0 && <p className="text-[12.5px] text-text-3">해당 자산이 없습니다.</p>}
        {data?.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-[12.5px]"
          >
            <div className="min-w-0">
              <div className="font-medium text-text">
                {r.hostname}
                {r.csp && <span className="ml-1.5 font-mono text-[11px] text-text-4">{r.csp}</span>}
              </div>
              {r.sub && <div className="truncate text-[11.5px] text-text-3">{r.sub}</div>}
            </div>
            {r.tag && <Tag kind={r.tag} />}
          </div>
        ))}
      </div>
    </SideDrawer>
  );
}

function DupIpNewDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useQuery({ queryKey: ['dashboard', 'dup-ip-new'], queryFn: getDupIpNew, enabled: open });
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <SideDrawer open={open} onClose={onClose} eyebrow="IT 자산 정보" title="IP 중복 · 신규 등록" subtitle="신규 자산 + 동일 IP 자산 펼치기">
      <div className="space-y-1.5">
        {data?.length === 0 && <p className="text-[12.5px] text-text-3">해당 자산이 없습니다.</p>}
        {data?.map((e) => (
          <div key={e.id} className="rounded-md border border-line text-[12.5px]">
            <button
              className="flex w-full items-center justify-between px-3 py-2"
              onClick={() => setExpanded((p) => (p === e.id ? null : e.id))}
            >
              <div className="min-w-0 text-left">
                <div className="font-medium text-text">{e.hostname}</div>
                <div className="font-mono text-[11px] text-text-3">
                  {e.ip} · {e.at}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-warn-soft px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-warn">
                  중복 {e.duplicates.length}
                </span>
                <ChevronDown
                  className={cn('h-3.5 w-3.5 text-text-4 transition-transform', expanded === e.id && 'rotate-180')}
                />
              </div>
            </button>
            {expanded === e.id && (
              <div className="border-t border-line bg-bg-soft/50 px-3 py-2">
                <div className="mb-1 font-mono text-[10.5px] uppercase tracking-wider text-text-3">
                  동일 IP 자산
                </div>
                {e.duplicates.map((dup) => (
                  <div key={dup.id} className="flex justify-between py-0.5 text-[11.5px]">
                    <span className="text-text-2">{dup.hostname}</span>
                    <span className="text-text-4">{dup.owners}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </SideDrawer>
  );
}

function DupIpUpdateDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useQuery({ queryKey: ['dashboard', 'dup-ip-update'], queryFn: getDupIpUpdate, enabled: open });
  return (
    <SideDrawer open={open} onClose={onClose} eyebrow="IT 자산 정보" title="IP 중복 · 정보 갱신" subtitle="현업 담당자 추가 결과">
      <div className="space-y-1.5">
        {data?.length === 0 && <p className="text-[12.5px] text-text-3">해당 자산이 없습니다.</p>}
        {data?.map((e) => (
          <div
            key={e.id}
            className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-[12.5px]"
          >
            <div>
              <div className="font-medium text-text">{e.hostname}</div>
              <div className="font-mono text-[11px] text-text-3">{e.at}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-focus-soft px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-focus">
                담당자 변경
              </span>
              <span className="text-[11.5px] text-text-3">+{e.addedUser}</span>
            </div>
          </div>
        ))}
      </div>
    </SideDrawer>
  );
}
