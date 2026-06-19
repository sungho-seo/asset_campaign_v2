/**
 * 앱 모드.
 * v2는 v1에서 링크를 타고 들어와 '대시보드 전용'으로 운영된다.
 * 안내/임직원 화면은 v1이 담당하므로 v2에서는 숨긴다.
 *
 * 전체 앱(안내·임직원·대시보드)을 보려면:
 *   VITE_DASHBOARD_ONLY=false npm run dev
 */
export const DASHBOARD_ONLY = import.meta.env.VITE_DASHBOARD_ONLY !== 'false';
