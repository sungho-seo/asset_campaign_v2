import { isAssetIdentified } from '@/types/domain';
import { mockDb } from '@/lib/mock';
import {
  CAMPAIGN,
  BASELINE,
  accessLogToday,
  updatedAssetsToday,
  progressTrend,
  dailyEditNew,
  heatmapByWeek,
  ASSET_TYPE_BASELINE,
  retiredAssets,
  ABANDONED,
  abandonedByTab,
  searchTopIp,
  searchTopHost,
  searchTopPerson,
  zeroSearches,
  dupEditSeed,
  overwriteSeed,
  ownerChangeSeed,
} from '@/lib/mockDashboard';
import type { AccessEntry, UpdatedAssetEntry, ProgressPoint } from '@/lib/mockDashboard';
import { ROLE_LABELS } from '@/lib/labels';
import { formatDateTime } from '@/lib/format';
import { useNoticeStore } from '@/stores/noticeStore';
import { BIG_ORGS, ORG_TREES, hasHundredTeam } from '@/lib/mockOrganizations';
import type { OrgNode } from '@/lib/mockOrganizations';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const isNewlyCreated = (id: string) => /^A-9\d\d$/.test(id);

function sampleStats() {
  const identified = mockDb.assets.filter((a) => isAssetIdentified(a, mockDb.confirmations)).length;
  const created = mockDb.assets.filter((a) => isNewlyCreated(a.id)).length;
  const modified = mockDb.assets.filter(
    (a) => !isNewlyCreated(a.id) && a.updatedAt !== null,
  ).length;
  return { identified, created, modified };
}

function uniqueRespondents() {
  const set = new Set(useNoticeStore.getState().responses.map((r) => r.empNo));
  return set.size;
}

export type KpiData = {
  identifiedCount: number;
  totalAssets: number;
  identifyRate: number;
  participantCount: number;
  totalEmployees: number;
  participateRate: number;
  visitorsToday: number;
  visitorsCumulative: number;
  visitorsDelta: number;
  modifiedCount: number;
  newCount: number;
  modifiedDelta: number;
  newDelta: number;
};

export async function getKpi(): Promise<KpiData> {
  await delay();
  const s = sampleStats();
  const identifiedCount = BASELINE.identifiedAssets + s.identified;
  const participantCount = BASELINE.participants + uniqueRespondents();
  const modifiedCount = BASELINE.modifiedAssets + s.modified;
  const newCount = BASELINE.newAssets + s.created;
  return {
    identifiedCount,
    totalAssets: CAMPAIGN.totalAssets,
    identifyRate: identifiedCount / CAMPAIGN.totalAssets,
    participantCount,
    totalEmployees: CAMPAIGN.totalEmployees,
    participateRate: participantCount / CAMPAIGN.totalEmployees,
    visitorsToday: BASELINE.visitorsToday,
    visitorsCumulative: BASELINE.visitorsCumulative,
    visitorsDelta: BASELINE.visitorsDeltaPrevDay,
    modifiedCount,
    newCount,
    modifiedDelta: BASELINE.modifiedDeltaPrevDay + s.modified,
    newDelta: BASELINE.newDeltaPrevDay + s.created,
  };
}

export async function getAccessLog(): Promise<AccessEntry[]> {
  await delay(150);
  return accessLogToday;
}

export async function getProgressTrend(): Promise<ProgressPoint[]> {
  await delay(150);
  return progressTrend;
}

export async function getDailyEditNew() {
  await delay(150);
  return dailyEditNew;
}

export async function getHourlyHeatmap(): Promise<number[][][]> {
  await delay(150);
  return heatmapByWeek;
}

export async function getUpdatedAssets(): Promise<UpdatedAssetEntry[]> {
  await delay(150);
  // 라이브 sample(신규/수정) 합산
  const live: UpdatedAssetEntry[] = mockDb.assets
    .filter((a) => a.updatedAt !== null)
    .map((a) => ({
      id: a.id,
      hostname: a.hostname,
      kind: isNewlyCreated(a.id) ? 'new' : 'modified',
      by: a.updatedBy ?? '-',
      at: a.updatedAt!,
      csp: a.cloud?.csp,
    }));
  return [...live, ...updatedAssetsToday];
}

// ── §7.5 IT 자산 정보 ──
const isNew = (id: string) => /^A-9\d\d$/.test(id);

export type AssetTypeSummary = {
  onprem: { total: number; modified: number; neo: number };
  cloud: { total: number; modified: number; neo: number };
  unassigned: number;
  retired: number;
  dupIpNew: number;
  dupIpUpdate: number;
};

