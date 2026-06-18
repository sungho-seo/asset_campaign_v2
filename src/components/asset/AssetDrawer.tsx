import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, FlaskConical } from 'lucide-react';
import type { Asset, OwnerRole } from '@/types/domain';
import { OWNER_ROLES } from '@/types/domain';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { Button } from '@/components/common/Button';
import { ValidationBanner } from '@/components/feedback/ValidationBanner';
import { OwnerRoleCard } from './OwnerRoleCard';
import { AssetInfoFields } from './AssetInfoFields';
import { ConflictModal } from './ConflictModal';
import { NewAssetDrawer } from './NewAssetDrawer';
import {
  getAsset,
  addOwner,
  removeOwner,
  updateAssetFields,
  devBumpVersion,
} from '@/lib/api/assets';
import type { AssetFields } from '@/lib/api/assets';
import { assetFormSchema, FIELD_LABELS } from '@/lib/assetSchema';
import type { AssetFormValues } from '@/lib/assetSchema';
import { assetToFormValues, formValuesToFields } from '@/lib/assetMappers';
import { formatDateTime } from '@/lib/format';
import { toast } from '@/stores/toastStore';

type Props = {
  open: boolean;
  onClose: () => void;
  assetId?: string | null;
  mode?: 'edit' | 'new';
  prefillQuery?: string;
};

export function AssetDrawer(props: Props) {
  if (props.mode === 'new') {
    return (
      <NewAssetDrawer
        open={props.open}
        onClose={props.onClose}
        prefillQuery={props.prefillQuery ?? ''}
      />
    );
  }
  return <EditAssetDrawer {...props} />;
}

