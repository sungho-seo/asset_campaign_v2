import type { Asset } from '@/types/domain';
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
