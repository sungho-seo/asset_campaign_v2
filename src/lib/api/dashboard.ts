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
  dupEditSeed,
  overwriteSeed,
  ownerChangeSeed,
  dupIpNewSeed,
  dupIpUpdateSeed,
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

const teamOf = (deptPath: string) => deptPath.split('>').pop()?.trim() ?? '—';

// 알려진 mock 인물 → 팀 (라이브 이벤트 표기용)
const NAME_TEAM: Record<string, string> = {
  서성호: '정보보호가시화팀',
  박문수: '제어연구팀',
  김춘향: 'SM팀',
  이몽룡: '인프라운영팀',
  최영실: '플랫폼개발팀',
  정약용: '보안운영팀',
  윤서연: '시스템개발팀',
};
const teamOfName = (name: string) => NAME_TEAM[name] ?? '—';

export type AssetListRow = {
  id: string;
  ip: string;
  hostname: string;
  detail: string;
  tag?: 'modified' | 'new' | 'unassigned';
  csp?: string;
  ownerName?: string;
  ownerTeam?: string;
};

export async function getAssetList(
  kind: 'onprem' | 'cloud' | 'unassigned',
): Promise<AssetListRow[]> {
  await delay(150);
  const pick = mockDb.assets.filter((a) => {
    if (kind === 'onprem') return a.assetType === 'on-premise';
    if (kind === 'cloud') return a.assetType === 'cloud';
    return a.owners.length === 0;
  });
  return pick.map((a) => {
    const biz = a.owners.find((o) => o.role === 'biz') ?? a.owners[0];
    return {
      id: a.id,
      ip: a.ips.join(', '),
      hostname: a.hostname,
      detail: `${a.os} ${a.osVersion}${a.servicePurpose ? ' · ' + a.servicePurpose : ''}`,
      tag: kind === 'unassigned' ? 'unassigned' : isNew(a.id) ? 'new' : a.updatedAt ? 'modified' : undefined,
      csp: a.cloud?.csp,
      ownerName: biz?.empName,
      ownerTeam: biz ? teamOf(biz.deptPath) : undefined,
    };
  });
}

export async function getRetiredAssets() {
  await delay(150);
  return retiredAssets;
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
  | 'search-top-person';

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
    { key: 'dup-ip-new', label: 'IP 중복 → 신규 등록', count: dupIpNewSeed.length + mockDb.dupIpNewEvents.length, severity: 'warn' },
    { key: 'dup-ip-update', label: 'IP 중복 → 정보 갱신', count: dupIpUpdateSeed.length + mockDb.dupIpUpdateEvents.length, severity: 'info' },
    { key: 'search-top-ip', label: '검색률 Top 100 (IP)', count: searchTopIp.length, severity: 'info' },
    { key: 'search-top-host', label: '검색률 Top 100 (Hostname)', count: searchTopHost.length, severity: 'info' },
    { key: 'search-top-person', label: '검색률 Top 100 (사람)', count: searchTopPerson.length, severity: 'info' },
  ];
}

export type IncUser = { name: string; team: string };
export type IncidentRow = {
  id: string;
  ip?: string;
  host?: string;
  when?: string;
  users?: IncUser[]; // dup-edit [A,B]
  who?: IncUser; // overwrite / owner-change 행위자
  prev?: IncUser; // overwrite 이전 사용자
  target?: IncUser; // owner-change 대상자
  action?: string;
  role?: string;
  added?: IncUser; // dup-ip-update
  duplicates?: { ip: string; host: string; owner: string }[]; // dup-ip-new
  rank?: number; // search-top
  label?: string;
  attempts?: number;
  searchers?: number;
};
export type AnomalyDetail = {
  key: AnomalyKey;
  desc: string;
  stats: { label: string; value: string }[];
  rows: IncidentRow[];
  csvHeaders: string[];
  csvRows: string[][];
};

function timeStats(times: string[]) {
  const sorted = [...times].filter(Boolean).sort();
  const first = sorted[0] ? formatDateTime(sorted[0]) : '-';
  const lastDay = sorted.at(-1)?.slice(0, 10);
  const recent = times.filter((t) => t.slice(0, 10) === lastDay).length;
  return { first, recent };
}

