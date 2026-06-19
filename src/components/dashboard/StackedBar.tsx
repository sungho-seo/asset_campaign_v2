import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Panel } from '@/components/layout/Panel';
import { WeekNav } from './WeekNav';
import { getDailyEditNew } from '@/lib/api/dashboard';
import { formatShortDate } from '@/lib/format';

const HATCH_BG =
  'repeating-linear-gradient(135deg, rgba(255,255,255,.18) 0px, rgba(255,255,255,.18) 2px, transparent 2px, transparent 6px)';

/** v1 이식 — 일자별 신규 vs 수정 비율 (최하단). 주 단위 < > 이동. */
export function StackedBar() {
  const { data } = useQuery({ queryKey: ['dashboard', 'daily'], queryFn: getDailyEditNew });
  const [week, setWeek] = useState(0);

  const all = data ?? [];
  const rows = all.filter((d) => d.dPlus >= week * 7 && d.dPlus < week * 7 + 7);
  const maxTotal = Math.max(...all.map((d) => d.edit + d.neo), 1);

  return (
    <Panel
      title="일자별 신규 vs 수정 비율"
      subtitle="일별 합계 기준 · 주 단위 보기"
      headerRight={<WeekNav week={week} total={4} onChange={setWeek} />}
      padded={false}
    >
      <div className="px-5 py-4">
        <div className="space-y-2">
          {rows.map((d) => {
            const total = d.edit + d.neo;
            const totalPct = (total / maxTotal) * 100;
            const editFrac = total === 0 ? 0 : (d.edit / total) * totalPct;
            const newFrac = total === 0 ? 0 : (d.neo / total) * totalPct;
            return (
              <div
                key={d.dPlus}
                className="grid items-center gap-3 text-[11.5px]"
                style={{ gridTemplateColumns: '92px 1fr 100px' }}
              >
                <span className="font-mono text-text-3">
                  D+{d.dPlus} · {formatShortDate(d.date)}
                </span>
                <div className="flex h-[18px] overflow-hidden rounded bg-bg-soft">
                  <div
                    className="h-full bg-[#57534e]"
                    style={{ width: `${editFrac}%`, backgroundImage: HATCH_BG }}
                    title={`수정 ${d.edit}건`}
                  />
                  <div className="h-full bg-purple" style={{ width: `${newFrac}%` }} title={`신규 ${d.neo}건`} />
                </div>
                <div className="flex justify-end gap-2 font-mono text-[11px]">
                  <span className="text-text">{d.edit.toLocaleString()}</span>
                  <span className="text-purple">+{d.neo}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-end gap-3 text-[11.5px] text-text-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#57534e]" style={{ backgroundImage: HATCH_BG }} />
            수정
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-purple" />
            신규 등록
          </span>
        </div>
      </div>
    </Panel>
  );
}
