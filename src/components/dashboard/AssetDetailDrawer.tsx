import { useQuery } from '@tanstack/react-query';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { Badge } from '@/components/common/Badge';
import { getAssetByRef } from '@/lib/api/assets';
import { OWNER_ROLES } from '@/types/domain';
import { ROLE_LABELS, ASSET_TYPE_LABELS } from '@/lib/labels';
import { formatDateTime } from '@/lib/format';

export type AssetRef = { assetId?: string; host?: string; ip?: string } | null;

function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-wider text-text-3">{label}</div>
      <div className={`mt-0.5 text-[12.5px] text-text ${mono ? 'font-mono' : ''}`}>{value || '—'}</div>
    </div>
  );
}

/** 드릴다운 2겹 패널 — 목록에서 선택한 자산의 현재 정보(읽기 전용). 닫으면 첫 패널로 복귀. */
export function AssetDetailDrawer({ refValue, onClose }: { refValue: AssetRef; onClose: () => void }) {
  const open = !!refValue;
  const { data: asset, isFetching } = useQuery({
    queryKey: ['asset-detail', refValue],
    queryFn: () => getAssetByRef(refValue!),
    enabled: open,
  });

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      width={520}
      eyebrow="자산 현재 정보"
      title={asset?.hostname ?? (refValue?.host || refValue?.ip || '자산')}
      subtitle={
        asset?.updatedAt ? `마지막 수정 ${formatDateTime(asset.updatedAt)} (${asset.updatedBy})` : '갱신 이력 없음'
      }
    >
      {isFetching ? (
        <p className="text-[12.5px] text-text-3">불러오는 중…</p>
      ) : !asset ? (
        <p className="text-[12.5px] text-text-3">
          연결된 자산 정보를 찾을 수 없습니다. (대시보드 mock 범위 밖일 수 있습니다)
        </p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="자산 유형" value={asset.assetType ? ASSET_TYPE_LABELS[asset.assetType] : null} />
            <Field label="IP" value={asset.ips.join(', ')} mono />
            <Field label="운영체제" value={`${asset.os} ${asset.osVersion}`} />
            <Field label="외부 접속" value={asset.externalAccess === 'yes' ? '예' : asset.externalAccess === 'no' ? '아니오' : null} />
            <Field label="도메인" value={asset.domain} />
            <Field label="위치" value={asset.location} />
            <Field label="보안 솔루션" value={asset.securitySolution} />
            <Field label="사용 목적" value={asset.servicePurpose} />
            {asset.cloud && (
              <>
                <Field label="CSP" value={asset.cloud.csp} />
                <Field label="계정 ID" value={asset.cloud.accountId} mono />
                <Field label="환경" value={asset.cloud.environment} />
                <Field label="데이터 등급" value={asset.cloud.dataClass} />
              </>
            )}
          </div>

          <div>
            <div className="mb-2 font-mono text-[10.5px] uppercase tracking-wider text-text-3">
              역할별 담당자
            </div>
            <div className="space-y-1.5">
              {OWNER_ROLES.map((role) => {
                const list = asset.owners.filter((o) => o.role === role);
                return (
                  <div key={role} className="flex items-start justify-between gap-2 rounded-md border border-line px-3 py-2">
                    <span className="text-[12px] font-medium text-text-2">{ROLE_LABELS[role]}</span>
                    <div className="text-right">
                      {list.length === 0 ? (
                        <span className="text-[11.5px] text-text-4">미지정</span>
                      ) : (
                        list.map((o) => (
                          <div key={o.ownerId} className="text-[12px] text-text">
                            {o.empName}
                            <span className="ml-1 text-[10.5px] text-text-4">
                              {o.deptPath.split('>').pop()?.trim()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {asset.duplicateIpTag && <Badge variant="warn">IP 중복 태그</Badge>}
        </div>
      )}
    </SideDrawer>
  );
}
