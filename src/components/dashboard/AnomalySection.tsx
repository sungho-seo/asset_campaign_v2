import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, RotateCcw, UserCog, Copy, RefreshCw, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { MetricRow } from '@/components/kpi/MetricRow';
import { IncidentDrawer } from './IncidentDrawer';
import { getAnomalySummary } from '@/lib/api/dashboard';
import type { AnomalyKey, AnomalySummaryItem } from '@/lib/api/dashboard';

type IconColor = 'green' | 'amber' | 'red' | 'purple' | 'gray' | 'blue';

const META: Record<AnomalyKey, { icon: LucideIcon; color: IconColor; desc: string }> = {
  'dup-edit': { icon: AlertTriangle, color: 'amber', desc: '동일 자산을 2명 이상이 수정' },
  overwrite: { icon: RotateCcw, color: 'red', desc: '충돌 후 덮어쓰기 결정' },
  'owner-change': { icon: UserCog, color: 'blue', desc: '담당자 추가 / 삭제 이력' },
  'dup-ip-new': { icon: Copy, color: 'purple', desc: 'IP 다중 중복으로 신규 등록' },
  'dup-ip-update': { icon: RefreshCw, color: 'gray', desc: '단일 중복 → 현업 담당자 추가' },
  'search-top-ip': { icon: Search, color: 'gray', desc: '검색 시도 Top 100 (IP)' },
  'search-top-host': { icon: Search, color: 'gray', desc: '검색 시도 Top 100 (Hostname)' },
  'search-top-person': { icon: Search, color: 'gray', desc: '검색 시도 Top 100 (담당자)' },
};

const ANOMALY_KEYS: AnomalyKey[] = ['dup-edit', 'overwrite', 'owner-change', 'dup-ip-new', 'dup-ip-update'];
const SEARCH_KEYS: AnomalyKey[] = ['search-top-ip', 'search-top-host', 'search-top-person'];

export function AnomalySection() {
  return <IncidentPanel title="이상 징후 / 충돌" subtitle="캠페인 누적 · 클릭하여 상세 보기" keys={ANOMALY_KEYS} />;
}

export function SearchAnalysisSection() {
  return <IncidentPanel title="검색 분석" subtitle="검색 시도 패턴 · 클릭하여 상세 보기" keys={SEARCH_KEYS} />;
}

function IncidentPanel({ title, subtitle, keys }: { title: string; subtitle: string; keys: AnomalyKey[] }) {
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
      <IncidentDrawer
        open={!!active}
        onClose={() => setActive(null)}
        anomalyKey={active?.key ?? null}
        eyebrow="상세"
        title={active?.label ?? ''}
      />
    </Panel>
  );
}