export async function getAssetTypeSummary(): Promise<AssetTypeSummary> {
  await delay();
  const onpremSample = mockDb.assets.filter((a) => a.assetType === 'on-premise');
  const cloudSample = mockDb.assets.filter((a) => a.assetType === 'cloud');
  const b = ASSET_TYPE_BASELINE;
  return {
    onprem: {
      total: b.onprem.total + onpremSample.length,
      modified: b.onprem.modified + onpremSample.filter((a) => !isNew(a.id) && a.updatedAt).length,
      neo: b.onprem.neo + onpremSample.filter((a) => isNew(a.id)).length,
    },
    cloud: {
      total: b.cloud.total + cloudSample.length,
      modified: b.cloud.modified + cloudSample.filter((a) => !isNew(a.id) && a.updatedAt).length,
      neo: b.cloud.neo + cloudSample.filter((a) => isNew(a.id)).length,
    },
    unassigned: b.unassigned + mockDb.assets.filter((a) => a.owners.length === 0).length,
    retired: b.retired,
    dupIpNew: mockDb.dupIpNewEvents.length,
    dupIpUpdate: mockDb.dupIpUpdateEvents.length,
  };
}

export type AssetListRow = {
  id: string;
  hostname: string;
  sub?: string;
  tag?: 'modified' | 'new' | 'unassigned';
  csp?: string;
};

export async function getAssetList(
  kind: 'onprem' | 'cloud' | 'unassigned' | 'retired',
): Promise<AssetListRow[]> {
  await delay(150);
  if (kind === 'retired') {
    return retiredAssets.map((r) => ({ id: r.id, hostname: r.hostname, sub: `${r.lastOwner} · ${r.retiredAt}` }));
  }
  const pick = mockDb.assets.filter((a) => {
    if (kind === 'onprem') return a.assetType === 'on-premise';
    if (kind === 'cloud') return a.assetType === 'cloud';
    return a.owners.length === 0;
  });
  return pick.map((a) => ({
    id: a.id,
    hostname: a.hostname,
    sub: `${a.os} ${a.osVersion}${a.servicePurpose ? ' · ' + a.servicePurpose : ''}`,
    tag: kind === 'unassigned' ? 'unassigned' : isNew(a.id) ? 'new' : a.updatedAt ? 'modified' : undefined,
    csp: a.cloud?.csp,
  }));
}

// IP 중복 신규 — 신규 자산 + 동일 IP 자산 N건 아코디언
export type DupIpNewDetail = {
  id: string;
  hostname: string;
  ip: string;
  at: string;
  duplicates: { id: string; hostname: string; owners: string }[];
};
export async function getDupIpNew(): Promise<DupIpNewDetail[]> {
  await delay(150);
  return mockDb.dupIpNewEvents.map((e) => ({
    id: e.id,
    hostname: e.hostname,
    ip: e.ip,
    at: formatDateTime(e.occurredAt),
    duplicates: e.duplicateAssetIds.map((aid) => {
      const a = mockDb.assets.find((x) => x.id === aid);
      return {
        id: aid,
        hostname: a?.hostname ?? aid,
        owners: a?.owners.map((o) => o.empName).join(', ') || '-',
      };
    }),
  }));
}

export type DupIpUpdateDetail = { id: string; hostname: string; addedUser: string; at: string };
export async function getDupIpUpdate(): Promise<DupIpUpdateDetail[]> {
  await delay(150);
  return mockDb.dupIpUpdateEvents.map((e) => ({
    id: e.id,
    hostname: e.hostname,
    addedUser: e.addedUser,
    at: formatDateTime(e.occurredAt),
  }));
}

// ── §7.6 방치 자산 ──
export type AbandonedData = {
  abandoned: number;
  total: number;
  delta: number;
  tabs: typeof abandonedByTab;
};
export async function getAbandoned(): Promise<AbandonedData> {
  await delay();
  return { abandoned: ABANDONED.abandoned, total: ABANDONED.total, delta: ABANDONED.deltaPrevDay, tabs: abandonedByTab };
}

// ── §7.8 이상 징후 ──
export type AnomalyKey =
  | 'dup-edit'
  | 'overwrite'
  | 'owner-change'
  | 'dup-ip-new'
  | 'dup-ip-update'
  | 'search-top-ip'
  | 'search-top-host'
  | 'search-top-person'
  | 'zero-search';

export type AnomalySummaryItem = {
  key: AnomalyKey;
  label: string;
  count: number;
  severity: 'danger' | 'warn' | 'info';
};

