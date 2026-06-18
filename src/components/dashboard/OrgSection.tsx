import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { Select } from '@/components/common/Select';
import { getOrganizations, getOrgTree } from '@/lib/api/dashboard';
import type { OrgNode } from '@/lib/mockOrganizations';
import { cn } from '@/lib/cn';

type SortKey = 'participate' | 'identify' | 'update';

function pct(n: number) {
  return `${Math.round(n * 1000) / 10}%`;
}

function MiniBar({ rate }: { rate: number }) {
  return (
    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
      <div className="h-full rounded-full bg-lgred" style={{ width: `${Math.min(rate * 100, 100)}%` }} />
    </div>
  );
}

export function OrgSection() {
  const { data } = useQuery({ queryKey: ['dashboard', 'organizations'], queryFn: getOrganizations });
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Panel title="조직별 참여율">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {data?.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelected(o.id)}
            className="rounded-card border border-neutral-200 bg-white p-3 text-left shadow-card transition-colors hover:border-lgred-200"
          >
            <div className="flex items-center justify-between">
              <span className="truncate text-sm font-semibold text-neutral-800">{o.name}</span>
              {o.hasHundredTeam && <Trophy size={14} className="shrink-0 text-amber-500" />}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="text-2xl font-bold text-lgred">{pct(o.participateRate)}</span>
            </div>
            <MiniBar rate={o.participateRate} />
            <div className="mt-1.5 text-xs text-neutral-500">
              식별률 {o.identifyRate === null ? '-' : pct(o.identifyRate)}
            </div>
            <div className="mt-0.5 text-xs text-neutral-400">
              구성원 {o.members} · 자산 {o.assets}
            </div>
          </button>
        ))}
      </div>

      <OrgTreeDrawer orgId={selected} onClose={() => setSelected(null)} />
    </Panel>
  );
}

function OrgTreeDrawer({ orgId, onClose }: { orgId: string | null; onClose: () => void }) {
  const { data: root } = useQuery({
    queryKey: ['dashboard', 'org-tree', orgId],
    queryFn: () => getOrgTree(orgId!),
    enabled: !!orgId,
  });
  const [sortKey, setSortKey] = useState<SortKey>('participate');

  return (
    <SideDrawer
      open={!!orgId}
      onClose={onClose}
      width={900}
      title={root?.name ?? '조직'}
      subtitle={
        root
          ? `구성원 ${root.stats.totalMembers} · 자산 ${root.stats.assetCount} · 참여율 ${pct(
              root.stats.totalMembers ? root.stats.participated / root.stats.totalMembers : 0,
            )}`
          : undefined
      }
    >
      <div className="mb-3 flex items-center justify-end gap-2">
        <span className="text-xs text-neutral-500">정렬</span>
        <Select
          className="h-8 w-36 text-xs"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          options={[
            { value: 'participate', label: '참여율' },
            { value: 'identify', label: '식별률' },
            { value: 'update', label: '갱신 건수' },
          ]}
        />
      </div>

      {/* 헤더 */}
      <div className="grid grid-cols-[1fr_5rem_4.5rem_3.5rem_3.5rem_4rem_3rem] gap-1 border-b border-neutral-200 pb-2 text-[11px] font-medium text-neutral-500">
        <div>조직</div>
        <div className="text-right">참여율</div>
        <div className="text-right">식별률</div>
        <div className="text-right">구성원</div>
        <div className="text-right">자산</div>
        <div className="text-right">갱신</div>
        <div className="text-center">배지</div>
      </div>

      <div className="divide-y divide-neutral-50">
        {root && <TreeRows nodes={root.children ?? []} depth={0} sortKey={sortKey} />}
      </div>
    </SideDrawer>
  );
}

function sortNodes(nodes: OrgNode[], key: SortKey): OrgNode[] {
  const val = (n: OrgNode) => {
    if (key === 'participate') return n.stats.totalMembers ? n.stats.participated / n.stats.totalMembers : 0;
    if (key === 'identify') return n.stats.assetCount ? n.stats.identifiedAssets / n.stats.assetCount : -1;
    return n.stats.updateCount;
  };
  return [...nodes].sort((a, b) => val(b) - val(a));
}

function TreeRows({ nodes, depth, sortKey }: { nodes: OrgNode[]; depth: number; sortKey: SortKey }) {
  return (
    <>
      {sortNodes(nodes, sortKey).map((node) => (
        <TreeRow key={node.id} node={node} depth={depth} sortKey={sortKey} />
      ))}
    </>
  );
}

function TreeRow({ node, depth, sortKey }: { node: OrgNode; depth: number; sortKey: SortKey }) {
  const [open, setOpen] = useState(false);
  const isTeam = !!node.members;
  const s = node.stats;
  const participate = s.totalMembers ? s.participated / s.totalMembers : 0;
  const hundred = s.totalMembers > 0 && s.participated === s.totalMembers;
  const topUpdate = s.updateCount >= 12;

  return (
    <>
      <div
        className="grid grid-cols-[1fr_5rem_4.5rem_3.5rem_3.5rem_4rem_3rem] items-center gap-1 py-1.5 text-xs hover:bg-neutral-50"
      >
        <button
          className="flex items-center gap-1 text-left"
          style={{ paddingLeft: depth * 14 }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <ChevronDown size={13} className="shrink-0 text-neutral-400" /> : <ChevronRight size={13} className="shrink-0 text-neutral-400" />}
          <span className={cn('truncate', isTeam ? 'text-neutral-600' : 'font-medium text-neutral-800')}>
            {node.name}
          </span>
        </button>
        <div className="flex items-center justify-end gap-1">
          <span className="text-neutral-700">{pct(participate)}</span>
          <MiniBar rate={participate} />
        </div>
        <div className="text-right text-neutral-700">
          {s.assetCount ? pct(s.identifiedAssets / s.assetCount) : '-'}
        </div>
        <div className="text-right text-neutral-500">{s.totalMembers}</div>
        <div className="text-right text-neutral-500">{s.assetCount}</div>
        <div className="text-right font-medium text-neutral-700">{s.updateCount}</div>
        <div className="flex items-center justify-center gap-0.5">
          {hundred && <Trophy size={12} className="text-amber-500" />}
          {topUpdate && <Star size={12} className="text-lgred" />}
        </div>
      </div>

      {open && node.children && <TreeRows nodes={node.children} depth={depth + 1} sortKey={sortKey} />}

      {open && node.members && (
        <div className="bg-neutral-50/60" style={{ paddingLeft: (depth + 1) * 14 + 18 }}>
          {[...node.members]
            .sort((a, b) => b.updateCount - a.updateCount)
            .map((m) => (
              <div key={m.empNo} className="flex items-center gap-3 py-1 text-xs">
                <span className="w-24 truncate text-neutral-700">{m.name}</span>
                <span className="text-neutral-500">갱신 {m.updateCount}</span>
                {m.responded && (
                  <span className="flex items-center gap-0.5 text-success">
                    <CheckCircle2 size={11} /> 응답 완료
                  </span>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
}
