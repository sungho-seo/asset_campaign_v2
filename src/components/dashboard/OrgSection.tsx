import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ChevronDown, Trophy, Star, CheckCircle2 } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { getOrganizations, getOrgTree } from '@/lib/api/dashboard';
import type { OrgNode } from '@/lib/mockOrganizations';
import { cn } from '@/lib/cn';

type SortKey = 'participate' | 'identify' | 'update';

const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;

function MiniBar({ rate }: { rate: number }) {
  return (
    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-bg-soft">
      <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(rate * 100, 100)}%` }} />
    </div>
  );
}

export function OrgSection() {
  const { data } = useQuery({ queryKey: ['dashboard', 'organizations'], queryFn: getOrganizations });
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Panel title="조직별 참여율" subtitle="대단위 조직 17 · 클릭하여 하위 트리 보기">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {data?.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelected(o.id)}
            className="rounded-lg border border-line bg-white p-3 text-left shadow-sm transition-colors hover:border-brand/40"
          >
            <div className="flex items-center justify-between">
              <span className="truncate text-[12.5px] font-semibold tracking-tightish text-text">
                {o.name}
              </span>
              {o.hasHundredTeam && <Trophy className="h-3.5 w-3.5 shrink-0 text-warn-2" />}
            </div>
            <div className="mt-1.5 text-[22px] font-semibold tracking-tighter2 text-brand">
              {pct(o.participateRate)}
            </div>
            <MiniBar rate={o.participateRate} />
            <div className="mt-1.5 font-mono text-[11px] text-text-3">
              식별률 {o.identifyRate === null ? '-' : pct(o.identifyRate)}
            </div>
            <div className="mt-0.5 font-mono text-[10.5px] text-text-4">
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

  const stat = root?.stats;

  return (
    <SideDrawer
      open={!!orgId}
      onClose={onClose}
      width={900}
      padded={false}
      eyebrow="조직별 참여율"
      title={root?.name ?? '조직'}
      subtitle={
        stat
          ? `구성원 ${stat.totalMembers} · 자산 ${stat.assetCount} · 참여율 ${pct(
              stat.totalMembers ? stat.participated / stat.totalMembers : 0,
            )}`
          : undefined
      }
      toolbar={
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-text-3">정렬</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="h-8 rounded-md border border-line bg-white px-2 text-xs text-text focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="participate">참여율</option>
            <option value="identify">식별률</option>
            <option value="update">갱신 건수</option>
          </select>
        </div>
      }
    >
      <div className="px-6 py-4">
        <div className="grid grid-cols-[1fr_5rem_4.5rem_3.5rem_3.5rem_4rem_3rem] gap-1 border-b border-line pb-2 font-mono text-[10.5px] uppercase tracking-wider text-text-3">
          <div>조직</div>
          <div className="text-right">참여율</div>
          <div className="text-right">식별률</div>
          <div className="text-right">구성원</div>
          <div className="text-right">자산</div>
          <div className="text-right">갱신</div>
          <div className="text-center">배지</div>
        </div>
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
      <div className="grid grid-cols-[1fr_5rem_4.5rem_3.5rem_3.5rem_4rem_3rem] items-center gap-1 border-b border-line/60 py-1.5 text-[12px] hover:bg-bg-soft">
        <button
          className="flex items-center gap-1 text-left"
          style={{ paddingLeft: depth * 14 }}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-text-4" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-text-4" />
          )}
          <span className={cn('truncate', isTeam ? 'text-text-2' : 'font-medium text-text')}>
            {node.name}
          </span>
        </button>
        <div className="flex items-center justify-end gap-1">
          <span className="font-mono text-text-2">{pct(participate)}</span>
          <MiniBar rate={participate} />
        </div>
        <div className="text-right font-mono text-text-2">
          {s.assetCount ? pct(s.identifiedAssets / s.assetCount) : '-'}
        </div>
        <div className="text-right font-mono text-text-3">{s.totalMembers}</div>
        <div className="text-right font-mono text-text-3">{s.assetCount}</div>
        <div className="text-right font-mono font-semibold text-text-2">{s.updateCount}</div>
        <div className="flex items-center justify-center gap-0.5">
          {hundred && <Trophy className="h-3 w-3 text-warn-2" />}
          {topUpdate && <Star className="h-3 w-3 text-brand" />}
        </div>
      </div>

      {open && node.children && <TreeRows nodes={node.children} depth={depth + 1} sortKey={sortKey} />}

      {open && node.members && (
        <div className="bg-bg-soft/50" style={{ paddingLeft: (depth + 1) * 14 + 16 }}>
          {[...node.members]
            .sort((a, b) => b.updateCount - a.updateCount)
            .map((m) => (
              <div key={m.empNo} className="flex items-center gap-3 py-1 text-[11.5px]">
                <span className="w-24 truncate text-text-2">{m.name}</span>
                <span className="font-mono text-text-3">갱신 {m.updateCount}</span>
                {m.responded && (
                  <span className="flex items-center gap-0.5 text-success">
                    <CheckCircle2 className="h-3 w-3" /> 응답 완료
                  </span>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
}
