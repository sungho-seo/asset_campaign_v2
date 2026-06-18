import type { CurrentUser } from '@/types/domain';

/**
 * SSO mock — 현재 로그인 사용자.
 * 실제 운영에서는 SSO 토큰/세션에서 획득 (PRD §4.1 F-AUTH-2).
 * isInfoSecurityTeam=true 이므로 대시보드 접근 가능 (PRD §7.1).
 */
export const mockCurrentUser: CurrentUser = {
  empNo: 'E20210001',
  empName: '서성호',
  email: 'sungho1.seo@lge.com',
  deptName: '정보보호가시화팀',
  deptPath: 'CRO부문 > 정보보호담당 > 정보보호가시화팀',
  isInfoSecurityTeam: true,
};

export function getCurrentUser(): CurrentUser {
  return mockCurrentUser;
}
