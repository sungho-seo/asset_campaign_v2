import type { Asset } from '@/types/domain';
import { Badge } from '@/components/common/Badge';
import { OwnerRoleSummary } from './OwnerRoleSummary';
import { ASSET_TYPE_LABELS } from '@/lib/labels';
import { formatDateTime } from '@/lib/format';
import { getCurrentUser } from '@/lib/mockAuth';

type Props = {
  asset: Asset;
  onClick: (asset: Asset) => void;
};

export function AssetResultRow({ asset, onClick }: Props) {
  const me = getCurrentUser();
  const mine = asset.owners.some((o) => o.empNo === me.empNo);
  const unassigned = asset.owners.length === 0;

  return (
    <button
      type="button"
      onClick={() => onClick(asset)}
      className="w-full rounded-card border border-neutral-200 bg-white p-3 text-left transition-colors hover:border-lgred-200 hover:bg-pink-soft/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">{asset.hostname}</span>
            {mine && <Badge variant="mine">내 자산</Badge>}
            {unassigned && <Badge variant="unassigned">미할당</Badge>}
            {asset.assetType && (
              <Badge variant="neutral">{ASSET_TYPE_LABELS[asset.assetType]}</Badge>
            )}
          </div>
          {asset.servicePurpose && (
            <div className="text-xs text-neutral-500">{asset.servicePurpose}</div>
          )}
        </div>
        <div className="shrink-0 text-right text-xs text-neutral-400">
          {asset.updatedBy ? (
            <>
              <div>최근 수정 {asset.updatedBy}</div>
              <div>{formatDateTime(asset.updatedAt)}</div>
            </>
          ) : (
            <div>미갱신</div>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
        <span className="font-mono text-neutral-800">{asset.ips.join(', ')}</span>
        <span className="text-neutral-400">·</span>
        <span>
          {asset.os} {asset.osVersion}
        </span>
        {asset.cloud && (
          <>
            <span className="text-neutral-400">·</span>
            <span>{asset.cloud.csp}</span>
          </>
        )}
      </div>

      <div className="mt-2">
        <OwnerRoleSummary asset={asset} />
      </div>
    </button>
  );
}
