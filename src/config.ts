/**
 * 앱 모드.
 * 기본은 v1과 동일하게 전체 화면(안내·임직원·대시보드)을 노출한다.
 * v1 링크에서 대시보드만 노출하고 싶은 배포에서는 빌드 시 VITE_DASHBOARD_ONLY=true 로 설정.
 */
export const DASHBOARD_ONLY = import.meta.env.VITE_DASHBOARD_ONLY === 'true';
