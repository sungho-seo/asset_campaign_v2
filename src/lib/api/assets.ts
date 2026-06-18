import type { Asset, OwnerRole } from '@/types/domain';
import { isSearchable } from '@/types/domain';
import { mockDb } from '@/lib/mock';
import type { SearchType } from '@/lib/mock';
import { getCurrentUser } from '@/lib/mockAuth';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export type SearchParams = {
  type: SearchType;
  query: string;
};

export type SearchResult = {
  assets: Asset[];
  total: number;
};

function matchesQuery(asset: Asset, type: SearchType, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return false;
  switch (type) {
    case 'ip':
      return asset.ips.some((ip) => ip === q.trim()); // IP 정확 일치
    case 'hostname':
      return asset.hostname.toLowerCase().includes(query);
    case 'owner':
      return asset.owners.some((o) => o.empName.toLowerCase().includes(query));
    case 'integrated':
    default:
      return (
        asset.hostname.toLowerCase().includes(query) ||
        (asset.servicePurpose?.toLowerCase().includes(query) ?? false) ||
        asset.ips.some((ip) => ip === q.trim()) ||
        asset.owners.some((o) => o.empName.toLowerCase().includes(query))
      );
  }
}

/**
 * 검색 — PRD F-3 순서 준수: ① 권한(검색 정책) 필터 → ② 검색어 필터.
 * 타인 단독 할당 자산은 권한 단계에서 제외되어 검색어와 무관하게 노출되지 않는다.
 */
export async function searchAssets({ type, query }: SearchParams): Promise<SearchResult> {
  await delay();
  const me = getCurrentUser();

  const visible = mockDb.assets.filter((a) => isSearchable(a, me.empNo));
  const matched = visible.filter((a) => matchesQuery(a, type, query));

  // 검색 시도 이벤트 기록 (대시보드 분석용 — F-SCH-10/F-AUD-3)
  mockDb.searchEvents.push({
    eventId: crypto.randomUUID(),
    searcherEmpNo: me.empNo,
    searcherName: me.empName,
    searchType: type,
    query: query.trim(),
    resultCount: matched.length,
    searchedAt: new Date().toISOString(),
  });

  return { assets: matched, total: matched.length };
}

export async function getAsset(id: string): Promise<Asset | undefined> {
  await delay(120);
  return mockDb.assets.find((a) => a.id === id);
}

// ── 자산 정보 필드 (담당자 제외) 수정 + 낙관적 잠금 ──
export type AssetFields = {
  assetType: 'on-premise' | 'cloud' | null;
  hostname: string;
  servicePurpose: string | null;
  ips: string[];
  externalAccess: 'yes' | 'no' | null;
  domain: string | null;
  os: string;
  osVersion: string;
  location: string | null;
  securitySolution: string | null;
  cloud?: Asset['cloud'];
};

export type UpdateResult =
  | { ok: true; asset: Asset }
  | { ok: false; conflict: true; current: Asset };

/**
 * 자산 정보 필드 저장. baseVersion(열람 시점 버전)과 현재 버전 비교 →
 * 불일치 시 409 충돌 시뮬레이션 (PRD §3.7, F-UPD-7).
 * confirmLatest: '최신 정보 확인' 체크박스 (식별률용).
 */
export async function updateAssetFields(
  id: string,
  fields: AssetFields,
  baseVersion: number,
  confirmLatest: boolean,
): Promise<UpdateResult> {
  await delay();
  const asset = mockDb.assets.find((a) => a.id === id);
  if (!asset) throw new Error('asset not found');

  if (asset.version !== baseVersion) {
    return { ok: false, conflict: true, current: { ...asset } };
  }

  const me = getCurrentUser();
  const now = new Date().toISOString();
  Object.assign(asset, fields);
  asset.version += 1;
  asset.updatedAt = now;
  asset.updatedBy = me.empName;
  asset.lastModifiedFieldChangeAt = now;

  if (confirmLatest) {
    recordConfirmation(id);
  }
  return { ok: true, asset: { ...asset } };
}

/** '최신 정보 확인' 체크 기록 (F-AUD-4) — 자산 필드 변경 없이 확인만 한 경우도 사용. */
export async function confirmLatestOnly(id: string): Promise<Asset> {
  await delay(150);
  recordConfirmation(id);
  const asset = mockDb.assets.find((a) => a.id === id)!;
  return { ...asset };
}

function recordConfirmation(assetId: string) {
  const me = getCurrentUser();
  mockDb.confirmations.push({ assetId, empNo: me.empNo, confirmedAt: new Date().toISOString() });
}

// ── 담당자 변경 (즉시 반영, 충돌 감지 제외 — F-UPD-8) ──
let ownerSeq = 10000;

export async function addOwner(
  assetId: string,
  role: OwnerRole,
  person: { empNo: string; empName: string; email: string; deptPath: string },
): Promise<Asset> {
  await delay(150);
  const me = getCurrentUser();
  const asset = mockDb.assets.find((a) => a.id === assetId)!;
  const now = new Date().toISOString();
  asset.owners.push({
    ownerId: `OWN-${ownerSeq++}`,
    role,
    addedBy: me.empNo,
    addedAt: now,
    ...person,
  });
  mockDb.ownerChanges.push({
    historyId: crypto.randomUUID(),
    assetId,
    hostname: asset.hostname,
    role,
    action: 'add',
    targetEmpNo: person.empNo,
    targetName: person.empName,
    actorEmpNo: me.empNo,
    actorName: me.empName,
    occurredAt: now,
  });
  return { ...asset, owners: [...asset.owners] };
}

export async function removeOwner(assetId: string, ownerId: string): Promise<Asset> {
  await delay(150);
  const me = getCurrentUser();
  const asset = mockDb.assets.find((a) => a.id === assetId)!;
  const target = asset.owners.find((o) => o.ownerId === ownerId);
  asset.owners = asset.owners.filter((o) => o.ownerId !== ownerId);
  if (target) {
    mockDb.ownerChanges.push({
      historyId: crypto.randomUUID(),
      assetId,
      hostname: asset.hostname,
      role: target.role,
      action: 'remove',
      targetEmpNo: target.empNo,
      targetName: target.empName,
      actorEmpNo: me.empNo,
      actorName: me.empName,
      occurredAt: new Date().toISOString(),
    });
  }
  return { ...asset, owners: [...asset.owners] };
}

/** [DEV] 다른 사용자가 자산을 수정한 상황 강제 트리거 — 충돌 모달 시연용 (F-4). */
export async function devBumpVersion(assetId: string): Promise<void> {
  await delay(80);
  const asset = mockDb.assets.find((a) => a.id === assetId);
  if (!asset) return;
  asset.version += 1;
  asset.os = asset.os === 'Ubuntu' ? 'Rocky Linux' : 'Ubuntu';
  asset.updatedAt = new Date().toISOString();
  asset.updatedBy = '이몽룡';
  asset.lastModifiedFieldChangeAt = asset.updatedAt;
}
