import { useState } from 'react';
import { Plus, UserPlus, X } from 'lucide-react';
import type { AssetOwner, OwnerRole } from '@/types/domain';
import { ROLE_LABELS } from '@/lib/labels';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { getCurrentUser } from '@/lib/mockAuth';
import { isValidEmail } from '@/lib/validation';
import { cn } from '@/lib/cn';

type NewPerson = { empNo: string; empName: string; email: string; deptPath: string };

type Props = {
  role: OwnerRole;
  owners: AssetOwner[];
  onAdd: (role: OwnerRole, person: NewPerson) => void;
  onRemove: (ownerId: string) => void;
  busy?: boolean;
};

/** 단일 역할 카드. 본인 포함 시 핑크 강조 (PRD F-UPD-2/3). 담당자 변경은 즉시 반영. */
export function OwnerRoleCard({ role, owners, onAdd, onRemove, busy }: Props) {
  const me = getCurrentUser();
  const mine = owners.some((o) => o.empNo === me.empNo);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ empName: '', email: '', deptPath: '' });

  const fillMe = () => {
    if (owners.some((o) => o.empNo === me.empNo)) return;
    onAdd(role, { empNo: me.empNo, empName: me.empName, email: me.email, deptPath: me.deptPath });
  };

  const submitAdd = () => {
    if (!form.empName.trim() || !isValidEmail(form.email)) return;
    onAdd(role, {
      empNo: `EXT-${Date.now()}`,
      empName: form.empName.trim(),
      email: form.email.trim(),
      deptPath: form.deptPath.trim() || '미상',
    });
    setForm({ empName: '', email: '', deptPath: '' });
    setAdding(false);
  };

  return (
    <div
      className={cn(
        'rounded-card border p-3',
        mine ? 'border-lgred-200 bg-pink-soft/50' : 'border-neutral-200 bg-white',
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('text-sm font-semibold', mine ? 'text-lgred-700' : 'text-neutral-700')}>
          {ROLE_LABELS[role]}
          <span className="ml-1 text-xs font-normal text-neutral-400">{owners.length}명</span>
        </span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={fillMe} disabled={busy || mine}>
            <UserPlus size={13} /> 내 정보
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAdding((v) => !v)} disabled={busy}>
            <Plus size={13} /> 추가
          </Button>
        </div>
      </div>

      <div className="mt-2 space-y-1.5">
        {owners.length === 0 && !adding && (
          <p className="py-1 text-xs text-neutral-400">지정된 담당자가 없습니다.</p>
        )}
        {owners.map((o) => (
          <div
            key={o.ownerId}
            className="flex items-center justify-between rounded border border-neutral-200 bg-white px-2 py-1.5 text-xs"
          >
            <div className="min-w-0">
              <span className="font-medium text-neutral-800">{o.empName}</span>
              <span className="ml-1.5 text-neutral-400">{o.email}</span>
              <div className="truncate text-neutral-400">{o.deptPath}</div>
            </div>
            <button
              type="button"
              onClick={() => onRemove(o.ownerId)}
              disabled={busy}
              aria-label="담당자 삭제"
              className="ml-2 shrink-0 rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-danger"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {adding && (
          <div className="space-y-1.5 rounded border border-dashed border-lgred-200 bg-white p-2">
            <Input
              placeholder="이름"
              value={form.empName}
              onChange={(e) => setForm((f) => ({ ...f, empName: e.target.value }))}
              className="h-8 text-xs"
            />
            <Input
              placeholder="이메일"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="h-8 text-xs"
            />
            <Input
              placeholder="소속 조직명"
              value={form.deptPath}
              onChange={(e) => setForm((f) => ({ ...f, deptPath: e.target.value }))}
              className="h-8 text-xs"
            />
            <div className="flex justify-end gap-1">
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
                취소
              </Button>
              <Button size="sm" variant="primary" onClick={submitAdd}>
                추가
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