export async function getAnomalySummary(): Promise<AnomalySummaryItem[]> {
  await delay();
  return [
    { key: 'dup-edit', label: '중복 수정', count: dupEditSeed.length + mockDb.conflictEvents.length, severity: 'danger' },
    { key: 'overwrite', label: '덮어쓰기 결정', count: overwriteSeed.length + mockDb.overwriteEvents.length, severity: 'warn' },
    { key: 'owner-change', label: '담당자 변경', count: ownerChangeSeed.length + mockDb.ownerChanges.length, severity: 'info' },
    { key: 'dup-ip-new', label: 'IP 중복 → 신규 등록', count: mockDb.dupIpNewEvents.length, severity: 'warn' },
    { key: 'dup-ip-update', label: 'IP 중복 → 정보 갱신', count: mockDb.dupIpUpdateEvents.length, severity: 'info' },
    { key: 'search-top-ip', label: '검색률 Top 10 (IP)', count: searchTopIp.length, severity: 'info' },
    { key: 'search-top-host', label: '검색률 Top 10 (Hostname)', count: searchTopHost.length, severity: 'info' },
    { key: 'search-top-person', label: '검색률 Top 10 (사람)', count: searchTopPerson.length, severity: 'info' },
    { key: 'zero-search', label: '검색 0건 패턴', count: zeroSearches.length, severity: 'warn' },
  ];
}

export type AnomalyDetail = { columns: string[]; rows: string[][] };

export async function getAnomalyDetail(key: AnomalyKey): Promise<AnomalyDetail> {
  await delay(150);
  switch (key) {
    case 'dup-edit':
      return {
        columns: ['자산', '충돌 사용자 A', '충돌 사용자 B', '마지막 충돌'],
        rows: [
          ...dupEditSeed.map((e) => [e.hostname, e.userA, e.userB, formatDateTime(e.occurredAt)]),
          ...mockDb.conflictEvents.map((e) => [e.hostname, e.userA, e.userB, formatDateTime(e.occurredAt)]),
        ],
      };
    case 'overwrite':
      return {
        columns: ['자산', '덮어쓴 사용자', '이전 사용자', '시점'],
        rows: [
          ...overwriteSeed.map((e) => [e.hostname, e.overwroteBy, e.previousBy, formatDateTime(e.occurredAt)]),
          ...mockDb.overwriteEvents.map((e) => [e.hostname, e.overwroteBy, e.previousBy, formatDateTime(e.occurredAt)]),
        ],
      };
    case 'owner-change':
      return {
        columns: ['자산', '행위자', '추가/삭제', '대상자', '역할', '시점'],
        rows: [
          ...ownerChangeSeed.map((e) => [e.hostname, e.actor, e.action === 'add' ? '추가' : '삭제', e.target, e.role, formatDateTime(e.occurredAt)]),
          ...mockDb.ownerChanges.map((e) => [
            e.hostname, e.actorName, e.action === 'add' ? '추가' : '삭제', e.targetName, ROLE_LABELS[e.role], formatDateTime(e.occurredAt),
          ]),
        ],
      };
    case 'dup-ip-update':
      return {
        columns: ['갱신 자산', '현업 추가된 사용자', '시점'],
        rows: mockDb.dupIpUpdateEvents.map((e) => [e.hostname, e.addedUser, formatDateTime(e.occurredAt)]),
      };
    case 'search-top-ip':
      return { columns: ['IP', '검색 시도', '검색자 수'], rows: searchTopIp.map((r) => [r.key, String(r.attempts), String(r.searchers)]) };
    case 'search-top-host':
      return { columns: ['Hostname', '검색 시도', '검색자 수'], rows: searchTopHost.map((r) => [r.key, String(r.attempts), String(r.searchers)]) };
    case 'search-top-person':
      return { columns: ['담당자', '검색 시도', '검색자 수'], rows: searchTopPerson.map((r) => [r.key, String(r.attempts), String(r.searchers)]) };
    case 'zero-search':
      return {
        columns: ['검색어', '검색자', '시점', '신규 등록'],
        rows: zeroSearches.map((z) => [z.query, z.searcher, formatDateTime(z.at), z.proceeded ? '진행' : '미진행']),
      };
    default:
      return { columns: [], rows: [] };
  }
}

// ── §7.7 조직별 참여율 ──
export type OrgCard = {
  id: string;
  name: string;
  participateRate: number;
  identifyRate: number | null;
  members: number;
  assets: number;
  hasHundredTeam: boolean;
};

export async function getOrganizations(): Promise<OrgCard[]> {
  await delay();
  return BIG_ORGS.map((name) => {
    const node = ORG_TREES[name]!;
    const s = node.stats;
    return {
      id: node.id,
      name: node.name,
      participateRate: s.totalMembers ? s.participated / s.totalMembers : 0,
      identifyRate: s.assetCount ? s.identifiedAssets / s.assetCount : null,
      members: s.totalMembers,
      assets: s.assetCount,
      hasHundredTeam: hasHundredTeam(node),
    };
  });
}

export async function getOrgTree(id: string): Promise<OrgNode | undefined> {
  await delay(150);
  return ORG_TREES[id];
}
