import { z } from 'zod';
import { isValidIPv4, isValidDomain } from './validation';

export const assetFormSchema = z
  .object({
    assetType: z.enum(['on-premise', 'cloud']),
    hostname: z.string().min(1, '자산명을 입력해 주세요.'),
    servicePurpose: z.string().optional(),
    ips: z
      .array(z.string())
      .min(1, 'IP 주소를 1개 이상 입력해 주세요.')
      .refine((arr) => arr.every((ip) => isValidIPv4(ip)), 'IPv4 형식이 올바르지 않습니다.'),
    externalAccess: z.enum(['yes', 'no']).nullable(),
    domain: z.string().refine(isValidDomain, '도메인 형식이 올바르지 않습니다.').optional(),
    os: z.string().min(1, '운영체제를 선택해 주세요.'),
    osVersion: z.string().min(1, '운영체제 버전을 입력해 주세요.'),
    location: z.string().optional(),
    securitySolution: z.string().optional(),
    csp: z.string().optional(),
    accountId: z.string().optional(),
    environment: z.enum(['Production', 'Staging', 'Development', 'Test']).optional(),
    dataClass: z.string().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.assetType === 'cloud') {
      if (!val.csp) ctx.addIssue({ code: 'custom', path: ['csp'], message: 'CSP를 선택해 주세요.' });
      if (!val.accountId)
        ctx.addIssue({ code: 'custom', path: ['accountId'], message: '계정 ID를 입력해 주세요.' });
      if (!val.environment)
        ctx.addIssue({ code: 'custom', path: ['environment'], message: '환경을 선택해 주세요.' });
    }
  });

export type AssetFormValues = z.infer<typeof assetFormSchema>;

/** 검증 배너 칩 라벨 매핑. */
export const FIELD_LABELS: Record<string, string> = {
  hostname: '자산명',
  ips: 'IP 주소',
  os: '운영체제',
  osVersion: '운영체제 버전',
  domain: '도메인명',
  csp: 'CSP',
  accountId: '계정 ID',
  environment: '환경',
};
