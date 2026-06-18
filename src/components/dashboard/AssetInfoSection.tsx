import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Cloud, UserX, LogOut, Copy, RefreshCw, ChevronDown } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { Badge } from '@/components/common/Badge';
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

  const card = (active: boolean) =>
    cn(
      'cursor-pointer rounded-card border bg-white p-4 text-left shadow-card transition-colors hover:border-lgred-200',
      active ? 'border-lgred-200' : 'border-neutral-200',
    );

  return (
    <Panel title="IT 자산 정보">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <button className={card(false)} onClick={() => setPanel('onprem')}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <Server size={14} /> 온프레미스
          </div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {data?.onprem.total.toLocaleString() ?? '—'}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            갱신 {data?.onprem.modified ?? 0} · 신규 {data?.onprem.neo ?? 0}
          </div>
        </button>

        <button className={card(false)} onClick={() => setPanel('cloud')}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <Cloud size={14} /> 클라우드
          </div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">
            {data?.cloud.total.toLocaleString() ?? '—'}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            갱신 {data?.cloud.modified ?? 0} · 신규 {data?.cloud.neo ?? 0}
          </div>
        </button>

        <button className={card(false)} onClick={() => setPanel('unassigned')}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <UserX size={14} /> 담당자 미지정
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {data?.unassigned.toLocaleString() ?? '—'}
          </div>
          <div className="mt-1 text-xs text-neutral-500">담당자가 전혀 없는 자산</div>
        </button>

        <button className={card(false)} onClick={() => setPanel('retired')}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <LogOut size={14} /> 담당자 전원 퇴사
          </div>
          <div className="mt-1 text-2xl font-bold text-danger">{data?.retired ?? '—'}</div>
          <div className="mt-1 text-xs text-neutral-500">인사 별도 쿼리 결과</div>
        </button>

        <button className={card(false)} onClick={() => setPanel('dup-ip-new')}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <Copy size={14} /> IP 중복 · 신규 등록
          </div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">{data?.dupIpNew ?? 0}</div>
          <div className="mt-1 text-xs text-neutral-500">다중 중복 신규 등록</div>
        </button>

        <button className={card(false)} onClick={() => setPanel('dup-ip-update')}>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
            <RefreshCw size={14} /> IP 중복 · 정보 갱신
          </div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">{data?.dupIpUpdate ?? 0}</div>
          <div className="mt-1 text-xs text-neutral-500">단일 중복 → 현업 추가</div>
        </button>
      </div>

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
    <SideDrawer open={open} onClose={onClose} title={TITLES[kind]}>
      <div className="space-y-1.5">
        {data?.length === 0 && <p className="text-sm text-neutral-400">해당 자산이 없습니다.</p>}
        {data?.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
            <div className="min-w-0">
              <div className="font-medium text-neutral-800">
                {r.hostname}
                {r.csp && <span className="ml-1.5 text-xs text-neutral-400">{r.csp}</span>}
              </div>
              {r.sub && <div className="truncate text-xs text-neutral-400">{r.sub}</div>}
            </div>
            {r.tag && (
              <Badge variant={r.tag === 'new' ? 'info' : r.tag === 'unassigned' ? 'warn' : 'success'}>
                {r.tag === 'new' ? '신규' : r.tag === 'unassigned' ? '미지정' : '수정'}
              </Badge>
            )}
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
    <SideDrawer open={open} onClose={onClose} title="IP 중복 · 신규 등록" subtitle="신규 자산 + 동일 IP 자산 펼치기">
      <div className="space-y-1.5">
        {data?.length === 0 && <p className="text-sm text-neutral-400">해당 자산이 없습니다.</p>}
        {data?.map((e) => (
          <div key={e.id} className="rounded-md border border-neutral-200 text-sm">
            <button
              className="flex w-full items-center justify-between px-3 py-2"
              onClick={() => setExpanded((p) => (p === e.id ? null : e.id))}
            >
              <div className="min-w-0 text-left">
                <div className="font-medium text-neutral-800">{e.hostname}</div>
                <div className="font-mono text-xs text-neutral-400">{e.ip} · {e.at}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="warn">중복 {e.duplicates.length}</Badge>
                <ChevronDown size={15} className={cn('transition-transform', expanded === e.id && 'rotate-180')} />
              </div>
            </button>
            {expanded === e.id && (
              <div className="border-t border-neutral-100 bg-neutral-50 px-3 py-2">
                <div className="mb-1 text-xs font-semibold text-neutral-500">동일 IP 자산</div>
                {e.duplicates.map((d) => (
                  <div key={d.id} className="flex justify-between py-0.5 text-xs">
                    <span className="text-neutral-700">{d.hostname}</span>
                    <span className="text-neutral-400">{d.owners}</span>
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
    <SideDrawer open={open} onClose={onClose} title="IP 중복 · 정보 갱신" subtitle="현업 담당자 추가 결과">
      <div className="space-y-1.5">
        {data?.length === 0 && <p className="text-sm text-neutral-400">해당 자산이 없습니다.</p>}
        {data?.map((e) => (
          <div key={e.id} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
            <div>
              <div className="font-medium text-neutral-800">{e.hostname}</div>
              <div className="text-xs text-neutral-400">{e.at}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="info">담당자 변경</Badge>
              <span className="text-xs text-neutral-500">+{e.addedUser}</span>
            </div>
          </div>
        ))}
      </div>
    </SideDrawer>
  );
}
