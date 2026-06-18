import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Panel } from '@/components/layout/Panel';
import { WeekNav } from './WeekNav';
import { getHourlyHeatmap } from '@/lib/api/dashboard';
import { HEATMAP_DAYS } from '@/lib/mockDashboard';
import { cn } from '@/lib/cn';

const LEVELS = [
  'bg-neutral-100',
  'bg-lgred-100',
  'bg-lgred-200',
  'bg-lgred-400',
  'bg-lgred',
];

function level(value: number, max: number): number {
  if (value === 0 || max === 0) return 0;
  const r = value / max;
  if (r > 0.75) return 4;
  if (r > 0.5) return 3;
  if (r > 0.25) return 2;
  return 1;
}

export function HourlyHeatmap() {
  const { data } = useQuery({ queryKey: ['dashboard', 'hourly'], queryFn: getHourlyHeatmap });
  const [week, setWeek] = useState(2);

  const grid = data?.[week] ?? [];
  const max = Math.max(1, ...grid.flat());

  return (
    <Panel title="시간대별 접속 추이" actions={<WeekNav week={week} total={4} onChange={setWeek} />}>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* 시간 헤더 */}
          <div className="flex pl-7 text-[9px] text-neutral-400">
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="flex-1 text-center">
                {h % 3 === 0 ? h : ''}
              </div>
            ))}
          </div>
          {grid.map((row, day) => (
            <div key={day} className="flex items-center">
              <div className="w-7 text-center text-[11px] font-medium text-neutral-500">
                {HEATMAP_DAYS[day]}
              </div>
              <div className="flex flex-1 gap-px">
                {row.map((v, hour) => (
                  <div
                    key={hour}
                    className={cn('group relative h-5 flex-1 rounded-[2px]', LEVELS[level(v, max)])}
                  >
                    <span className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">
                      {HEATMAP_DAYS[day]}요일 {hour}시 · {v}명
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* 범례 */}
          <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-neutral-400">
            <span>적음</span>
            {LEVELS.map((c) => (
              <span key={c} className={cn('h-3 w-3 rounded-[2px]', c)} />
            ))}
            <span>많음</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
