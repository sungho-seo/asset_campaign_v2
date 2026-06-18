import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info } from 'lucide-react';
import { Panel } from '@/components/layout/Panel';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ScopeCards } from '@/components/notice/ScopeCards';
import { useNoticeStore } from '@/stores/noticeStore';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/cn';

type Ownership = 'has' | 'none';

/** 안내 페이지 (PRD §4.2). 권고 아닌 안내 톤, 체크박스 없이 보유 여부 라디오만. */
export default function NoticePage() {
  const navigate = useNavigate();
  const respond = useNoticeStore((s) => s.respond);
  const latest = useNoticeStore((s) => s.latestForCurrentUser());
  const [choice, setChoice] = useState<Ownership | null>(latest?.ownership ?? null);

  const submit = () => {
    if (!choice) return;
    respond(choice);
    if (choice === 'has') navigate('/search');
    else navigate('/notice/done');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-6 py-8">
      <div className="rounded-card border border-lgred-100 bg-pink-soft/60 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-lgred-700">
          <Info size={16} />
          IT 자산 등록 캠페인 안내
        </div>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">
          사내 IT 자산의 담당자·정보를 최신 상태로 유지하기 위한 캠페인입니다. 본인이 사용·관리하는
          자산이 있다면 정보를 확인해 주세요. 보유한 자산이 없더라도 응답만 남겨 주시면 됩니다.
        </p>
      </div>

      {latest && (
        <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-600">
          <span className="text-neutral-400">최근 응답:</span>
          <span className="font-medium text-neutral-800">{formatDateTime(latest.respondedAt)}</span>
          <span className="text-neutral-300">·</span>
          <Badge variant={latest.ownership === 'has' ? 'mine' : 'assigned'}>
            보유 {latest.ownership === 'has' ? '있음' : '없음'}
          </Badge>
        </div>
      )}

      <ScopeCards />

      <Panel title="본인이 사용·관리하는 자산 보유 여부">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { value: 'has', label: '보유 있음', desc: '검색·등록 화면으로 이동합니다.' },
              { value: 'none', label: '보유 없음', desc: '응답만 기록하고 완료합니다.' },
            ] as const
          ).map((opt) => {
            const active = choice === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setChoice(opt.value)}
                className={cn(
                  'flex items-start gap-3 rounded-card border p-4 text-left transition-colors',
                  active
                    ? 'border-lgred bg-pink-soft/50 ring-1 ring-lgred'
                    : 'border-neutral-200 hover:border-neutral-300',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    active ? 'border-lgred' : 'border-neutral-300',
                  )}
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-lgred" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-neutral-900">{opt.label}</span>
                  <span className="block text-xs text-neutral-500">{opt.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="primary" disabled={!choice} onClick={submit}>
            확인 완료
          </Button>
        </div>
      </Panel>
    </div>
  );
}
