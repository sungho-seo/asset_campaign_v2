import { ShieldCheck } from 'lucide-react';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { ProgressChart } from '@/components/dashboard/ProgressChart';
import { HourlyHeatmap } from '@/components/dashboard/HourlyHeatmap';
import { AssetInfoSection } from '@/components/dashboard/AssetInfoSection';
import { AbandonedCard } from '@/components/dashboard/AbandonedCard';
import { AnomalySection } from '@/components/dashboard/AnomalySection';

/** 대시보드 (PRD §7) — 정보보호담당 구성원 전용. LG레드 강조 모듈. */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div className="flex items-center gap-2 border-l-4 border-lgred pl-3">
        <ShieldCheck size={20} className="text-lgred" />
        <div>
          <h1 className="text-lg font-bold text-neutral-900">캠페인 모니터링 대시보드</h1>
          <p className="text-xs text-neutral-500">정보보호담당 구성원 전용 · 5분 이내 준실시간 갱신</p>
        </div>
      </div>

      <KpiCards />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProgressChart />
        <HourlyHeatmap />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <AssetInfoSection />
        <AbandonedCard />
      </div>

      <AnomalySection />
    </div>
  );
}
