import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { TopBar } from './components/layout/TopBar';
import { Toaster } from './components/feedback/Toaster';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { PageLoader } from './components/feedback/PageLoader';
import { RequireNotice, RequireDashboard } from './routes/guards';
import NoticePage from './routes/NoticePage';
import NoticeDonePage from './routes/NoticeDonePage';
import SearchPage from './routes/SearchPage';

// 대시보드는 Recharts 등 무거운 의존성 → 코드 스플리팅
const DashboardPage = lazy(() => import('./routes/DashboardPage'));
const Demo = lazy(() => import('./components/_demo/Demo'));

export default function App() {
  return (
    <div className="min-h-full">
      <TopBar />
      <main>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/notice" replace />} />
              <Route path="/notice" element={<NoticePage />} />
              <Route path="/notice/done" element={<NoticeDonePage />} />
              <Route
                path="/search"
                element={
                  <RequireNotice>
                    <SearchPage />
                  </RequireNotice>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireDashboard>
                    <DashboardPage />
                  </RequireDashboard>
                }
              />
              <Route path="/demo" element={<Demo />} />
              <Route path="*" element={<Navigate to="/notice" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Toaster />
    </div>
  );
}
