import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, History, Sparkles } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Button } from '@/components/common/Button';
import { ToggleGroup } from '@/components/common/ToggleGroup';
import { TargetAssetsSection } from '@/components/notice/TargetAssetsSection';
import { useNoticeStore } from '@/stores/noticeStore';

// PRD §4.2 — 자산 등록 안내 페이지 (v1 화면 이식).
// 톤 완화·단순화: 본문/체크박스 없이 보유 여부 선택만으로 응답 기록.

type Ownership = 'has' | 'none';

function formatMonthDayTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NoticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const respond = useNoticeStore((s) => s.respond);
  const seedDevSamples = useNoticeStore((s) => s.seedDevSamples);
  const resetForDev = useNoticeStore((s) => s.resetForDev);
  const latest = useNoticeStore((s) => s.latestForCurrentUser());

  const [ownership, setOwnership] = useState<Ownership | null>(latest?.ownership ?? null);
  const canSubmit = ownership !== null;

  const handleSubmit = () => {
    if (!ownership) return;
    respond(ownership);
    // F-GUIDE-5: ownership에 따라 분기.
    if (ownership === 'has') navigate('/search', { replace: true });
    else navigate('/notice/done', { replace: true });
  };

  return (
    <Shell className="max-w-[720px]">
      <header className="mb-6">
        <div className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-brand">
          {t('notice.eyebrow')}
        </div>
        <h1 className="text-2xl font-semibold tracking-tighter2 text-text">{t('notice.title')}</h1>
        <p className="mt-1 text-[13px] text-text-3">{t('notice.subtitle')}</p>
      </header>

      {/* 캠페인 대상 자산 안내 — 응답 카드 위에 둠 */}
      <TargetAssetsSection />

      {/* 이전 응답 요약 (재진입 시) */}
      {latest && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-line bg-bg-soft/40 px-4 py-3">
          <History className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-3" />
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-text">{t('notice.previous.title')}</div>
            <div className="mt-0.5 font-mono text-[11.5px] text-text-2">
              {t('notice.previous.summary', {
                date: formatMonthDayTime(latest.respondedAt),
                ownership: t(`notice.ownership.${latest.ownership}`),
              })}
            </div>
          </div>
        </div>
      )}

      {/* 응답 입력 카드 */}
      <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
        <div className="mb-2 text-[12.5px] font-medium text-text-2">
          {t('notice.ownershipLegend')}
          <span className="ml-1.5 text-danger">*</span>
        </div>
        <ToggleGroup<Ownership>
          name="notice-ownership"
          value={ownership}
          onChange={(v) => setOwnership(v)}
          options={[
            { value: 'has', label: t('notice.ownership.has') },
            { value: 'none', label: t('notice.ownership.none') },
          ]}
        />

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-[11.5px] text-text-3">{!canSubmit && t('notice.submitDisabledHint')}</div>
          <Button variant="primary" size="md" disabled={!canSubmit} onClick={handleSubmit}>
            <Check className="h-3.5 w-3.5" />
            {t('notice.submit')}
          </Button>
        </div>
      </section>

      {/* DEV 도구 — 개발 모드에서만 노출 */}
      {import.meta.env.DEV && (
        <section className="mt-8 rounded-lg border border-dashed border-line bg-bg-soft/30 px-4 py-3">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-text-3">
            <Sparkles className="h-3 w-3" />
            {t('notice.dev.title')}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={() => seedDevSamples()}>
              {t('notice.dev.seedSamples')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => resetForDev()}>
              {t('notice.dev.reset')}
            </Button>
          </div>
        </section>
      )}
    </Shell>
  );
}
