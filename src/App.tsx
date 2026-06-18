import { Navigate, Route, Routes } from 'react-router-dom';
import { TopBar } from './components/layout/TopBar';
import { Toaster } from './components/feedback/Toaster';
import Demo from './components/_demo/Demo';

/**
 * 라우팅 스켈레톤. 각 화면(안내/검색/대시보드)은 이후 Phase에서 실제 구현으로 교체된다.
 */

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
          <Route path="/notice" element={<PlaceholderPage title="안내" phase="Phase 3" />} />
          <Route path="/search" element={<PlaceholderPage title="자산 검색" phase="Phase 4" />} />
          <Route
            path="/dashboard"
            element={<PlaceholderPage title="대시보드" phase="Phase 7~10" />}
          />
          <Route path="/demo" element={<Demo />} />
          <Route path="*" element={<Navigate to="/notice" replace />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}
