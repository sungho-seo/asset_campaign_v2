import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Panel } from '@/components/layout/Panel';
import { WeekNav } from './WeekNav';
import { getProgressTrend } from '@/lib/api/dashboard';
import type { ProgressPoint } from '@/lib/mockDashboard';
import { formatShortDate } from '@/lib/format';

const LG_RED = '#A50034';
const GRAY = '#9CA3AF';

function tickLabel(p: ProgressPoint) {
  return `D+${p.dIndex}\n${formatShortDate(p.date)}`;
}

export function ProgressChart() {
  const { data } = useQuery({ queryKey: ['dashboard', 'progress'], queryFn: getProgressTrend });
  const [week, setWeek] = useState(0);

  const points = data ?? [];
  // 주 단위 윈도우 (8일씩, 경계 1일 겹침)
  const startD = week * 7;
  const windowed = points.filter((p) => p.dIndex >= startD && p.dIndex <= startD + 7);

  return (
    <Panel
      title="진척률 추이"
      actions={<WeekNav week={week} total={4} onChange={setWeek} />}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={windowed} margin={{ top: 8, right: 12, bottom: 8, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" />
            <XAxis
              dataKey="dIndex"
              tickFormatter={(d) => {
                const p = windowed.find((x) => x.dIndex === d);
                return p ? tickLabel(p) : '';
              }}
              tick={{ fontSize: 11, fill: '#6B7280' }}
              interval={0}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} unit="%" width={44} />
            <Tooltip
              formatter={(v: number, name) => [`${v}%`, name]}
              labelFormatter={(d) => {
                const p = windowed.find((x) => x.dIndex === d);
                return p ? `D+${p.dIndex} (${formatShortDate(p.date)})` : '';
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="identifyRate"
              name="식별률"
              stroke={LG_RED}
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="participateRate"
              name="참여율"
              stroke={GRAY}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
