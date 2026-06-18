import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { Badge } from '@/components/common/Badge';
import { getAnomalySummary, getAnomalyDetail } from '@/lib/api/dashboard';
import type { AnomalyKey, AnomalySummaryItem } from '@/lib/api/dashboard';
import { cn } from '@/lib/cn';

const sevVariant = { danger: 'danger', warn: 'warn', info: 'info' } as const;

export function AnomalySection() {
  const { data } = useQuery({ queryKey: ['dashboard', 'anomalies'], queryFn: getAnomalySummary });
  const [active, setActive] = useState<AnomalySummaryItem | null>(null);

  return (
    <Panel
      title={
        <span className="flex items-center gap-1.5">
          <AlertTriangle size={15} className="text-warn" /> 이상 징후
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item)}
            className={cn(
              'flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2.5',
              'text-left transition-colors hover:border-lgred-200',
            )}
          >
            <div>
              <div className="text-sm font-medium text-neutral-800">{item.label}</div>
              <div className="text-xs text-neutral-400">{item.count}건</div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={sevVariant[item.severity]}>{item.count}</Badge>
              <ChevronRight size={15} className="text-neutral-300" />
            </div>
          </button>
        ))}
      </div>

      <AnomalyDrawer item={active} onClose={() => setActive(null)} />
    </Panel>
  );
}

function AnomalyDrawer({
  item,
  onClose,
}: {
  item: AnomalySummaryItem | null;
  onClose: () => void;
}) {
  const key = item?.key as AnomalyKey | undefined;
  const { data } = useQuery({
    queryKey: ['dashboard', 'anomaly-detail', key],
    queryFn: () => getAnomalyDetail(key!),
    enabled: !!key && key !== 'dup-ip-new',
  });

  // dup-ip-new는 AssetInfoSection의 아코디언 패널과 동일 내용 — 여기서는 안내만
  return (
    <SideDrawer open={!!item} onClose={onClose} title={item?.label ?? ''} width={640}>
      {key === 'dup-ip-new' ? (
        <p className="text-sm text-neutral-500">
          상세 목록은 상단 ‘IT 자산 정보 · IP 중복 · 신규 등록’ 카드에서 동일하게 확인할 수 있습니다
          (동일 IP 자산 아코디언 포함).
        </p>
      ) : !data || data.rows.length === 0 ? (
        <p className="text-sm text-neutral-400">해당 이벤트가 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                {data.columns.map((c) => (
                  <th key={c} className="px-2 py-2 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={cn(
                        'px-2 py-1.5 text-neutral-700',
                        // overwrite 이전 사용자 취소선
                        key === 'overwrite' && j === 2 && 'text-neutral-400 line-through',
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SideDrawer>
  );
}
