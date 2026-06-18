import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { Tabs } from '@/components/layout/Tabs';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { IpMaskInput } from '@/components/search/IpMaskInput';
import { AssetResultRow } from '@/components/search/AssetResultRow';
import { searchAssets } from '@/lib/api/assets';
import type { SearchType } from '@/lib/mock';
import { isValidIPv4, joinIpParts } from '@/lib/validation';
import { getCurrentUser } from '@/lib/mockAuth';
import type { Asset } from '@/types/domain';
import { AssetDrawer } from '@/components/asset/AssetDrawer';

const TABS: { value: SearchType; label: string }[] = [
  { value: 'integrated', label: '통합' },
  { value: 'ip', label: 'IP' },
  { value: 'hostname', label: '자산명' },
  { value: 'owner', label: '담당자' },
];

const PAGE_SIZE = 8;

export default function SearchPage() {
  const me = getCurrentUser();
  const [tab, setTab] = useState<SearchType>('integrated');
  const [text, setText] = useState('');
  const [ipParts, setIpParts] = useState<[string, string, string, string]>(['', '', '', '']);
  const [ownerName, setOwnerName] = useState(me.empName);
  const [submitted, setSubmitted] = useState<{ type: SearchType; query: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // 사이드 패널(편집/신규) — Phase 5/6
  const [selected, setSelected] = useState<Asset | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [prefill, setPrefill] = useState('');

  const { data, isFetching } = useQuery({
    queryKey: ['search', submitted?.type, submitted?.query],
    queryFn: () => searchAssets(submitted!),
    enabled: !!submitted,
  });

  const runSearch = () => {
    setError(null);
    setPage(1);
    if (tab === 'ip') {
      const ip = joinIpParts(ipParts);
      if (!isValidIPv4(ip)) {
        setError('정확한 IPv4 주소를 입력해 주세요 (예: 10.20.30.40).');
        return;
      }
      setSubmitted({ type: 'ip', query: ip });
      return;
    }
    const q = tab === 'owner' ? ownerName : text;
    if (q.trim().length < 2) {
      setError('검색어를 2자 이상 입력해 주세요.');
      return;
    }
    setSubmitted({ type: tab, query: q.trim() });
  };

  const onTabChange = (t: SearchType) => {
    setTab(t);
    setSubmitted(null);
    setError(null);
  };

  const results = data?.assets ?? [];
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const paged = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openNew = () => {
    const seed =
      submitted?.type === 'ip'
        ? submitted.query
        : submitted?.type === 'hostname'
          ? submitted.query
          : '';
    setPrefill(seed);
    setNewOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-6 py-8">
      <div className="rounded-card border border-lgred-100 bg-pink-soft/60 px-5 py-4">
        <h1 className="text-base font-semibold text-lgred-700">IT 자산 정보를 확인해 주세요</h1>
        <p className="mt-1 text-sm text-neutral-600">
          본인이 담당자로 포함된 자산과 담당자가 지정되지 않은 자산만 검색됩니다.
        </p>
      </div>

      <div className="rounded-card border border-neutral-200 bg-white p-4">
        <Tabs items={TABS} value={tab} onChange={onTabChange} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tab === 'ip' ? (
            <IpMaskInput parts={ipParts} onChange={setIpParts} invalid={!!error} />
          ) : tab === 'owner' ? (
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="담당자 이름"
              className="max-w-xs"
              invalid={!!error}
            />
          ) : (
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder={tab === 'hostname' ? '자산명(Hostname)' : 'IP · 자산명 · 담당자 통합 검색'}
              className="max-w-md"
              invalid={!!error}
            />
          )}
          <Button variant="primary" onClick={runSearch}>
            <Search size={16} /> 검색
          </Button>
        </div>
        {error && (
          <p className="mt-2 flex items-center gap-1 text-xs text-danger">
            <AlertCircle size={13} /> {error}
          </p>
        )}
      </div>

      {/* 결과 */}
      {submitted && !isFetching && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              검색 결과 <span className="font-semibold text-neutral-900">{results.length}</span>건
            </p>
            <Button variant={results.length === 0 ? 'primary' : 'default'} onClick={openNew}>
              <Plus size={16} /> 신규 등록
            </Button>
          </div>

          {results.length === 0 ? (
            <div className="rounded-card border border-dashed border-neutral-300 bg-white py-12 text-center">
              <p className="text-sm text-neutral-500">검색 결과가 없습니다.</p>
              <p className="mt-1 text-xs text-neutral-400">
                담당하는 자산이 검색되지 않으면 신규로 등록할 수 있습니다.
              </p>
            </div>
          ) : (
            <>
              {paged.map((a) => (
                <AssetResultRow key={a.id} asset={a} onClick={setSelected} />
              ))}
              {pageCount > 1 && (
                <div className="flex items-center justify-center gap-1 pt-2">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={
                        p === page
                          ? 'h-8 w-8 rounded-md bg-lgred text-sm font-medium text-white'
                          : 'h-8 w-8 rounded-md text-sm text-neutral-600 hover:bg-neutral-100'
                      }
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isFetching && <p className="py-8 text-center text-sm text-neutral-400">검색 중…</p>}

      {/* 편집 사이드 패널 (Phase 5) */}
      <AssetDrawer
        assetId={selected?.id ?? null}
        open={!!selected}
        onClose={() => setSelected(null)}
      />

      {/* 신규 등록 (Phase 6) */}
      <AssetDrawer
        mode="new"
        prefillQuery={prefill}
        open={newOpen}
        onClose={() => setNewOpen(false)}
      />
    </div>
  );
}
