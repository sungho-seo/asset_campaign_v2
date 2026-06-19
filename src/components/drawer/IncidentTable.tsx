import { Avatar } from '@/components/common/Avatar';
import type { AnomalyDetail, IncUser, IncidentRow } from '@/lib/api/dashboard';
import type { AssetRef } from '@/components/dashboard/AssetDetailDrawer';
import { cn } from '@/lib/cn';

type Props = {
  detail: AnomalyDetail;
  filter?: string;
  onSelectAsset?: (ref: AssetRef) => void;
};

function AssetCell({ ip, host }: { ip?: string; host?: string }) {
  return (
    <div>
      <div className="font-mono text-[12.5px] font-medium text-text">{ip ?? '-'}</div>
      <div className="mt-0.5 text-[11.5px] text-text-3">{host ?? '-'}</div>
    </div>
  );
}

function UserChip({ user, tone, strike }: { user: IncUser; tone?: 'alt'; strike?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 align-top">
      <Avatar name={user.name} size="sm" tone={tone} />
      <span className="flex flex-col leading-tight">
        <span className={cn('text-[12px] text-text-2', strike && 'text-text-4 line-through')}>
          {user.name}
        </span>
        <span className="text-[10.5px] text-text-4">{user.team}</span>
      </span>
    </span>
  );
}

function rowText(r: IncidentRow): string {
  return [
    r.ip, r.host, r.label,
    r.users?.map((u) => `${u.name} ${u.team}`).join(' '),
    r.who && `${r.who.name} ${r.who.team}`,
    r.prev?.name,
    r.target && `${r.target.name} ${r.target.team}`,
    r.added && `${r.added.name} ${r.added.team}`,
    r.role,
    r.duplicates?.map((d) => `${d.host} ${d.owner}`).join(' '),
    r.when,
  ].filter(Boolean).join(' ').toLowerCase();
}

function headers(key: AnomalyDetail['key']): string[] {
  switch (key) {
    case 'dup-edit':
      return ['자산', '충돌한 담당자', '마지막 충돌'];
    case 'overwrite':
      return ['자산', '덮어쓴 담당자', '', '기존 담당자', '일시'];
    case 'owner-change':
      return ['자산', '행위자', '추가/삭제', '대상자', '역할', '일시'];
    case 'dup-ip-new':
      return ['신규 자산', '동일 IP 자산', '일시'];
    case 'dup-ip-update':
      return ['갱신 자산', '추가된 현업 담당자', '일시'];
    default:
      return ['순위', '대상', '검색 시도', '검색자 수'];
  }
}

/** 행이 자산과 연결되면 드릴다운 ref 반환 (없으면 null). */
function refForRow(key: AnomalyDetail['key'], r: IncidentRow): AssetRef {
  switch (key) {
    case 'dup-edit':
    case 'overwrite':
    case 'owner-change':
    case 'dup-ip-new':
    case 'dup-ip-update':
      return r.host ? { host: r.host } : null;
    case 'search-top-ip':
      return r.label ? { ip: r.label } : null;
    case 'search-top-host':
      return r.label ? { host: r.label } : null;
    default:
      return null;
  }
}

function Cells({ detail, r }: { detail: AnomalyDetail; r: IncidentRow }) {
  const td = 'px-6 py-3.5 align-top';
  switch (detail.key) {
    case 'dup-edit':
      return (
        <>
          <td className={td}><AssetCell ip={r.ip} host={r.host} /></td>
          <td className={td}>
            <span className="flex flex-wrap items-center gap-1.5">
              <UserChip user={r.users![0]!} />
              <span className="font-mono text-[10px] text-text-4">vs</span>
              <UserChip user={r.users![1]!} tone="alt" />
            </span>
          </td>
          <td className={cn(td, 'font-mono text-[11.5px] text-text-3')}>{r.when}</td>
        </>
      );
    case 'overwrite':
      return (
        <>
          <td className={td}><AssetCell ip={r.ip} host={r.host} /></td>
          <td className={td}><UserChip user={r.who!} /></td>
          <td className={cn(td, 'text-center font-mono text-[12px] text-text-4')}>→</td>
          <td className={td}><UserChip user={r.prev!} strike /></td>
          <td className={cn(td, 'font-mono text-[11.5px] text-text-3')}>{r.when}</td>
        </>
      );
    case 'owner-change':
      return (
        <>
          <td className={td}><AssetCell ip={r.ip} host={r.host} /></td>
          <td className={td}><UserChip user={r.who!} /></td>
          <td className={td}>
            <span className={cn('rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium',
              r.action === '추가' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger')}>
              {r.action}
            </span>
          </td>
          <td className={td}><UserChip user={r.target!} tone="alt" /></td>
          <td className={cn(td, 'text-[12px] text-text-2')}>{r.role}</td>
          <td className={cn(td, 'font-mono text-[11.5px] text-text-3')}>{r.when}</td>
        </>
      );
    case 'dup-ip-new':
      return (
        <>
          <td className={td}><AssetCell ip={r.ip} host={r.host} /></td>
          <td className={td}>
            <div className="space-y-1">
              {r.duplicates!.map((d, i) => (
                <div key={i} className="flex items-center justify-between gap-2 rounded bg-bg-soft px-2 py-1">
                  <span className="font-mono text-[11px] text-text-2">{d.host}</span>
                  <span className="text-[10.5px] text-text-4">{d.owner}</span>
                </div>
              ))}
            </div>
          </td>
          <td className={cn(td, 'font-mono text-[11.5px] text-text-3')}>{r.when}</td>
        </>
      );
    case 'dup-ip-update':
      return (
        <>
          <td className={td}><AssetCell ip={r.ip} host={r.host} /></td>
          <td className={td}><UserChip user={r.added!} /></td>
          <td className={cn(td, 'font-mono text-[11.5px] text-text-3')}>{r.when}</td>
        </>
      );
    default:
      return (
        <>
          <td className={cn(td, 'font-mono text-[12.5px] font-semibold text-text-3')}>#{r.rank}</td>
          <td className={cn(td, 'font-mono text-[12.5px] font-medium text-text')}>{r.label}</td>
          <td className={cn(td, 'font-mono text-[12px] text-text-2')}>{r.attempts}회</td>
          <td className={cn(td, 'font-mono text-[12px] text-text-2')}>{r.searchers}명</td>
        </>
      );
  }
}

export function IncidentTable({ detail, filter = '', onSelectAsset }: Props) {
  const needle = filter.trim().toLowerCase();
  const rows = needle ? detail.rows.filter((r) => rowText(r).includes(needle)) : detail.rows;
  const cols = headers(detail.key);

  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr>
          {cols.map((c, i) => (
            <th
              key={i}
              className="sticky top-0 z-[1] border-b border-line bg-bg-soft/60 px-6 py-2.5 text-left font-mono text-[10.5px] font-medium uppercase tracking-wider text-text-3"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={cols.length} className="px-6 py-12 text-center text-[12.5px] text-text-3">
              조건에 맞는 결과가 없습니다.
            </td>
          </tr>
        ) : (
          rows.map((r) => {
            const ref = onSelectAsset ? refForRow(detail.key, r) : null;
            return (
              <tr
                key={r.id}
                onClick={ref ? () => onSelectAsset!(ref) : undefined}
                className={cn(
                  'border-b border-line transition-colors hover:bg-bg-soft/50',
                  ref && 'cursor-pointer',
                )}
              >
                <Cells detail={detail} r={r} />
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
