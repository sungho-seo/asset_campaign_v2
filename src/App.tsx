import { Navigate, Route, Routes } from 'react-router-dom';
import { TopBar } from './components/layout/TopBar';
import { Toaster } from './components/feedback/Toaster';
import { RequireNotice, RequireDashboard } from './routes/guards';
import NoticePage from './routes/NoticePage';
import NoticeDonePage from './routes/NoticeDonePage';
import SearchPage from './routes/SearchPage';
import DashboardPage from './routes/DashboardPage';
import Demo from './components/_demo/Demo';

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
      </main>
      <Toaster />
    </div>
  );
}
