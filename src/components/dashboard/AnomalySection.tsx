import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, RotateCcw, UserCog, Copy, RefreshCw, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { MetricRow } from '@/components/kpi/MetricRow';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { IncidentTable } from '@/components/drawer/IncidentTable';
import { Input } from '@/components/common/Input';
import { getAnomalySummary, getAnomalyDetail } from '@/lib/api/dashboard';
import type { AnomalyKey, AnomalySummaryItem } from '@/lib/api/dashboard';

type IconColor = 'green' | 'amber' | 'red' | 'purple' | 'gray' | 'blue';

const META: Record<AnomalyKey, { icon: LucideIcon; color: IconColor; desc: string }> = {
  'dup-edit': { icon: AlertTriangle, color: 'amber', desc: '동일 자산을 2명 이상이 수정' },
  overwrite: { icon: RotateCcw, color: 'red', desc: '충돌 후 덮어쓰기 결정' },
  'owner-change': { icon: UserCog, color: 'blue', desc: '담당자 추가 / 삭제 이력' },
  'dup-ip-new': { icon: Copy, color: 'purple', desc: 'IP 다중 중복으로 신규 등록' },
  'dup-ip-update': { icon: RefreshCw, color: 'gray', desc: '단일 중복 → 현업 담당자 추가' },
  'search-top-ip': { icon: Search, color: 'gray', desc: '검색 시도 Top 10 (IP)' },
  'search-top-host': { icon: Search, color: 'gray', desc: '검색 시도 Top 10 (Hostname)' },
  'search-top-person': { icon: Search, color: 'gray', desc: '검색 시도 Top 10 (담당자)' },
  'zero-search': { icon: Search, color: 'gray', desc: '검색 0건 패턴' },
};

const ANOMALY_KEYS: AnomalyKey[] = [
  'dup-edit',
  'overwrite',
  'owner-change',
  'dup-ip-new',
  'dup-ip-update',
];
const SEARCH_KEYS: AnomalyKey[] = [
  'search-top-ip',
  'search-top-host',
  'search-top-person',
  'zero-search',
];

/** 이상 징후 / 충돌 (충돌·담당자·IP중복 계열) */
export function AnomalySection() {
  return <IncidentPanel title="이상 징후 / 충돌" subtitle="캠페인 누적 · 클릭하여 상세 보기" keys={ANOMALY_KEYS} />;
}

/** 검색 분석 (검색률 Top 10 · 검색 0건) — 충돌이 아닌 분석 성격으로 분리 */
export function SearchAnalysisSection() {
  return <IncidentPanel title="검색 분석" subtitle="검색 시도 패턴 · 클릭하여 상세 보기" keys={SEARCH_KEYS} />;
}

function IncidentPanel({
  title,
  subtitle,
  keys,
}: {
  title: string;
  subtitle: string;
  keys: AnomalyKey[];
}) {
  const { data } = useQuery({ queryKey: ['dashboard', 'anomalies'], queryFn: getAnomalySummary });
  const [active, setActive] = useState<AnomalySummaryItem | null>(null);
  const items = (data ?? []).filter((i) => keys.includes(i.key));

  return (
    <Panel title={title} subtitle={subtitle} padded={false}>
      {items.map((item) => {
        const m = META[item.key];
        return (
          <MetricRow
            key={item.key}
            icon={m.icon}
            iconColor={m.color}
            name={item.label}
            description={m.desc}
            value={item.count.toLocaleString()}
            unit="건"
            onClick={() => setActive(item)}
          />
        );
      })}
      <AnomalyDrawer item={active} onClose={() => setActive(null)} />
    </Panel>
  );
}

function AnomalyDrawer({ item, onClose }: { item: AnomalySummaryItem | null; onClose: () => void }) {
  const key = item?.key as AnomalyKey | undefined;
  const [filter, setFilter] = useState('');
  const { data } = useQuery({
    queryKey: ['dashboard', 'anomaly-detail', key],
    queryFn: () => getAnomalyDetail(key!),
    enabled: !!key && key !== 'dup-ip-new',
  });

  const isDupIpNew = key === 'dup-ip-new';

  return (
    <SideDrawer
      open={!!item}
      onClose={() => {
        setFilter('');
        onClose();
      }}
      width={720}
      padded={isDupIpNew}
      eyebrow="상세"
      title={item?.label ?? ''}
      subtitle={item ? `발생 ${item.count.toLocaleString()}건` : undefined}
      toolbar={
        isDupIpNew ? undefined : (
          <div className="relative max-w-[280px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-4" />
            <Input
              mono
              className="h-8 py-1.5 pl-7 text-xs"
              placeholder="IP / 자산명 / 사용자 필터"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        )
      }
    >
      {isDupIpNew ? (
        <p className="text-[12.5px] text-text-3">
          상세 목록은 상단 ‘IT 자산 정보 · IP 중복 · 신규 등록’ 항목에서 동일 IP 자산 아코디언과 함께
          확인할 수 있습니다.
        </p>
      ) : data ? (
        <IncidentTable
          columns={data.columns}
          rows={data.rows}
          filter={filter}
          strikeColumn={key === 'overwrite' ? 2 : undefined}
        />
      ) : null}
    </SideDrawer>
  );
}
