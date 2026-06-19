import { Shell } from '@/components/layout/Shell';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { HourlyHeatmap } from '@/components/dashboard/HourlyHeatmap';
import { AssetInfoSection } from '@/components/dashboard/AssetInfoSection';
import { AnomalySection, SearchAnalysisSection } from '@/components/dashboard/AnomalySection';
import { OrgSection } from '@/components/dashboard/OrgSection';
import { StackedBar } from '@/components/dashboard/StackedBar';
import { CAMPAIGN } from '@/lib/mockDashboard';

/** 대시보드 (PRD §7) — 정보보호담당 구성원 전용. v1 룩앤필 + v8 기능. */
export default function DashboardPage() {
  return (
    <Shell>
      <PageHeader
        eyebrow="DASHBOARD"
        title="IT 자산 등록 캠페인 현황"
        subtitle={`전체 자산 ${CAMPAIGN.totalAssets.toLocaleString()}건 기준 · 캠페인 ${CAMPAIGN.startDate} ~ ${CAMPAIGN.endDate} · 5분 주기 갱신`}
      />

      <div className="mb-5">
        <KpiCards />
      </div>

      <div className="mb-5 grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <ProgressChart />
        <HourlyHeatmap />
      </div>

      <div className="mb-5">
        <OrgSection />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AssetInfoSection />
        <AnomalySection />
      </div>

      <div className="mb-5">
        <SearchAnalysisSection />
      </div>

      {/* 최하단 — 일자별 신규 vs 수정 비율 (v1 유지) */}
      <StackedBar />

      <p className="mt-6 text-center font-mono text-[11.5px] text-text-4">
        데이터 갱신 주기 5분 · 분모는 Qualys 식별 전체 자산 수 {CAMPAIGN.totalAssets.toLocaleString()}건 기준
      </p>
    </Shell>
  );
}
