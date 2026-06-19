import { useQuery } from '@tanstack/react-query';
import { ListSidePanel } from '@/components/drawer/ListSidePanel';
import { IncidentTable } from '@/components/drawer/IncidentTable';
import { getAnomalyDetail } from '@/lib/api/dashboard';
import type { AnomalyKey } from '@/lib/api/dashboard';

type Props = {
  open: boolean;
  onClose: () => void;
  anomalyKey: AnomalyKey | null;
  eyebrow: string;
  title: string;
};

/** 이상 징후/IP중복 공통 상세 드로어 — 상단 stats + 검색 + CSV + IncidentTable. */
export function IncidentDrawer({ open, onClose, anomalyKey, eyebrow, title }: Props) {
  const { data } = useQuery({
    queryKey: ['dashboard', 'anomaly-detail', anomalyKey],
    queryFn: () => getAnomalyDetail(anomalyKey!),
    enabled: open && !!anomalyKey,
  });

  return (
    <ListSidePanel
      open={open}
      onClose={onClose}
      eyebrow={eyebrow}
      title={title}
      desc={data?.desc}
      stats={data?.stats}
      searchPlaceholder="IP / 자산명 / 사용자 필터"
      csv={data ? { filename: `${anomalyKey}.csv`, headers: data.csvHeaders, rows: data.csvRows } : undefined}
    >
      {(filter) => (data ? <IncidentTable detail={data} filter={filter} /> : null)}
    </ListSidePanel>
  );
}
