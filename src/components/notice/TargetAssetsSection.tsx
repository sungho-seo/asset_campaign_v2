import { Info, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// v1 이식 — 등록 대상 4종 카드 + VM 안내 + 제외 대상.
// 색상은 자산 유형 시그널(브랜드 톤과 분리). 라벨/부제는 i18n.

const CloudIcon = () => (
  <svg viewBox="0 0 64 48" className="mx-auto mb-1.5 block h-9 w-12" role="img" aria-label="Cloud">
    <path
      d="M48 28c0-6.6-5.4-12-12-12-1.2 0-2.4 0.2-3.5 0.5C30.8 12.7 27.2 10 23 10c-6 0-11 5-11 11 0 0.5 0 1 0.1 1.5C8.5 23.3 5 27 5 31.5 5 36.7 9.3 41 14.5 41h32C51.7 41 56 36.7 56 31.5c0-2-1.4-3.5-3-3.5-1 0-3 0-5 0z"
      fill="#B5D4F4"
      stroke="#185FA5"
      strokeWidth="1"
    />
  </svg>
);

const ServerIcon = () => (
  <svg viewBox="0 0 64 48" className="mx-auto mb-1.5 block h-9 w-12" role="img" aria-label="Server">
    <rect x="14" y="6" width="36" height="11" rx="2" fill="#CECBF6" stroke="#534AB7" strokeWidth="1" />
    <circle cx="20" cy="11.5" r="1.5" fill="#534AB7" />
    <rect x="26" y="10" width="18" height="3" rx="0.5" fill="#534AB7" opacity="0.4" />
    <rect x="14" y="19" width="36" height="11" rx="2" fill="#CECBF6" stroke="#534AB7" strokeWidth="1" />
    <circle cx="20" cy="24.5" r="1.5" fill="#534AB7" />
    <rect x="26" y="23" width="18" height="3" rx="0.5" fill="#534AB7" opacity="0.4" />
    <rect x="14" y="32" width="36" height="11" rx="2" fill="#CECBF6" stroke="#534AB7" strokeWidth="1" />
    <circle cx="20" cy="37.5" r="1.5" fill="#534AB7" />
    <rect x="26" y="36" width="18" height="3" rx="0.5" fill="#534AB7" opacity="0.4" />
  </svg>
);

const DesktopIcon = () => (
  <svg viewBox="0 0 64 48" className="mx-auto mb-1.5 block h-9 w-12" role="img" aria-label="Desktop PC">
    <rect x="12" y="6" width="40" height="26" rx="2" fill="#9FE1CB" stroke="#0F6E56" strokeWidth="1" />
    <rect x="15" y="9" width="34" height="20" rx="1" fill="#E1F5EE" />
    <rect x="26" y="32" width="12" height="6" fill="#0F6E56" opacity="0.3" />
    <rect x="18" y="38" width="28" height="3" rx="1" fill="#0F6E56" />
  </svg>
);

const LaptopIcon = () => (
  <svg viewBox="0 0 64 48" className="mx-auto mb-1.5 block h-9 w-12" role="img" aria-label="Laptop">
    <path d="M14 10 L50 10 L50 32 L14 32 Z" fill="#FAC775" stroke="#854F0B" strokeWidth="1" />
    <rect x="16.5" y="12.5" width="31" height="17" fill="#FAEEDA" />
    <path d="M8 34 L56 34 L54 40 L10 40 Z" fill="#FAC775" stroke="#854F0B" strokeWidth="1" />
    <rect x="28" y="36" width="8" height="2" rx="1" fill="#854F0B" opacity="0.3" />
  </svg>
);

const InclusionDivider = () => (
  <div aria-hidden="true" className="select-none text-center text-[14px] leading-none text-text-4">
    · · ·
  </div>
);

const CARD_DEFS = [
  { id: 'cloud', Icon: CloudIcon },
  { id: 'server', Icon: ServerIcon },
  { id: 'desktop', Icon: DesktopIcon },
  { id: 'laptop', Icon: LaptopIcon },
] as const;

export function TargetAssetsSection() {
  const { t } = useTranslation();
  const excludeItems = t('notice.scope.excludeItems', { returnObjects: true }) as string[];

  return (
    <section className="mb-4 rounded-lg border border-line bg-white p-5 shadow-sm">
      <p className="mb-4 flex items-center gap-1.5 text-[14px] font-semibold tracking-tightish text-text">
        <Target className="h-4 w-4 text-brand" aria-hidden="true" />
        {t('notice.scope.title')}
      </p>

      <div className="grid grid-cols-4 gap-2">
        {CARD_DEFS.map(({ id, Icon }) => {
          const subOnTop = id === 'desktop' || id === 'laptop';
          return (
            <div key={id} className="rounded-md bg-bg-soft px-2 py-3.5 text-center">
              <Icon />
              {subOnTop && (
                <p className="mb-0.5 text-[10.5px] leading-tight text-text-4">
                  {t(`notice.scope.cards.${id}.sub`)}
                </p>
              )}
              <p className="mb-0.5 break-keep text-[11.5px] font-medium leading-tight">
                {t(`notice.scope.cards.${id}.name`)}
              </p>
              {!subOnTop && (
                <p className="whitespace-pre-line text-[10.5px] leading-tight text-text-4">
                  {t(`notice.scope.cards.${id}.sub`)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3">
        <InclusionDivider />
      </div>

      <div className="mt-2 text-center">
        <p className="text-[12px] text-text-3">{t('notice.scope.vmTitle')}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-text-4">{t('notice.scope.vmBody')}</p>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-md border border-amber-200 bg-warn-soft p-3 px-3.5">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-warn" aria-hidden="true" />
        <div className="flex-1">
          <p className="mb-1 text-[13px] font-medium text-warn">{t('notice.scope.excludeTitle')}</p>
          <ul className="space-y-0.5 text-xs leading-relaxed text-warn/85">
            {excludeItems.map((item, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-warn/60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
