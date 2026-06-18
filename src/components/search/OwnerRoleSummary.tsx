import type { Asset } from '@/types/domain';
import { OWNER_ROLES } from '@/types/domain';
import { ROLE_LABELS } from '@/lib/labels';
import { getCurrentUser } from '@/lib/mockAuth';
import { cn } from '@/lib/cn';

/** 역할별 담당자 요약: 역할명 + 첫 담당자 이름·소속 + N명 시 '+N-1' (PRD F-SCH-5). */
export function OwnerRoleSummary({ asset }: { asset: Asset }) {
  const me = getCurrentUser();
  return (
    <div className="grid grid-cols-5 gap-1">
      {OWNER_ROLES.map((role) => {
        const list = asset.owners.filter((o) => o.role === role);
        const first = list[0];
        const mine = list.some((o) => o.empNo === me.empNo);
        return (
          <div
            key={role}
            className={cn(
              'rounded border px-1.5 py-1 text-[11px] leading-tight',
              mine ? 'border-lgred-200 bg-lgred-50' : 'border-neutral-200 bg-neutral-50',
            )}
          >
            <div className="font-medium text-neutral-500">{ROLE_LABELS[role]}</div>
            {first ? (
              <div className="mt-0.5">
                <span className={cn('font-medium', mine ? 'text-lgred-700' : 'text-neutral-800')}>
                  {first.empName}
                </span>
                {list.length > 1 && (
                  <span className="ml-0.5 text-neutral-400">+{list.length - 1}</span>
                )}
                <div className="truncate text-neutral-400" title={first.deptPath}>
                  {first.deptPath.split('>').pop()?.trim()}
                </div>
              </div>
            ) : (
              <div className="mt-0.5 text-neutral-300">—</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
