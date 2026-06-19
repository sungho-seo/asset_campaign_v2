import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Cloud, UserX, LogOut, Copy, RefreshCw } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { MetricRow } from '@/components/kpi/MetricRow';
import { ListSidePanel } from '@/components/drawer/ListSidePanel';
import { IncidentDrawer } from './IncidentDrawer';
import { getAssetTypeSummary, getAssetList } from '@/lib/api/dashboard';
import type { AssetListRow } from '@/lib/api/dashboard';
import { cn } from '@/lib/cn';

type AssetKind = 'onprem' | 'cloud' | 'unassigned' | 'retired';
type PanelKey = AssetKind | 'dup-ip-new' | 'dup-ip-update';

export function AssetInfoSection() {
  const { data } = useQuery({ queryKey: ['dashboard', 'asset-types'], queryFn: getAssetTypeSummary });
  const [panel, setPanel] = useState<PanelKey | null>(null);
  const d = data;

  return (
    <Panel title="IT 자산 정보" subtitle="자산 유형별 분류 · 클릭하여 목록 보기" padded={false}>
      <MetricRow icon={Server} iconColor="green" name="온프레미스"
        description={`갱신 ${d?.onprem.modified ?? 0} · 신규 ${d?.onprem.neo ?? 0}`}
        value={d?.onprem.total.toLocaleString() ?? '—'} unit="건" onClick={() => setPanel('onprem')} />
      <MetricRow icon={Cloud} iconColor="blue" name="클라우드"
        description={`갱신 ${d?.cloud.modified ?? 0} · 신규 ${d?.cloud.neo ?? 0}`}
        value={d?.cloud.total.toLocaleString() ?? '—'} unit="건" onClick={() => setPanel('cloud')} />
      <MetricRow icon={UserX} iconColor="amber" name="담당자 미지정" description="담당자가 전혀 없는 자산"
        value={d?.unassigned.toLocaleString() ?? '—'} unit="건" onClick={() => setPanel('unassigned')} />
      <MetricRow icon={LogOut} iconColor="red" name="담당자 전원 퇴사" description="인사 시스템 별도 쿼리 결과"
        value={d?.retired ?? '—'} unit="건" onClick={() => setPanel('retired')} />
      <MetricRow icon={Copy} iconColor="purple" name="IP 중복 · 신규 등록" description="다중 중복으로 신규 등록된 자산"
        value={d?.dupIpNew ?? 0} unit="건" onClick={() => setPanel('dup-ip-new')} />
      <MetricRow icon={RefreshCw} iconColor="gray" name="IP 중복 · 정보 갱신" description="단일 중복 → 현업 담당자 추가"
        value={d?.dupIpUpdate ?? 0} unit="건" onClick={() => setPanel('dup-ip-update')} />

      {(['onprem', 'cloud', 'unassigned', 'retired'] as const).map((k) => (
        <AssetListDrawer key={k} kind={k} open={panel === k} onClose={() => setPanel(null)} />
      ))}
      <IncidentDrawer open={panel === 'dup-ip-new'} onClose={() => setPanel(null)} anomalyKey="dup-ip-new" eyebrow="IT 자산 정보" title="IP 중복 · 신규 등록" />
      <IncidentDrawer open={panel === 'dup-ip-update'} onClose={() => setPanel(null)} anomalyKey="dup-ip-update" eyebrow="IT 자산 정보" title="IP 중복 · 정보 갱신" />
    </Panel>
  );
}

const TITLES: Record<AssetKind, { title: string; desc: string }> = {
  onprem: { title: '온프레미스 자산', desc: '온프레미스로 분류된 자산 목록' },
  cloud: { title: '클라우드 자산', desc: '클라우드(CSP)로 분류된 자산 목록' },
  unassigned: { title: '담당자 미지정 자산', desc: '담당자가 전혀 지정되지 않은 자산' },
  retired: { title: '담당자 전원 퇴사 자산', desc: '지정 담당자가 모두 퇴사한 자산 (인사 쿼리)' },
};

function Tag({ kind }: { kind: 'modified' | 'new' | 'unassigned' }) {
  return (
    <span className={cn('rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium',
      kind === 'new' ? 'bg-purple-soft text-purple' : kind === 'unassigned' ? 'bg-warn-soft text-warn' : 'bg-success-soft text-success')}>
      {kind === 'new' ? '신규' : kind === 'unassigned' ? '미지정' : '수정'}
    </span>
  );
}

function AssetListDrawer({ kind, open, onClose }: { kind: AssetKind; open: boolean; onClose: () => void }) {
  const { data } = useQuery({
    queryKey: ['dashboard', 'asset-list', kind],
    queryFn: () => getAssetList(kind),
    enabled: open,
  });
  const meta = TITLES[kind];
  const rows = data ?? [];
  const match = (r: AssetListRow, f: string) =>
    !f || `${r.ip} ${r.hostname} ${r.detail} ${r.ownerName ?? ''} ${r.ownerTeam ?? ''}`.toLowerCase().includes(f.toLowerCase());

  return (
    <ListSidePanel
      open={open}
      onClose={onClose}
      eyebrow="IT 자산 정보"
      title={meta.title}
      desc={meta.desc}
      stats={[{ label: '자산 수', value: `${rows.length}건` }]}
      searchPlaceholder="IP / 자산명 / 담당자 필터"
      padded
      csv={{
        filename: `${kind}-assets.csv`,
        headers: ['IP', '자산명', '상세', '현업 담당자', '팀', '상태'],
        rows: rows.map((r) => [r.ip, r.hostname, r.detail, r.ownerName ?? '', r.ownerTeam ?? '', r.tag ?? '']),
      }}
    >
      {(filter) => (
        <div className="space-y-1.5">
          {rows.filter((r) => match(r, filter)).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2">
              <div className="min-w-0">
                <div className="font-mono text-[12.5px] font-medium text-text">
                  {r.ip}
                  {r.csp && <span className="ml-1.5 rounded bg-bg-soft px-1 text-[10.5px] text-text-3">{r.csp}</span>}
                </div>
                <div className="text-[11.5px] text-text-3">{r.hostname}</div>
                <div className="text-[10.5px] text-text-4">{r.detail}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {r.ownerName && (
                  <div className="text-right leading-tight">
                    <div className="text-[12px] text-text-2">{r.ownerName}</div>
                    <div className="text-[10.5px] text-text-4">{r.ownerTeam}</div>
                  </div>
                )}
                {r.tag && <Tag kind={r.tag} />}
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-[12.5px] text-text-3">해당 자산이 없습니다.</p>}
        </div>
      )}
    </ListSidePanel>
  );
}
