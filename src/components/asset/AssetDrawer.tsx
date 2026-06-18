import { useQuery } from '@tanstack/react-query';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { getAsset } from '@/lib/api/assets';
import { formatDateTime } from '@/lib/format';

type Props = {
  open: boolean;
  onClose: () => void;
  assetId?: string | null;
  mode?: 'edit' | 'new';
  prefillQuery?: string;
};

/**
 * Phase 4 임시 스텁 — 검색 결과 클릭 시 자산 요약 표시.
 * Phase 5에서 5역할 담당자 편집 + 자산 정보 폼 + 충돌 감지로 교체된다.
 */
export function AssetDrawer({ open, onClose, assetId, mode = 'edit' }: Props) {
  const { data: asset } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => getAsset(assetId!),
    enabled: open && mode === 'edit' && !!assetId,
  });

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={mode === 'new' ? '신규 자산 등록' : (asset?.hostname ?? '자산 상세')}
      subtitle={
        mode === 'edit' && asset?.updatedAt
          ? `마지막 수정: ${formatDateTime(asset.updatedAt)} (${asset.updatedBy})`
          : undefined
      }
    >
      <p className="text-sm text-neutral-500">
        {mode === 'new'
          ? '신규 등록 폼은 Phase 6에서 구현됩니다.'
          : '담당자 편집 폼은 Phase 5에서 구현됩니다.'}
      </p>
    </SideDrawer>
  );
}
