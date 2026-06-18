import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentUser } from './lib/mockAuth';

/**
 * Phase 1 라우팅 스켈레톤.
 * 각 화면(안내/검색/대시보드)은 이후 Phase에서 실제 구현으로 교체된다.
 */

function PlaceholderPage({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
      <p className="mt-3 text-sm text-neutral-500">{phase}에서 구현됩니다.</p>
    </div>
  );
}

function TopBar() {
  const { t } = useTranslation();
  const user = getCurrentUser();

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    [
      'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
      isActive ? 'bg-lgred text-white' : 'text-neutral-600 hover:bg-neutral-100',
    ].join(' ');

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-base font-bold text-lgred">{t('app.title')}</span>
          <nav className="flex items-center gap-1">
            <NavLink to="/notice" className={tabClass}>
              {t('nav.notice')}
            </NavLink>
            <NavLink to="/search" className={tabClass}>
              {t('nav.employee')}
            </NavLink>
            <NavLink to="/dashboard" className={tabClass}>
              {t('nav.dashboard')}
            </NavLink>
          </nav>
        </div>
        <div className="text-right text-xs text-neutral-500">
          <div className="font-medium text-neutral-700">{user.empName}</div>
          <div>{user.deptName}</div>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-full">
      <TopBar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/notice" replace />} />
          <Route path="/notice" element={<PlaceholderPage title="안내" phase="Phase 3" />} />
          <Route path="/search" element={<PlaceholderPage title="자산 검색" phase="Phase 4" />} />
          <Route
            path="/dashboard"
            element={<PlaceholderPage title="대시보드" phase="Phase 7~10" />}
          />
          <Route path="*" element={<Navigate to="/notice" replace />} />
        </Routes>
      </main>
    </div>
  );
}
