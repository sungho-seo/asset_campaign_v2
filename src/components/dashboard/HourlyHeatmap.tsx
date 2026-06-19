import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Panel } from '@/components/layout/Panel';
import { WeekNav } from './WeekNav';
import { getHourlyHeatmap } from '@/lib/api/dashboard';
import { CAMPAIGN } from '@/lib/mockDashboard';
import { cn } from '@/lib/cn';

// v1 인디고 5단계 그라데이션 (룩앤필 그대로)
const levelClass: Record<number, string> = {
  0: 'bg-bg-soft',
  1: 'bg-[#e0e7ff]',
  2: 'bg-[#a5b4fc]',
  3: 'bg-[#6366f1]',
  4: 'bg-[#4338ca]',
  5: 'bg-[#1e1b4b]',
};

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

function toLevel(count: number, max: number): number {
  if (count <= 0 || max <= 0) return 0;
  return Math.max(1, Math.min(5, Math.ceil((count / max) * 5)));
}

export function HourlyHeatmap() {
  const { data } = useQuery({ queryKey: ['dashboard', 'hourly'], queryFn: getHourlyHeatmap });
  const [week, setWeek] = useState(2);

  const grid = data?.[week] ?? [];
  const max = Math.max(1, ...grid.flat());

  // 선택 주의 7일(연속 날짜). 데이터는 요일(0=일~6=토)로 버킷팅 → getDay()로 인덱싱.
  const weekStart = new Date(CAMPAIGN.startDate + 'T00:00:00+09:00');
  weekStart.setDate(weekStart.getDate() + week * 7);
  const rows = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const wd = date.getDay();
    return { date, wd, label: `${date.getMonth() + 1}/${date.getDate()} ${WEEKDAY[wd]}` };
  });

  return (
    <Panel
      title="시간대별 접속 추이"
      headerRight={<WeekNav week={week} total={4} onChange={setWeek} />}
      padded={false}
      className="flex h-full flex-col"
      bodyClassName="flex flex-1 items-center justify-center"
    >
      <div className="w-full px-5 py-4">
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: '56px repeat(24, 1fr)',
            gridTemplateRows: '18px repeat(7, 1fr)',
          }}
        >
          <div />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={`h-${h}`} className="grid place-items-center font-mono text-[9.5px] text-text-3">
              {h % 3 === 0 ? h : ''}
            </div>
          ))}
          {rows.map(({ wd, label }, ri) => (
            <div key={`row-${ri}`} className="contents">
              <div className="flex items-center justify-end pr-1.5 font-mono text-[9.5px] text-text-3">
                {label}
              </div>
              {Array.from({ length: 24 }, (_, h) => {
                const count = grid[wd]?.[h] ?? 0;
                const lvl = toLevel(count, max);
                return (
                  <div
                    key={`c-${ri}-${h}`}
                    title={`${label} ${h}시 · ${count}명`}
                    className={cn(
                      'aspect-square min-h-[14px] rounded-sm transition-transform',
                      'hover:z-10 hover:scale-[1.3] hover:outline hover:outline-[1.5px] hover:outline-text',
                      levelClass[lvl],
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end font-mono text-[11px] text-text-3">
          <span className="flex items-center gap-1">
            <span>낮음</span>
            {[0, 1, 2, 3, 4, 5].map((l) => (
              <span key={l} className={cn('h-2.5 w-2.5 rounded-sm', levelClass[l])} />
            ))}
            <span>높음</span>
          </span>
        </div>
      </div>
    </Panel>
  );
}
