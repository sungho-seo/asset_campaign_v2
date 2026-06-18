import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useNoticeStore } from '@/stores/noticeStore';
import { getCurrentUser } from '@/lib/mockAuth';

/** 안내 미응답자가 자산 화면 접근 시 /notice로 리다이렉트 (PRD F-GUIDE-8). */
export function RequireNotice({ children }: { children: ReactNode }) {
  const hasResponded = useNoticeStore((s) => s.hasResponded());
  if (!hasResponded) return <Navigate to="/notice" replace />;
  return <>{children}</>;
}

/** 정보보호담당 아닌 사용자의 대시보드 접근 차단 (PRD §7.1, F-AUTH-4). */
export function RequireDashboard({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  if (!user.isInfoSecurityTeam) return <Navigate to="/notice" replace />;
  return <>{children}</>;
}
