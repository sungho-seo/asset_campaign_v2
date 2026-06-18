import type { Asset, AssetOwner, OwnerRole, LatestConfirmation } from '@/types/domain';
import { mockCurrentUser } from './mockAuth';

const ME = mockCurrentUser;

let ownerSeq = 1;
function owner(
  role: OwnerRole,
  p: { empNo: string; empName: string; email: string; deptPath: string },
  addedBy = 'SYSTEM',
  addedAt = '2026-06-10T09:00:00+09:00',
): AssetOwner {
  return { ownerId: `OWN-${ownerSeq++}`, role, addedBy, addedAt, ...p };
}

// 타인 인물 풀
const P = {
  lee: { empNo: 'E20180012', empName: '이몽룡', email: 'mr.lee@lge.com', deptPath: 'CTO부문 > 클라우드플랫폼담당 > 인프라운영팀' },
  kim: { empNo: 'E20190044', empName: '김춘향', email: 'ch.kim@lge.com', deptPath: 'CTO부문 > 클라우드플랫폼담당 > SM팀' },
  park: { empNo: 'E20170003', empName: '박문수', email: 'ms.park@lge.com', deptPath: 'HS사업본부 > H&A연구소 > 제어연구팀' },
  choi: { empNo: 'E20200021', empName: '최영실', email: 'ys.choi@lge.com', deptPath: 'VS사업본부 > VS연구소 > 플랫폼개발팀' },
  jung: { empNo: 'E20160009', empName: '정약용', email: 'yy.jung@lge.com', deptPath: 'CSO부문 > 보안담당 > 보안운영팀' },
  yoon: { empNo: 'E20210077', empName: '윤서연', email: 'sy.yoon@lge.com', deptPath: 'ES사업본부 > ES연구소 > 시스템개발팀' },
} as const;

const me = (role: OwnerRole, addedAt = '2026-06-12T10:00:00+09:00') =>
  owner(role, { empNo: ME.empNo, empName: ME.empName, email: ME.email, deptPath: ME.deptPath }, ME.empNo, addedAt);

