import { Navigate, Route, Routes } from 'react-router-dom';
import { TopBar } from './components/layout/TopBar';
import { Toaster } from './components/feedback/Toaster';
import { RequireNotice, RequireDashboard } from './routes/guards';
import NoticePage from './routes/NoticePage';
import NoticeDonePage from './routes/NoticeDonePage';
import Demo from './components/_demo/Demo';

function PlaceholderPage({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
      <p className="mt-3 text-sm text-neutral-500">{phase}에서 구현됩니다.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-full">
      <TopBar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/notice" replace />} />
          <Route path="/notice" element={<NoticePage />} />
          <Route path="/notice/done" element={<NoticeDonePage />} />
          <Route
            path="/search"
            element={
              <RequireNotice>
                <PlaceholderPage title="자산 검색" phase="Phase 4" />
              </RequireNotice>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireDashboard>
                <PlaceholderPage title="대시보드" phase="Phase 7~10" />
              </RequireDashboard>
            }
          />
          <Route path="/demo" element={<Demo />} />
          <Route path="*" element={<Navigate to="/notice" replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}
