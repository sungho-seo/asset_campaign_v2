import type { UseFormReturn } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import type { AssetFormValues } from '@/lib/assetSchema';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { ToggleGroup } from '@/components/common/ToggleGroup';
import { Button } from '@/components/common/Button';
import {
  OS_OPTIONS,
  CSP_OPTIONS,
  ENVIRONMENT_OPTIONS,
  DATA_CLASS_OPTIONS,
  SECURITY_SOLUTION_OPTIONS,
  ASSET_TYPE_LABELS,
} from '@/lib/labels';

type Props = {
  form: UseFormReturn<AssetFormValues>;
  /** 신규 등록 시 빈 필드 노란 강조 */
  highlightEmpty?: boolean;
  fieldRef?: (name: string, el: HTMLElement | null) => void;
};

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-xs font-medium text-neutral-600">
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

const opts = (arr: readonly string[]) => arr.map((v) => ({ value: v, label: v }));

export function AssetInfoFields({ form, highlightEmpty, fieldRef }: Props) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const assetType = watch('assetType');
  const externalAccess = watch('externalAccess');
  const ips = watch('ips') ?? [];

  const addIp = () => setValue('ips', [...ips, ''], { shouldValidate: false });
  const removeIp = (i: number) =>
    setValue(
      'ips',
      ips.filter((_, idx) => idx !== i),
      { shouldValidate: true },
    );

  const emptyCls = (v: unknown) =>
    highlightEmpty && (v === undefined || v === null || v === '') ? 'bg-amber-50' : '';

  return (
    <div className="space-y-3">
      <div>
        <Label required>자산 유형</Label>
        <Select
          options={[
            { value: 'on-premise', label: ASSET_TYPE_LABELS['on-premise'] },
            { value: 'cloud', label: ASSET_TYPE_LABELS.cloud },
          ]}
          {...register('assetType')}
        />
      </div>

      <div ref={(el) => fieldRef?.('hostname', el)}>
        <Label required>자산명 (Hostname)</Label>
        <Input
          {...register('hostname')}
          invalid={!!errors.hostname}
          className={emptyCls(watch('hostname'))}
        />
        {errors.hostname && <p className="mt-1 text-xs text-danger">{errors.hostname.message}</p>}
      </div>

      <div>
        <Label>사용 목적 / 서비스명</Label>
        <Textarea rows={2} {...register('servicePurpose')} placeholder="예: 근태입력시스템" />
      </div>

      <div ref={(el) => fieldRef?.('ips', el)}>
        <Label required>IP 주소</Label>
        <div className="space-y-1.5">
          {ips.map((_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Input
                mono
                {...register(`ips.${i}` as const)}
                invalid={!!errors.ips}
                className={emptyCls(ips[i])}
                placeholder="10.20.30.40"
              />
              <button
                type="button"
                onClick={() => removeIp(i)}
                disabled={ips.length === 1}
                aria-label="IP 삭제"
                className="rounded p-1.5 text-neutral-400 hover:bg-red-50 hover:text-danger disabled:opacity-30"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={addIp}>
            <Plus size={13} /> IP 추가
          </Button>
        </div>
        {errors.ips && (
          <p className="mt-1 text-xs text-danger">
            {errors.ips.message ?? 'IP 형식을 확인해 주세요.'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>외부 접속 여부</Label>
          <ToggleGroup
            value={externalAccess}
            onChange={(v) => setValue('externalAccess', v)}
            options={[
              { value: 'yes', label: '예' },
              { value: 'no', label: '아니오' },
            ]}
          />
        </div>
        <div ref={(el) => fieldRef?.('domain', el)}>
          <Label>도메인명</Label>
          <Input {...register('domain')} invalid={!!errors.domain} placeholder="예: lge.com" />
          {errors.domain && <p className="mt-1 text-xs text-danger">{errors.domain.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div ref={(el) => fieldRef?.('os', el)}>
          <Label required>운영체제</Label>
          <Select
            options={opts(OS_OPTIONS)}
            placeholder="선택"
            {...register('os')}
            invalid={!!errors.os}
          />
          {errors.os && <p className="mt-1 text-xs text-danger">{errors.os.message}</p>}
        </div>
        <div ref={(el) => fieldRef?.('osVersion', el)}>
          <Label required>운영체제 버전</Label>
          <Input {...register('osVersion')} invalid={!!errors.osVersion} placeholder="예: 9.3" />
          {errors.osVersion && (
            <p className="mt-1 text-xs text-danger">{errors.osVersion.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>자산 위치</Label>
          <Input {...register('location')} placeholder="예: 가산 R&D 5F" />
        </div>
        <div>
          <Label>보안 솔루션</Label>
          <Select
            options={opts(SECURITY_SOLUTION_OPTIONS)}
            placeholder="선택"
            {...register('securitySolution')}
          />
        </div>
      </div>

      {assetType === 'cloud' && (
        <div className="space-y-3 rounded-card border border-blue-200 bg-blue-50/50 p-3">
          <p className="text-xs font-semibold text-info">클라우드 추가 정보</p>
          <div className="grid grid-cols-2 gap-3">
            <div ref={(el) => fieldRef?.('csp', el)}>
              <Label required>CSP</Label>
              <Select
                options={opts(CSP_OPTIONS)}
                placeholder="선택"
                {...register('csp')}
                invalid={!!errors.csp}
              />
              {errors.csp && <p className="mt-1 text-xs text-danger">{errors.csp.message}</p>}
            </div>
            <div ref={(el) => fieldRef?.('accountId', el)}>
              <Label required>계정 ID</Label>
              <Input {...register('accountId')} invalid={!!errors.accountId} />
              {errors.accountId && (
                <p className="mt-1 text-xs text-danger">{errors.accountId.message}</p>
              )}
            </div>
            <div ref={(el) => fieldRef?.('environment', el)}>
              <Label required>환경</Label>
              <Select
                options={opts(ENVIRONMENT_OPTIONS)}
                placeholder="선택"
                {...register('environment')}
                invalid={!!errors.environment}
              />
              {errors.environment && (
                <p className="mt-1 text-xs text-danger">{errors.environment.message}</p>
              )}
            </div>
            <div>
              <Label>취급 데이터 등급</Label>
              <Select options={opts(DATA_CLASS_OPTIONS)} placeholder="선택" {...register('dataClass')} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
