// 도메인 타입 정의 — PRD v8 §5, §6 기준.

export type OwnerRole = 'biz' | 'it' | 'sm' | 'server_primary' | 'server_secondary';

export const OWNER_ROLES: OwnerRole[] = [
  'biz',
  'it',
  'sm',
  'server_primary',
  'server_secondary',
];

export type AssetOwner = {
  ownerId: string;
  role: OwnerRole;
  empNo: string;
  empName: string;
  email: string;
  deptPath: string; // SSO 전체 조직 경로
  addedBy: string;
  addedAt: string;
};

export type CloudInfo = {
  csp: string;
  accountId: string;
  environment: 'Production' | 'Staging' | 'Development' | 'Test';
  dataClass: string | null;
};

export type Asset = {
  id: string;
  version: number; // 낙관적 잠금 (열람 시점 버전 비교)
  hostname: string;
  servicePurpose: string | null;
  ips: string[];
  externalAccess: 'yes' | 'no' | null;
  domain: string | null;
  os: string;
  osVersion: string;
  location: string | null;
  securitySolution: string | null;
  assetType: 'on-premise' | 'cloud' | null;
  cloud?: CloudInfo;
  owners: AssetOwner[]; // 모든 역할 합쳐서 보관
  duplicateIpTag: boolean; // IP 중복 다중 → 신규 등록 시 부여 (UI 미노출)
  qualysDetectedAt: string;
  updatedAt: string | null;
  updatedBy: string | null;
  lastModifiedFieldChangeAt: string | null; // 자산 정보 필드 마지막 변경 (식별률용)
};

export type LatestConfirmation = {
  assetId: string;
  empNo: string;
  confirmedAt: string;
};

export type NoticeResponse = {
  responseId: string;
  empNo: string;
  empName: string;
  deptPath: string;
  ownership: 'has' | 'none';
  respondedAt: string;
};

export type CurrentUser = {
  empNo: string;
  empName: string;
  email: string;
  deptName: string;
  deptPath: string;
  isInfoSecurityTeam: boolean; // 정보보호담당 소속 여부 (대시보드 접근)
};

// ── 식별률 계산 헬퍼 (PRD §5.4, §7.2) ──
export function isAssetIdentified(asset: Asset, confirmations: LatestConfirmation[]): boolean {
  const fieldChangedAt = asset.lastModifiedFieldChangeAt;

  // 자산 정보가 Qualys 탐지 이후 한 번이라도 갱신됐다면 식별 후보
  if (asset.updatedAt && new Date(asset.updatedAt) > new Date(asset.qualysDetectedAt)) {
    return true;
  }
  // 또는 어느 담당자라도 마지막 정보 변경 이후에 '최신 확인' 체크
  if (fieldChangedAt) {
    return confirmations.some(
      (c) => c.assetId === asset.id && new Date(c.confirmedAt) > new Date(fieldChangedAt),
    );
  }
  return false;
}

// ── 검색 정책 헬퍼 (PRD §4.3 F-SCH-2/3) ──
export function isSearchable(asset: Asset, currentEmpNo: string): boolean {
  // 모든 역할 비어있으면 검색 가능 (미할당 자산)
  if (asset.owners.length === 0) return true;
  // 본인이 어느 역할에라도 포함되면 검색 가능
  return asset.owners.some((o) => o.empNo === currentEmpNo);
}
