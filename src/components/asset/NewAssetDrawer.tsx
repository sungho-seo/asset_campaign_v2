import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Asset, OwnerRole, AssetOwner } from '@/types/domain';
import { OWNER_ROLES } from '@/types/domain';
import { SideDrawer } from '@/components/drawer/SideDrawer';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/feedback/Modal';
import { Badge } from '@/components/common/Badge';
import { ValidationBanner } from '@/components/feedback/ValidationBanner';
import { OwnerRoleCard } from './OwnerRoleCard';
import { AssetInfoFields } from './AssetInfoFields';
import { createAsset, addSelfAsBizOwner } from '@/lib/api/assets';
import type { NewOwnerDraft } from '@/lib/api/assets';
import { assetFormSchema, FIELD_LABELS } from '@/lib/assetSchema';
import type { AssetFormValues } from '@/lib/assetSchema';
import { emptyFormValues, formValuesToFields } from '@/lib/assetMappers';
import { isValidIPv4 } from '@/lib/validation';
import { getCurrentUser } from '@/lib/mockAuth';
import { toast } from '@/stores/toastStore';

type Props = {
  open: boolean;
  onClose: () => void;
  prefillQuery: string;
  onEditExisting?: (assetId: string) => void;
};

let draftSeq = 1;

export function NewAssetDrawer({ open, onClose, prefillQuery, onEditExisting }: Props) {
  const me = getCurrentUser();
  const qc = useQueryClient();
  const form = useForm<AssetFormValues>({ resolver: zodResolver(assetFormSchema) });
  const fieldEls = useRef<Record<string, HTMLElement | null>>({});

  // 신규 자산의 담당자 (로컬 — 아직 DB에 없음). 현업에 본인 자동 채움.
  const [owners, setOwners] = useState<AssetOwner[]>([]);
  const [dup, setDup] = useState<Asset | null>(null); // 단일 중복 기존 자산
  const [followUp, setFollowUp] = useState<string | null>(null); // 현업 추가된 기존 자산 id

  useEffect(() => {
    if (open) {
      const isIp = isValidIPv4(prefillQuery);
      form.reset(emptyFormValues(isIp ? prefillQuery : undefined, isIp ? undefined : prefillQuery));
      setOwners([
        {
          ownerId: `DRAFT-${draftSeq++}`,
          role: 'biz',
          empNo: me.empNo,
          empName: me.empName,
          email: me.email,
          deptPath: me.deptPath,
          addedBy: me.empNo,
          addedAt: new Date().toISOString(),
        },
      ]);
      setDup(null);
      setFollowUp(null);
    }
  }, [open, prefillQuery, form, me]);

  const addLocalOwner = (role: OwnerRole, p: Omit<AssetOwner, 'ownerId' | 'role' | 'addedBy' | 'addedAt'>) =>
    setOwners((prev) => [
      ...prev,
      { ownerId: `DRAFT-${draftSeq++}`, role, addedBy: me.empNo, addedAt: new Date().toISOString(), ...p },
    ]);
  const removeLocalOwner = (ownerId: string) =>
    setOwners((prev) => prev.filter((o) => o.ownerId !== ownerId));

  const createMut = useMutation({
    mutationFn: (v: { values: AssetFormValues }) => {
      const fields = formValuesToFields(v.values);
      const drafts: NewOwnerDraft[] = owners.map((o) => ({
        role: o.role,
        empNo: o.empNo,
        empName: o.empName,
        email: o.email,
        deptPath: o.deptPath,
      }));
      return createAsset(fields, drafts);
    },
    onSuccess: (res) => {
      if (res.status === 'single-dup') {
        setDup(res.existing);
        return;
      }
      void qc.invalidateQueries({ queryKey: ['search'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(
        res.multiDup
          ? '신규 자산으로 등록했습니다. (동일 IP 자산 존재)'
          : '신규 자산이 등록되었습니다.',
      );
      onClose();
    },
  });

  const addSelfMut = useMutation({
    mutationFn: (existingId: string) => addSelfAsBizOwner(existingId),
    onSuccess: (asset) => {
      void qc.invalidateQueries({ queryKey: ['search'] });
      void qc.invalidateQueries({ queryKey: ['dashboard'] });
      setDup(null);
      setFollowUp(asset.id);
    },
  });

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
    if (owners.length === 0) {
      toast.warn('최소 1개 역할에 담당자가 1명 이상 지정되어야 합니다.');
      return;
    }
    createMut.mutate({ values });
  });

  return (
    <>
      <SideDrawer
        open={open}
        onClose={onClose}
        width={920}
        title="신규 자산 등록"
        subtitle="검색 결과에 없는 자산을 직접 등록합니다."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>취소</Button>
            <Button variant="primary" onClick={onSave} disabled={createMut.isPending}>
              등록
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {errorChips.length > 0 && <ValidationBanner items={errorChips} onChipClick={scrollToField} />}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-neutral-800">담당자</h3>
              {OWNER_ROLES.map((role) => (
                <OwnerRoleCard
                  key={role}
                  role={role}
                  owners={owners.filter((o) => o.role === role)}
                  onAdd={(r, p) => addLocalOwner(r, p)}
                  onRemove={removeLocalOwner}
                />
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800">자산 정보</h3>
              <AssetInfoFields
                form={form}
                highlightEmpty
                fieldRef={(name, el) => (fieldEls.current[name] = el)}
              />
            </div>
          </div>
        </div>
      </SideDrawer>

      {/* 단일 IP 중복 팝업 */}
      <Modal
        open={!!dup}
        onClose={() => setDup(null)}
        size="lg"
        title="동일 IP의 기존 자산이 있습니다"
        footer={
          <>
            <Button onClick={() => setDup(null)}>취소</Button>
            <Button
              variant="primary"
              disabled={addSelfMut.isPending}
              onClick={() => dup && addSelfMut.mutate(dup.id)}
            >
              현업 담당자로 추가
            </Button>
          </>
        }
      >
        {dup && (
          <div className="space-y-3 text-sm">
            <p className="text-neutral-600">
              입력하신 IP의 기존 자산이 1건 있습니다. 본인을 이 자산의{' '}
              <span className="font-medium text-lgred-700">현업 담당자</span>로 추가하시겠습니까?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-neutral-200 p-3">
                <div className="mb-1 text-xs font-semibold text-neutral-500">기존 자산</div>
                <div className="font-medium text-neutral-900">{dup.hostname}</div>
                <div className="font-mono text-xs text-neutral-600">{dup.ips.join(', ')}</div>
                <div className="text-xs text-neutral-500">
                  {dup.os} {dup.osVersion}
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  현업: {dup.owners.filter((o) => o.role === 'biz').map((o) => o.empName).join(', ') || '-'}
                </div>
              </div>
              <div className="rounded-md border border-lgred-200 bg-pink-soft/40 p-3">
                <div className="mb-1 text-xs font-semibold text-lgred-700">내 입력</div>
                <div className="font-medium text-neutral-900">{form.getValues('hostname') || '(미입력)'}</div>
                <div className="font-mono text-xs text-neutral-600">
                  {form.getValues('ips')?.join(', ')}
                </div>
                <div className="text-xs text-neutral-500">
                  {form.getValues('os')} {form.getValues('osVersion')}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 현업 추가 후 후속 흐름 */}
      <Modal
        open={!!followUp}
        onClose={() => {
          setFollowUp(null);
          onClose();
        }}
        size="sm"
        title="현업 담당자로 추가되었습니다"
        footer={
          <>
            <Button
              onClick={() => {
                setFollowUp(null);
                onClose();
              }}
            >
              OK, 끝내기
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const id = followUp!;
                setFollowUp(null);
                onClose();
                onEditExisting?.(id);
              }}
            >
              자산 정보 확인 후 갱신
            </Button>
          </>
        }
      >
        <div className="text-sm text-neutral-600">
          <Badge variant="success">완료</Badge>
          <p className="mt-2">기존 자산의 현업 담당자에 본인이 추가되었습니다.</p>
        </div>
      </Modal>
    </>
  );
}
