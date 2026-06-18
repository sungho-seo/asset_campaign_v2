import { Cloud, Server, Laptop, Monitor, CheckCircle2, XCircle } from 'lucide-react';

const INCLUDED = [
  { icon: Cloud, label: '클라우드', desc: 'IaaS/PaaS 인스턴스 (VM 포함)' },
  { icon: Server, label: '서버', desc: '물리/가상 서버 (VM 포함)' },
  { icon: Monitor, label: '개발용 데스크탑 PC', desc: '업무·개발용 데스크탑' },
  { icon: Laptop, label: '개발용 노트북', desc: '업무·개발용 노트북' },
];

const EXCLUDED = [
  '개인 리스 PC',
  '개인·회사지급 모바일 디바이스',
  '컨테이너 (Docker / Kubernetes)',
  '제조·공정 자산',
];

/** 안내 페이지 본문: 등록 대상 / 제외 대상 카드 (PRD §4.2 F-GUIDE-2). */
export function ScopeCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-card border border-lgred-100 bg-pink-soft/50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-lgred-700">
          <CheckCircle2 size={16} />
          등록 대상 IT 자산
        </div>
        <ul className="mt-3 space-y-2.5">
          {INCLUDED.map((it) => (
            <li key={it.label} className="flex items-start gap-3">
              <it.icon size={18} className="mt-0.5 shrink-0 text-lgred" />
              <div>
                <div className="text-sm font-medium text-neutral-800">{it.label}</div>
                <div className="text-xs text-neutral-500">{it.desc}</div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-neutral-500">※ 가상머신(VM)도 등록 대상에 포함됩니다.</p>
      </div>

      <div className="rounded-card border border-neutral-200 bg-neutral-50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
          <XCircle size={16} />
          제외 대상
        </div>
        <ul className="mt-3 space-y-2.5">
          {EXCLUDED.map((label) => (
            <li key={label} className="flex items-start gap-2 text-sm text-neutral-600">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
              {label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-neutral-400">
          위 항목은 본 캠페인의 등록 대상이 아닙니다.
        </p>
      </div>
    </div>
  );
}