function EditAssetDrawer({ open, onClose, assetId }: Props) {
  const qc = useQueryClient();
  const { data: asset } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => getAsset(assetId!),
    enabled: open && !!assetId,
  });

  const form = useForm<AssetFormValues>({ resolver: zodResolver(assetFormSchema) });
  const [confirmLatest, setConfirmLatest] = useState(false);

  // 열람 시점 버전·원본 스냅샷 (충돌 비교용)
  const baseVersionRef = useRef<number | null>(null);
  const baseSnapshotRef = useRef<Asset | null>(null);
  const lastFieldsRef = useRef<AssetFields | null>(null);
  const [conflict, setConflict] = useState<{ current: Asset; mine: AssetFields } | null>(null);

  // 필드 ref (검증 배너 칩 클릭 시 스크롤·포커스·펄스)
  const fieldEls = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (open && asset && baseVersionRef.current === null) {
      baseVersionRef.current = asset.version;
      baseSnapshotRef.current = { ...asset };
      form.reset(assetToFormValues(asset));
      setConfirmLatest(false);
    }
    if (!open) {
      baseVersionRef.current = null;
      baseSnapshotRef.current = null;
      setConflict(null);
    }
  }, [open, asset, form]);

  // 담당자 즉시 반영 mutations
  const updateCache = (updated: Asset) => {
    qc.setQueryData(['asset', assetId], updated);
    void qc.invalidateQueries({ queryKey: ['search'] });
    void qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
  const addMut = useMutation({
    mutationFn: (v: { role: OwnerRole; person: Parameters<typeof addOwner>[2] }) =>
      addOwner(assetId!, v.role, v.person),
    onSuccess: updateCache,
  });
  const removeMut = useMutation({
    mutationFn: (ownerId: string) => removeOwner(assetId!, ownerId),
    onSuccess: updateCache,
  });

  const saveMut = useMutation({
    mutationFn: (v: { fields: AssetFields; base: number }) =>
      updateAssetFields(assetId!, v.fields, v.base, confirmLatest),
    onSuccess: (res) => {
      if (!res.ok) {
        setConflict({ current: res.current, mine: lastFieldsRef.current! });
        return;
      }
      updateCache(res.asset);
      toast.success('변경이 저장되었습니다.');
      onClose();
    },
  });

  if (!asset && open) {
    return (
      <SideDrawer open={open} onClose={onClose} title="자산 상세">
        <p className="text-sm text-neutral-400">불러오는 중…</p>
      </SideDrawer>
    );
  }
  if (!asset) return null;

  const owners = asset.owners;
  const hasAnyOwner = owners.length > 0;
  const busy = addMut.isPending || removeMut.isPending;

  const errorChips = Object.keys(form.formState.errors)
    .filter((k) => FIELD_LABELS[k])
    .map((k) => ({ field: k, label: FIELD_LABELS[k]! }));

  const scrollToField = (field: string) => {
    const el = fieldEls.current[field];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('field-pulse');
    void el.offsetWidth;
    el.classList.add('field-pulse');
    el.querySelector<HTMLElement>('input,select,textarea')?.focus();
  };

  const onSave = form.handleSubmit((values) => {
    if (!hasAnyOwner) {
      toast.warn('최소 1개 역할에 담당자가 1명 이상 지정되어야 합니다.');
      return;
    }
    const fields = formValuesToFields(values);
    lastFieldsRef.current = fields;
    saveMut.mutate({ fields, base: baseVersionRef.current ?? asset.version });
  });

  const resolveOverwrite = () => {
    if (!conflict) return;
    saveMut.mutate(
      { fields: conflict.mine, base: conflict.current.version },
      {
        onSuccess: (res) => {
          if (res.ok) {
            updateCache(res.asset);
            toast.success('내 변경으로 덮어썼습니다.');
            setConflict(null);
            onClose();
          }
        },
      },
    );
  };
  const resolveTakeTheirs = () => {
    if (!conflict) return;
    baseVersionRef.current = conflict.current.version;
    baseSnapshotRef.current = { ...conflict.current };
    form.reset(assetToFormValues(conflict.current));
    updateCache(conflict.current);
    setConflict(null);
    toast.info('다른 사람의 수정을 가져왔습니다.');
  };

  return (
    <>
      <SideDrawer
        open={open}
        onClose={onClose}
        width={920}
        title={asset.hostname}
        subtitle={
          asset.updatedAt
            ? `직전 수정: ${formatDateTime(asset.updatedAt)} (${asset.updatedBy})`
            : '아직 갱신되지 않은 자산입니다'
        }
        footer={
          <div className="flex items-center justify-between">
            {import.meta.env.DEV ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => devBumpVersion(asset.id).then(() => toast.warn('[DEV] 다른 사용자 수정 발생'))}
              >
                <FlaskConical size={13} /> DEV: 외부 수정 트리거
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button onClick={onClose}>취소</Button>
              <Button variant="primary" onClick={onSave} disabled={saveMut.isPending}>
                변경 저장
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {errorChips.length > 0 && (
            <ValidationBanner items={errorChips} onChipClick={scrollToField} />
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* 좌: 담당자 5역할 */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-800">담당자</h3>
                {!hasAnyOwner && (
                  <span className="flex items-center gap-1 text-xs text-warn">
                    <AlertTriangle size={12} /> 최소 1명 필요
                  </span>
                )}
              </div>
              {OWNER_ROLES.map((role) => (
                <OwnerRoleCard
                  key={role}
                  role={role}
                  owners={owners.filter((o) => o.role === role)}
                  onAdd={(r, person) => addMut.mutate({ role: r, person })}
                  onRemove={(ownerId) => removeMut.mutate(ownerId)}
                  busy={busy}
                />
              ))}
            </div>

            {/* 우: 자산 정보 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800">자산 정보</h3>
              <AssetInfoFields
                form={form}
                fieldRef={(name, el) => (fieldEls.current[name] = el)}
              />

              {/* 최신 정보 확인 체크박스 (자산 정보 섹션 하단) */}
              <label className="flex items-start gap-2 rounded-card border border-lgred-100 bg-pink-soft/40 p-3">
                <input
                  type="checkbox"
                  checked={confirmLatest}
                  onChange={(e) => setConfirmLatest(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-lgred"
                />
                <span className="text-sm">
                  <span className="font-medium text-neutral-800">자산 정보가 최신 정보입니다</span>
                  <span className="block text-xs text-neutral-500">
                    변경 저장 시 확인 시점이 함께 기록되어 식별률에 반영됩니다.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </SideDrawer>

      <ConflictModal
        open={!!conflict}
        base={baseSnapshotRef.current}
        current={conflict?.current ?? null}
        mine={conflict?.mine ?? null}
        onOverwrite={resolveOverwrite}
        onTakeTheirs={resolveTakeTheirs}
        onCancel={() => setConflict(null)}
      />
    </>
  );
}
