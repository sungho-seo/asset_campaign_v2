import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { getCurrentUser } from '@/lib/mockAuth';
import { DASHBOARD_ONLY } from '@/config';
import { cn } from '@/lib/cn';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-lgred text-white' : 'text-neutral-600 hover:bg-neutral-100',
  );

export function TopBar() {
  const { t } = useTranslation();
  const user = getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-base font-bold text-lgred">{t('app.title')}</span>
          {DASHBOARD_ONLY ? (
            // 대시보드 전용 모드 — 탭 숨김, 대시보드 표시만
            <span className="inline-flex items-center gap-1 rounded-md bg-lgred px-3 py-1.5 text-sm font-medium text-white">
              <ShieldCheck size={14} />
              {t('nav.dashboard')}
            </span>
          ) : (
            <nav className="flex items-center gap-1">
              <NavLink to="/notice" className={tabClass}>
                {t('nav.notice')}
              </NavLink>
              <NavLink to="/search" className={tabClass}>
                {t('nav.employee')}
              </NavLink>
              {user.isInfoSecurityTeam && (
                <NavLink to="/dashboard" className={tabClass}>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck size={14} />
                    {t('nav.dashboard')}
                  </span>
                </NavLink>
              )}
            </nav>
          )}
        </div>
        <div className="text-right text-xs text-neutral-500">
          <div className="font-medium text-neutral-700">
            {user.empName}
            <span className="ml-1 font-normal text-neutral-400">{user.email}</span>
          </div>
          <div>{user.deptPath}</div>
        </div>
      </div>
    </header>
  );
}
