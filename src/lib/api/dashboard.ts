import { isAssetIdentified } from '@/types/domain';
import { mockDb } from '@/lib/mock';
import { CAMPAIGN, BASELINE, accessLogToday, updatedAssetsToday } from '@/lib/mockDashboard';
import type { AccessEntry, UpdatedAssetEntry } from '@/lib/mockDashboard';
import { useNoticeStore } from '@/stores/noticeStore';

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
