import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

/** v1 이식 — 한/EN 토글. i18next 언어 즉시 전환 + localStorage 저장. */
export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? 'ko';
  const isEn = lang.startsWith('en');

  const setLang = (next: 'ko' | 'en') => {
    if (next === lang) return;
    void i18n.changeLanguage(next);
  };

  const buttonClass = (active: boolean) =>
    cn(
      'h-7 min-w-[36px] px-2.5 font-mono text-[11px] transition-colors',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-soft',
      active ? 'bg-brand text-white' : 'bg-transparent text-text-3 hover:text-text',
    );

  return (
    <div role="group" aria-label="language" className="flex overflow-hidden rounded-md border border-line">
      <button type="button" className={buttonClass(!isEn)} aria-pressed={!isEn} onClick={() => setLang('ko')}>
        {t('topbar.lang.korean')}
      </button>
      <span aria-hidden className="w-px self-stretch bg-line" />
      <button type="button" className={buttonClass(isEn)} aria-pressed={isEn} onClick={() => setLang('en')}>
        {t('topbar.lang.english')}
      </button>
    </div>
  );
}
