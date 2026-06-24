import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Pill } from '@/components/common/Pill';
import { UserChip } from '@/components/common/UserChip';
import { LanguageToggle } from './LanguageToggle';
import { getCurrentUser } from '@/lib/mockAuth';
import { CAMPAIGN } from '@/lib/mockDashboard';
import { DASHBOARD_ONLY } from '@/config';
import { cn } from '@/lib/cn';

function campaignDPlus(): number {
  const start = new Date(`${CAMPAIGN.startDate}T00:00:00+09:00`).getTime();
  return Math.max(0, Math.floor((Date.now() - start) / 86_400_000));
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded px-2.5 py-1 font-mono text-[11px] transition-colors',
    isActive ? 'bg-brand text-white' : 'text-text-3 hover:text-text',
  );

/** 상단바 — v1 구성: 브랜드 + 네비 + 캠페인 배지 + 사용자 칩 + 한/EN. */
export function TopBar() {
  const { t } = useTranslation();
  const user = getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-8 py-3.5">
        <Link to={DASHBOARD_ONLY ? '/dashboard' : '/notice'} className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-brand font-mono text-[11px] font-semibold tracking-tighter2 text-white">
            IT
          </div>
          <div className="text-sm font-semibold tracking-tightish text-text">
            {t('topbar.brand')}
            <span className="ml-1.5 font-normal text-text-3">/ {t('topbar.subtitle')}</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {!DASHBOARD_ONLY && (
            <nav className="flex items-center gap-1">
              <NavLink to="/notice" className={navLinkClass}>
                {t('nav.notice')}
              </NavLink>
              <NavLink to="/search" className={navLinkClass}>
                {t('nav.employee')}
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                {t('nav.dashboard')}
              </NavLink>
            </nav>
          )}
          <Pill dot="success">
            {t('topbar.campaign')} · D+{campaignDPlus()}
          </Pill>
          <UserChip name={user.empName} meta={user.deptName} />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
