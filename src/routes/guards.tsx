import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useNoticeStore } from '@/stores/noticeStore';
import { getCurrentUser } from '@/lib/mockAuth';

/** 안내 미응답자가 자산 화면 접근 시 /notice로 리다이렉트 (PRD F-GUIDE-8). */
export function RequireNotice({ children }: { children: ReactNode }) {
  const hasResponded = useNoticeStore((s) => s.hasResponded());
  if (!hasResponded) return <Navigate to="/notice" replace />;
  return <>{children}</>;
}

/**
 * 정보보호담당 아닌 사용자의 대시보드 접근 차단 (PRD §7.1, F-AUTH-4).
 * 대시보드 전용 모드에서 리다이렉트 루프를 피하기 위해 차단 화면을 렌더한다.
 */
export function RequireDashboard({ children }: { children: ReactNode }) {
  const user = getCurrentUser();
  if (!user.isInfoSecurityTeam) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <ShieldAlert size={44} className="mx-auto text-danger" />
        <h1 className="mt-4 text-lg font-bold text-text">접근 권한이 없습니다</h1>
        <p className="mt-2 text-[13px] text-text-3">
          대시보드는 정보보호담당 소속 구성원만 접근할 수 있습니다.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
