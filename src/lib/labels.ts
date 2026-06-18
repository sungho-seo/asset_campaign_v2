import type { OwnerRole } from '@/types/domain';

export const ROLE_LABELS: Record<OwnerRole, string> = {
  biz: '현업 담당자',
  it: 'IT 담당자',
  sm: 'SM 담당자',
  server_primary: '서버 담당자(정)',
  server_secondary: '서버 담당자(부)',
};

export const ASSET_TYPE_LABELS: Record<'on-premise' | 'cloud', string> = {
  'on-premise': '온프레미스',
  cloud: '클라우드',
};

export const OS_OPTIONS = [
  'Rocky Linux',
  'Ubuntu',
  'CentOS',
  'RHEL',
  'Windows Server',
  'Windows',
  'macOS',
  'Amazon Linux',
  '기타',
];

export const CSP_OPTIONS = ['AWS', 'Azure', 'GCP', 'NCP', '직접입력'];

export const ENVIRONMENT_OPTIONS = ['Production', 'Staging', 'Development', 'Test'] as const;

export const DATA_CLASS_OPTIONS = [
  '공개',
  '내부용',
  '기밀',
  '개인정보',
  '민감정보',
  '없음',
];

export const SECURITY_SOLUTION_OPTIONS = [
  'V3',
  'EDR',
  'TrendMicro',
  'CrowdStrike',
  'Defender',
  '없음',
  '기타',
];
