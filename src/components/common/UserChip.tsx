import { Avatar } from './Avatar';

type UserChipProps = {
  name: string;
  meta?: string;
};

/** v1 이식 — 상단바 사용자 칩 (이름 + 소속 + 아바타). */
export function UserChip({ name, meta }: UserChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-2.5 pr-1.5">
      <div className="text-right leading-tight">
        <div className="text-[13px] font-medium text-text">{name}</div>
        {meta && <div className="font-mono text-[11px] text-text-3">{meta}</div>}
      </div>
      <Avatar name={name} />
    </div>
  );
}