// ── 자산 시드 ──
function seedAssets(): Asset[] {
  return [
    // ① 본인이 포함된 자산 5건
    {
      id: 'A-001', version: 3, hostname: 'visz-web-01', servicePurpose: '정보보호 가시화 포털',
      ips: ['10.20.30.40'], externalAccess: 'no', domain: 'visz.lge.com',
      os: 'Rocky Linux', osVersion: '9.3', location: '가산 R&D 5F', securitySolution: 'EDR',
      assetType: 'on-premise', owners: [me('biz'), owner('it', P.lee)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: '2026-06-14T14:20:00+09:00', updatedBy: '서성호',
      lastModifiedFieldChangeAt: '2026-06-14T14:20:00+09:00',
    },
    {
      id: 'A-002', version: 1, hostname: 'visz-batch-02', servicePurpose: '식별률 집계 배치',
      ips: ['10.20.30.41'], externalAccess: 'no', domain: null,
      os: 'Ubuntu', osVersion: '22.04', location: '가산 R&D 5F', securitySolution: 'V3',
      assetType: 'on-premise', owners: [me('biz'), me('server_primary'), owner('sm', P.kim)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-01T00:00:00+09:00',
    },
    {
      id: 'A-003', version: 5, hostname: 'visz-cloud-dw', servicePurpose: '데이터 웨어하우스',
      ips: ['172.16.8.10'], externalAccess: 'yes', domain: 'dw.visz.lge.com',
      os: 'Amazon Linux', osVersion: '2023', location: 'AWS ap-northeast-2', securitySolution: 'CrowdStrike',
      assetType: 'cloud',
      cloud: { csp: 'AWS', accountId: '987654321012', environment: 'Production', dataClass: '내부용' },
      owners: [me('it'), owner('server_primary', P.jung), owner('server_secondary', P.yoon)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-02T00:00:00+09:00',
      updatedAt: '2026-06-15T09:30:00+09:00', updatedBy: '서성호',
      lastModifiedFieldChangeAt: '2026-06-15T09:30:00+09:00',
    },
    {
      id: 'A-004', version: 2, hostname: 'dev-nb-seo', servicePurpose: '개발용 노트북',
      ips: ['10.50.12.7'], externalAccess: 'no', domain: null,
      os: 'Windows', osVersion: '11 Pro', location: '가산 R&D 5F', securitySolution: 'Defender',
      assetType: 'on-premise', owners: [me('biz')],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: '2026-06-13T11:00:00+09:00', updatedBy: '서성호',
      lastModifiedFieldChangeAt: '2026-06-01T00:00:00+09:00', // 갱신했지만 이후 필드 재변경된 케이스(확인 필요)
    },
    {
      id: 'A-005', version: 4, hostname: 'visz-monitor', servicePurpose: '모니터링 스택(Grafana)',
      ips: ['10.20.30.55', '10.20.30.56'], externalAccess: 'no', domain: 'mon.visz.lge.com',
      os: 'Rocky Linux', osVersion: '9.2', location: '가산 R&D 5F', securitySolution: 'EDR',
      assetType: 'on-premise',
      owners: [
        me('sm'), owner('biz', P.kim), owner('biz', P.lee), owner('biz', P.choi),
        owner('it', P.lee), owner('server_primary', P.jung),
      ],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-01T00:00:00+09:00',
    },

    // ② 모든 역할 비어있는 자산 3건 (미할당)
    {
      id: 'A-101', version: 1, hostname: 'unknown-srv-77', servicePurpose: null,
      ips: ['10.99.0.77'], externalAccess: null, domain: null,
      os: 'CentOS', osVersion: '7.9', location: null, securitySolution: null,
      assetType: 'on-premise', owners: [],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-01T00:00:00+09:00',
    },
    {
      id: 'A-102', version: 1, hostname: 'unknown-srv-88', servicePurpose: null,
      ips: ['10.99.0.88'], externalAccess: null, domain: null,
      os: 'Ubuntu', osVersion: '20.04', location: null, securitySolution: null,
      assetType: 'on-premise', owners: [],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-01T00:00:00+09:00',
    },
    {
      id: 'A-103', version: 1, hostname: 'orphan-cloud-vm', servicePurpose: null,
      ips: ['172.16.9.200'], externalAccess: null, domain: null,
      os: 'Amazon Linux', osVersion: '2', location: 'AWS ap-northeast-2', securitySolution: null,
      assetType: 'cloud',
      cloud: { csp: 'AWS', accountId: '111122223333', environment: 'Development', dataClass: null },
      owners: [],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-01T00:00:00+09:00',
    },

    // ③ 타인 단독 할당 자산 8건 (검색 결과에서 제외되어야 함)
    {
      id: 'A-201', version: 2, hostname: 'ha-ctrl-01', servicePurpose: '제어 시스템',
      ips: ['1.1.1.1'], externalAccess: 'no', domain: null, // 단일 IP 중복 시연용
      os: 'RHEL', osVersion: '8.8', location: '평택 1공장', securitySolution: 'V3',
      assetType: 'on-premise', owners: [owner('biz', P.park), owner('server_primary', P.park)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: '2026-06-11T16:00:00+09:00', updatedBy: '박문수',
      lastModifiedFieldChangeAt: '2026-06-11T16:00:00+09:00',
    },
    {
      id: 'A-202', version: 1, hostname: 'vs-platform-a', servicePurpose: 'VS 플랫폼 A',
      ips: ['2.2.2.2'], externalAccess: 'yes', domain: 'vsa.lge.com', // 다중 IP 중복 시연용 (1/2)
      os: 'Ubuntu', osVersion: '22.04', location: '인천 VS연구소', securitySolution: 'EDR',
      assetType: 'on-premise', owners: [owner('biz', P.choi)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-01T00:00:00+09:00',
    },
    {
      id: 'A-203', version: 1, hostname: 'vs-platform-b', servicePurpose: 'VS 플랫폼 B',
      ips: ['2.2.2.2'], externalAccess: 'yes', domain: 'vsb.lge.com', // 다중 IP 중복 시연용 (2/2)
      os: 'Ubuntu', osVersion: '22.04', location: '인천 VS연구소', securitySolution: 'EDR',
      assetType: 'on-premise', owners: [owner('biz', P.yoon)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-01T00:00:00+09:00',
    },
    {
      id: 'A-204', version: 3, hostname: 'es-sys-dev-01', servicePurpose: 'ES 시스템 개발',
      ips: ['10.70.1.10'], externalAccess: 'no', domain: null,
      os: 'Rocky Linux', osVersion: '9.3', location: '창원 ES연구소', securitySolution: 'EDR',
      assetType: 'on-premise', owners: [owner('biz', P.yoon), owner('it', P.lee), owner('sm', P.kim)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: '2026-06-15T13:00:00+09:00', updatedBy: '윤서연',
      lastModifiedFieldChangeAt: '2026-06-15T13:00:00+09:00',
    },
    {
      id: 'A-205', version: 2, hostname: 'sec-siem-01', servicePurpose: 'SIEM',
      ips: ['10.80.0.5'], externalAccess: 'no', domain: 'siem.lge.com',
      os: 'RHEL', osVersion: '9.2', location: '가산 보안센터', securitySolution: 'CrowdStrike',
      assetType: 'on-premise', owners: [owner('biz', P.jung), owner('server_primary', P.jung), owner('server_secondary', P.yoon)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: '2026-06-10T10:00:00+09:00', updatedBy: '정약용',
      lastModifiedFieldChangeAt: '2026-06-10T10:00:00+09:00',
    },
    {
      id: 'A-206', version: 1, hostname: 'cs-gcp-api', servicePurpose: 'CS API 게이트웨이',
      ips: ['172.20.5.30'], externalAccess: 'yes', domain: 'api.cs.lge.com',
      os: 'Ubuntu', osVersion: '24.04', location: 'GCP asia-northeast3', securitySolution: 'EDR',
      assetType: 'cloud',
      cloud: { csp: 'GCP', accountId: 'cs-prod-3920', environment: 'Production', dataClass: '개인정보' },
      owners: [owner('biz', P.choi), owner('it', P.kim)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-02T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-02T00:00:00+09:00',
    },
    {
      id: 'A-207', version: 1, hostname: 'ms-azure-db', servicePurpose: 'MS사업 DB',
      ips: ['172.21.3.12'], externalAccess: 'no', domain: null,
      os: 'Windows Server', osVersion: '2022', location: 'Azure koreacentral', securitySolution: 'Defender',
      assetType: 'cloud',
      cloud: { csp: 'Azure', accountId: 'sub-ms-0011', environment: 'Staging', dataClass: '기밀' },
      owners: [owner('server_primary', P.park)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-02T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-02T00:00:00+09:00',
    },
    {
      id: 'A-208', version: 1, hostname: 'kr-sales-portal', servicePurpose: '한국영업 포털',
      ips: ['10.60.2.20'], externalAccess: 'yes', domain: 'sales.lge.com',
      os: 'Rocky Linux', osVersion: '8.9', location: '여의도 본사', securitySolution: 'V3',
      assetType: 'on-premise', owners: [owner('biz', P.park), owner('sm', P.kim)],
      duplicateIpTag: false, qualysDetectedAt: '2026-06-01T00:00:00+09:00',
      updatedAt: null, updatedBy: null, lastModifiedFieldChangeAt: '2026-06-01T00:00:00+09:00',
    },
  ];
}

export type SearchType = 'integrated' | 'ip' | 'hostname' | 'owner';

export type SearchEvent = {
  eventId: string;
  searcherEmpNo: string;
  searcherName: string;
  searchType: SearchType;
  query: string;
  resultCount: number;
  searchedAt: string;
};

export type OwnerChangeEvent = {
  historyId: string;
  assetId: string;
  hostname: string;
  role: OwnerRole;
  action: 'add' | 'remove';
  targetEmpNo: string;
  targetName: string;
  actorEmpNo: string;
  actorName: string;
  occurredAt: string;
};

// ── 인메모리 mock DB (모듈 싱글톤). 임직원 화면 + 대시보드가 공유. ──
export const mockDb = {
  assets: seedAssets(),
  confirmations: [
    // 본인이 A-003을 마지막 필드 변경 이후 확인한 케이스(식별 완료)
    { assetId: 'A-003', empNo: ME.empNo, confirmedAt: '2026-06-15T09:31:00+09:00' },
  ] as LatestConfirmation[],
  searchEvents: [] as SearchEvent[],
  ownerChanges: [] as OwnerChangeEvent[],
};

export function findAssetsByIp(ip: string): Asset[] {
  return mockDb.assets.filter((a) => a.ips.includes(ip));
}
