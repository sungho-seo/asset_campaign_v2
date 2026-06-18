import { AlertTriangle } from 'lucide-react';

export type ValidationItem = {
  /** 필드 식별자 (스크롤·포커스 대상) */
  field: string;
  label: string;
};

type Props = {
  items: ValidationItem[];
  onChipClick: (field: string) => void;
};

/** 검증 오류 종합 배너. 칩 클릭 → 해당 필드로 스크롤·포커스·펄스 (Phase 5에서 연결). */
export function ValidationBanner({ items, onChipClick }: Props) {
  if (items.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-md border border-danger/30 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle size={16} />
        입력값을 확인해 주세요 ({items.length}건)
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item.field}
            type="button"
            onClick={() => onChipClick(item.field)}
            className="rounded-full border border-danger/40 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
