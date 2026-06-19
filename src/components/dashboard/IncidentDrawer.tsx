import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ListSidePanel } from '@/components/drawer/ListSidePanel';
import { IncidentTable } from '@/components/drawer/IncidentTable';
import { AssetDetailDrawer } from './AssetDetailDrawer';
import type { AssetRef } from './AssetDetailDrawer';
import { getAnomalyDetail } from '@/lib/api/dashboard';
import type { AnomalyKey } from '@/lib/api/dashboard';

type Props = {
  open: boolean;
  onClose: () => void;
  anomalyKey: AnomalyKey | null;
  eyebrow: string;
  title: string;
};

/** 이상 징후/IP중복 공통 상세 드로어 — stats + 검색 + CSV + IncidentTable + 자산 드릴다운. */
export function IncidentDrawer({ open, onClose, anomalyKey, eyebrow, title }: Props) {
  const [assetRef, setAssetRef] = useState<AssetRef>(null);
  const { data } = useQuery({
    queryKey: ['dashboard', 'anomaly-detail', anomalyKey],
    queryFn: () => getAnomalyDetail(anomalyKey!),
    enabled: open && !!anomalyKey,
  });

  return (
    <>
      <ListSidePanel
        open={open}
        onClose={onClose}
        eyebrow={eyebrow}
        title={title}
        desc={data?.desc}
        stats={data?.stats}
        searchPlaceholder="IP / 자산명 / 담당자 필터"
        csv={data ? { filename: `${anomalyKey}.csv`, headers: data.csvHeaders, rows: data.csvRows } : undefined}
      >
        {(filter) => (data ? <IncidentTable detail={data} filter={filter} onSelectAsset={setAssetRef} /> : null)}
      </ListSidePanel>

      {/* 2겹 — 자산 현재 정보 */}
      <AssetDetailDrawer refValue={assetRef} onClose={() => setAssetRef(null)} />
    </>
  );
}
