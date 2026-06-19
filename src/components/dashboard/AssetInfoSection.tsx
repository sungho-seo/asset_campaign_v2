import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Server, Cloud, UserX, LogOut, Copy, RefreshCw } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { MetricRow } from '@/components/kpi/MetricRow';
import { ListSidePanel } from '@/components/drawer/ListSidePanel';
import { IncidentDrawer } from './IncidentDrawer';
import { AssetDetailDrawer } from './AssetDetailDrawer';
import type { AssetRef } from './AssetDetailDrawer';
import { getAssetTypeSummary, getAssetList, getRetiredAssets } from '@/lib/api/dashboard';
import type { AssetListRow } from '@/lib/api/dashboard';
import { cn } from '@/lib/cn';

type AssetKind = 'onprem' | 'cloud' | 'unassigned';
type PanelKey = AssetKind | 'retired' | 'dup-ip-new' | 'dup-ip-update';

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

      {(['onprem', 'cloud', 'unassigned'] as const).map((k) => (
        <AssetListDrawer key={k} kind={k} open={panel === k} onClose={() => setPanel(null)} />
      ))}
      <RetiredDrawer open={panel === 'retired'} onClose={() => setPanel(null)} />
      <IncidentDrawer open={panel === 'dup-ip-new'} onClose={() => setPanel(null)} anomalyKey="dup-ip-new" eyebrow="IT 자산 정보" title="IP 중복 · 신규 등록" />
      <IncidentDrawer open={panel === 'dup-ip-update'} onClose={() => setPanel(null)} anomalyKey="dup-ip-update" eyebrow="IT 자산 정보" title="IP 중복 · 정보 갱신" />
    </Panel>
  );
}

const TITLES: Record<AssetKind, { title: string; desc: string }> = {
  onprem: { title: '온프레미스 자산', desc: '온프레미스로 분류된 자산 목록' },
  cloud: { title: '클라우드 자산', desc: '클라우드(CSP)로 분류된 자산 목록' },
  unassigned: { title: '담당자 미지정 자산', desc: '담당자가 전혀 지정되지 않은 자산' },
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
  const [assetRef, setAssetRef] = useState<AssetRef>(null);
  const meta = TITLES[kind];
  const rows = data ?? [];
  const match = (r: AssetListRow, f: string) =>
    !f || `${r.ip} ${r.hostname} ${r.detail} ${r.ownerName ?? ''} ${r.ownerTeam ?? ''}`.toLowerCase().includes(f.toLowerCase());

  return (
    <>
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
              <button
                key={r.id}
                onClick={() => setAssetRef({ assetId: r.id })}
                className="flex w-full items-center justify-between gap-3 rounded-md border border-line px-3 py-2 text-left transition-colors hover:border-brand/40 hover:bg-bg-soft/40"
              >
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
              </button>
            ))}
            {rows.length === 0 && <p className="text-[12.5px] text-text-3">해당 자산이 없습니다.</p>}
          </div>
        )}
      </ListSidePanel>

      <AssetDetailDrawer refValue={assetRef} onClose={() => setAssetRef(null)} />
    </>
  );
}

function RetiredDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useQuery({ queryKey: ['dashboard', 'retired'], queryFn: getRetiredAssets, enabled: open });
  const rows = data ?? [];
  const match = (f: string, hay: string) => !f || hay.toLowerCase().includes(f.toLowerCase());

  return (
    <ListSidePanel
      open={open}
      onClose={onClose}
      eyebrow="IT 자산 정보"
      title="담당자 전원 퇴사 자산"
      desc="지정 담당자가 모두 퇴사한 자산 (인사 별도 쿼리 · 퇴사 일시는 별도 시스템 관리)"
      stats={[{ label: '자산 수', value: `${rows.length}건` }]}
      searchPlaceholder="IP / 자산명 / 담당자 필터"
      padded
      csv={{
        filename: 'retired-assets.csv',
        headers: ['IP', '자산명', 'OS', '역할', '담당자', '팀'],
        rows: rows.flatMap((a) =>
          a.owners.map((o) => [a.ip, a.hostname, a.os, o.role, o.name, o.team]),
        ),
      }}
    >
      {(filter) => (
        <div className="space-y-2.5">
          {rows
            .filter((a) =>
              match(filter, `${a.ip} ${a.hostname} ${a.owners.map((o) => o.name + o.team).join(' ')}`),
            )
            .map((a) => (
              <div key={a.id} className="rounded-md border border-line">
                <div className="flex items-center justify-between border-b border-line bg-bg-soft/50 px-3 py-2">
                  <div>
                    <div className="font-mono text-[12.5px] font-medium text-text">{a.ip}</div>
                    <div className="text-[11.5px] text-text-3">{a.hostname}</div>
                  </div>
                  <span className="font-mono text-[11px] text-text-4">{a.os}</span>
                </div>
                <div className="divide-y divide-line/60">
                  {a.owners.map((o, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 text-[12px]">
                      <span className="text-text-3">{o.role}</span>
                      <span className="text-right">
                        <span className="text-text-2 line-through">{o.name}</span>
                        <span className="ml-1.5 text-[10.5px] text-text-4">{o.team}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          {rows.length === 0 && <p className="text-[12.5px] text-text-3">해당 자산이 없습니다.</p>}
        </div>
      )}
    </ListSidePanel>
  );
}