function eventStats(count: number, times: string[]): { label: string; value: string }[] {
  const { first, recent } = timeStats(times);
  return [
    { label: '발생 건수', value: `${count}건` },
    { label: '최근 24h', value: `+${recent}건` },
    { label: '최초 발생', value: first },
  ];
}

const ipOf = (assetId: string) => mockDb.assets.find((a) => a.id === assetId)?.ips.join(', ') ?? '-';

export async function getAnomalyDetail(key: AnomalyKey): Promise<AnomalyDetail> {
  await delay(150);

  switch (key) {
    case 'dup-edit': {
      const rows: IncidentRow[] = [
        ...dupEditSeed.map((e) => ({
          id: e.id, ip: e.ip, host: e.hostname, when: formatDateTime(e.occurredAt),
          users: [{ name: e.userA, team: e.teamA }, { name: e.userB, team: e.teamB }],
        })),
        ...mockDb.conflictEvents.map((e) => ({
          id: e.id, ip: ipOf(e.assetId), host: e.hostname, when: formatDateTime(e.occurredAt),
          users: [{ name: e.userA, team: teamOfName(e.userA) }, { name: e.userB, team: teamOfName(e.userB) }],
        })),
      ];
      const times = [...dupEditSeed, ...mockDb.conflictEvents].map((e) => e.occurredAt);
      return {
        key, desc: '동일 자산을 2명 이상이 수정한 케이스. 마지막 저장이 반영되며 이전 입력은 변경 이력에 보존됩니다.',
        stats: eventStats(rows.length, times), rows,
        csvHeaders: ['IP', '자산명', '충돌 담당자 A', '충돌 담당자 B', '마지막 충돌'],
        csvRows: rows.map((r) => [r.ip!, r.host!, r.users![0]!.name, r.users![1]!.name, r.when!]),
      };
    }
    case 'overwrite': {
      const rows: IncidentRow[] = [
        ...overwriteSeed.map((e) => ({
          id: e.id, ip: e.ip, host: e.hostname, when: formatDateTime(e.occurredAt),
          who: { name: e.overwroteBy, team: e.overwroteTeam }, prev: { name: e.previousBy, team: e.previousTeam },
        })),
        ...mockDb.overwriteEvents.map((e) => ({
          id: e.id, ip: ipOf(e.assetId), host: e.hostname, when: formatDateTime(e.occurredAt),
          who: { name: e.overwroteBy, team: teamOfName(e.overwroteBy) },
          prev: { name: e.previousBy, team: teamOfName(e.previousBy) },
        })),
      ];
      const times = [...overwriteSeed, ...mockDb.overwriteEvents].map((e) => e.occurredAt);
      return {
        key, desc: '동시 수정 알림 후 "내 변경으로 덮어쓰기"를 선택한 케이스. 이전 사용자의 입력은 변경 이력에서 확인 가능합니다.',
        stats: eventStats(rows.length, times), rows,
        csvHeaders: ['IP', '자산명', '덮어쓴 담당자', '기존 담당자', '일시'],
        csvRows: rows.map((r) => [r.ip!, r.host!, r.who!.name, r.prev!.name, r.when!]),
      };
    }
    case 'owner-change': {
      const rows: IncidentRow[] = [
        ...ownerChangeSeed.map((e) => ({
          id: e.id, ip: e.ip, host: e.hostname, when: formatDateTime(e.occurredAt),
          who: { name: e.actor, team: e.actorTeam }, action: e.action === 'add' ? '추가' : '삭제',
          target: { name: e.target, team: e.targetTeam }, role: e.role,
        })),
        ...mockDb.ownerChanges.map((e) => ({
          id: e.historyId, ip: ipOf(e.assetId), host: e.hostname, when: formatDateTime(e.occurredAt),
          who: { name: e.actorName, team: teamOfName(e.actorName) }, action: e.action === 'add' ? '추가' : '삭제',
          target: { name: e.targetName, team: teamOfName(e.targetName) }, role: ROLE_LABELS[e.role],
        })),
      ];
      const times = [...ownerChangeSeed, ...mockDb.ownerChanges].map((e) => e.occurredAt);
      return {
        key, desc: '담당자 추가/삭제 이력. 자기 자신 대량 추가나 타인 무단 삭제 패턴을 추적합니다.',
        stats: eventStats(rows.length, times), rows,
        csvHeaders: ['IP', '자산명', '행위자', '추가/삭제', '대상자', '역할', '일시'],
        csvRows: rows.map((r) => [r.ip!, r.host!, r.who!.name, r.action!, r.target!.name, r.role!, r.when!]),
      };
    }
    case 'dup-ip-new': {
      const rows: IncidentRow[] = [
        ...dupIpNewSeed.map((e) => ({
          id: e.id, ip: e.ip, host: e.hostname, when: formatDateTime(e.occurredAt), duplicates: e.duplicates,
        })),
        ...mockDb.dupIpNewEvents.map((e) => ({
          id: e.id, ip: e.ip, host: e.hostname, when: formatDateTime(e.occurredAt),
          duplicates: e.duplicateAssetIds.map((aid) => {
            const a = mockDb.assets.find((x) => x.id === aid);
            return { ip: a?.ips.join(', ') ?? e.ip, host: a?.hostname ?? aid, owner: a?.owners.map((o) => o.empName).join(', ') || '-' };
          }),
        })),
      ];
      const times = [...dupIpNewSeed, ...mockDb.dupIpNewEvents].map((e) => e.occurredAt);
      return {
        key, desc: '동일 IP 자산이 2건 이상 존재하는 상태에서 신규 등록된 자산. 동일 IP 자산 목록을 함께 확인하세요.',
        stats: eventStats(rows.length, times), rows,
        csvHeaders: ['신규 IP', '신규 자산명', '동일 IP 자산', '일시'],
        csvRows: rows.map((r) => [r.ip!, r.host!, r.duplicates!.map((d) => d.host).join(' / '), r.when!]),
      };
    }
    case 'dup-ip-update': {
      const rows: IncidentRow[] = [
        ...dupIpUpdateSeed.map((e) => ({
          id: e.id, ip: e.ip, host: e.hostname, when: formatDateTime(e.occurredAt),
          added: { name: e.addedUser, team: e.addedTeam },
        })),
        ...mockDb.dupIpUpdateEvents.map((e) => ({
          id: e.id, ip: ipOf(e.assetId), host: e.hostname, when: formatDateTime(e.occurredAt),
          added: { name: e.addedUser, team: teamOfName(e.addedUser) },
        })),
      ];
      const times = [...dupIpUpdateSeed, ...mockDb.dupIpUpdateEvents].map((e) => e.occurredAt);
      return {
        key, desc: '단일 IP 중복 발견 시 기존 자산의 현업 담당자로 본인이 추가된 케이스.',
        stats: eventStats(rows.length, times), rows,
        csvHeaders: ['IP', '갱신 자산명', '추가된 현업 담당자', '일시'],
        csvRows: rows.map((r) => [r.ip!, r.host!, r.added!.name, r.when!]),
      };
    }
    case 'search-top-ip':
    case 'search-top-host':
    case 'search-top-person': {
      const src = key === 'search-top-ip' ? searchTopIp : key === 'search-top-host' ? searchTopHost : searchTopPerson;
      const targetLabel = key === 'search-top-ip' ? 'IP' : key === 'search-top-host' ? 'Hostname' : '담당자';
      const rows: IncidentRow[] = src.map((r, i) => ({ id: `${key}-${i}`, rank: i + 1, label: r.key, attempts: r.attempts, searchers: r.searchers }));
      return {
        key, desc: `검색 시도가 많은 ${targetLabel} 상위 100. 많은 사람이 찾는 자산일수록 등록 우선순위가 높습니다.`,
        stats: [
          { label: '대상 수', value: `${rows.length}개` },
          { label: '최다 시도', value: `${Math.max(...src.map((r) => r.attempts), 0)}회` },
          { label: '누적 시도', value: `${src.reduce((s, r) => s + r.attempts, 0)}회` },
        ],
        rows,
        csvHeaders: ['순위', targetLabel, '검색 시도', '검색자 수'],
        csvRows: rows.map((r) => [String(r.rank), r.label!, String(r.attempts), String(r.searchers)]),
      };
    }
    default:
      return { key, desc: '', stats: [], rows: [], csvHeaders: [], csvRows: [] };
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
