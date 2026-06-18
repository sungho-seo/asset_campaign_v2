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
import { getProgressTrend } from '@/lib/api/dashboard';
import { formatShortDate } from '@/lib/format';

const LG_RED = '#A50034';
const GRAY = '#9CA3AF';

export function ProgressChart() {
  const { data } = useQuery({ queryKey: ['dashboard', 'progress'], queryFn: getProgressTrend });
  const points = data ?? [];

  // 4주 전체를 한 판에 표시 (주간 이동 없음). X축은 주 단위(7일)로만 눈금 표기.
  const weekTicks = points.filter((p) => p.dIndex % 7 === 0).map((p) => p.dIndex);
  const lastDIndex = points.at(-1)?.dIndex;
  if (lastDIndex !== undefined && !weekTicks.includes(lastDIndex)) weekTicks.push(lastDIndex);

  return (
    <Panel title="진척률 추이 (캠페인 4주 전체)">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 12, bottom: 8, left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F1F1" />
            <XAxis
              dataKey="dIndex"
              ticks={weekTicks}
              tickFormatter={(d) => {
                const p = points.find((x) => x.dIndex === d);
                return p ? `D+${p.dIndex} · ${formatShortDate(p.date)}` : '';
              }}
              tick={{ fontSize: 11, fill: '#6B7280' }}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6B7280' }} unit="%" width={44} />
            <Tooltip
              formatter={(v: number, name) => [`${v}%`, name]}
              labelFormatter={(d) => {
                const p = points.find((x) => x.dIndex === d);
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
