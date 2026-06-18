import { Fragment } from 'react';
import type { Asset } from '@/types/domain';
import type { AssetFields } from '@/lib/api/assets';
import { Modal } from '@/components/feedback/Modal';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  base: Asset | null; // 열람 시점 원본
  current: Asset | null; // 다른 사람이 수정한 현재 DB 값
  mine: AssetFields | null; // 내 입력
  onOverwrite: () => void;
  onTakeTheirs: () => void;
  onCancel: () => void;
};

const ROWS: { key: keyof AssetFields; label: string }[] = [
  { key: 'hostname', label: '자산명' },
  { key: 'ips', label: 'IP' },
  { key: 'os', label: 'OS' },
  { key: 'osVersion', label: 'OS 버전' },
  { key: 'externalAccess', label: '외부 접속' },
  { key: 'domain', label: '도메인' },
  { key: 'location', label: '위치' },
];

function val(src: AssetFields | Asset | null, key: keyof AssetFields): string {
  if (!src) return '-';
  const v = (src as Record<string, unknown>)[key];
  if (Array.isArray(v)) return v.join(', ');
  if (v === null || v === undefined || v === '') return '-';
  return String(v);
}

/** 동시 수정 충돌 3중 비교 (PRD §3.7, F-UPD-7). */
export function ConflictModal({
  open,
  base,
  current,
  mine,
  onOverwrite,
  onTakeTheirs,
  onCancel,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="xl"
      closeOnOverlay={false}
      title="다른 사용자가 이 자산을 수정했습니다"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            취소
          </Button>
          <Button variant="default" onClick={onTakeTheirs}>
            다른 사람 수정 가져오기
          </Button>
          <Button variant="danger" onClick={onOverwrite}>
            내 변경으로 덮어쓰기
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-neutral-600">
        열람 이후 다른 담당자가 자산 정보를 변경했습니다. 아래 3개 값을 비교해 처리 방법을 선택해
        주세요.
      </p>
      <div className="grid grid-cols-[5rem_1fr_1fr_1fr] gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200 text-xs">
        <div className="bg-neutral-50 px-2 py-2 font-semibold text-neutral-500">필드</div>
        <div className="bg-neutral-50 px-2 py-2 font-semibold text-neutral-500">원본 (열람 시점)</div>
        <div className="bg-amber-50 px-2 py-2 font-semibold text-amber-700">다른 사람의 변경</div>
        <div className="bg-lgred-50 px-2 py-2 font-semibold text-lgred-700">내 입력</div>
        {ROWS.map((row) => {
          const b = val(base, row.key);
          const t = val(current, row.key);
          const m = val(mine, row.key);
          return (
            <Fragment key={row.key}>
              <div className="bg-white px-2 py-1.5 font-medium text-neutral-600">{row.label}</div>
              <div className="bg-white px-2 py-1.5 font-mono text-neutral-700">{b}</div>
              <div
                className={cn(
                  'bg-white px-2 py-1.5 font-mono',
                  t !== b ? 'font-semibold text-amber-700' : 'text-neutral-700',
                )}
              >
                {t}
              </div>
              <div
                className={cn(
                  'bg-white px-2 py-1.5 font-mono',
                  m !== b ? 'font-semibold text-lgred-700' : 'text-neutral-700',
                )}
              >
                {m}
              </div>
            </Fragment>
          );
        })}
      </div>
    </Modal>
  );
}
