import { useQuery } from '@tanstack/react-query';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Panel } from '@/components/layout/Panel';
import { getProgressTrend } from '@/lib/api/dashboard';
import type { ProgressPoint } from '@/lib/mockDashboard';
import { TODAY_DPLUS } from '@/lib/mockDashboard';
import { formatDateMD } from '@/lib/format';

const LG_RED = '#A50034';
const GRAY = '#9CA3AF';

function TickXAxis(
  props: { x?: number; y?: number; payload?: { value: number } },
  byIndex: Map<number, ProgressPoint>,
) {
  const { x, y, payload } = props;
  const d = payload?.value ?? 0;
  const p = byIndex.get(d);
  return (
    <g transform={`translate(${x},${y})`}>
      <text className="font-mono" textAnchor="middle" fill="#78716c" fontSize={10} dy={12}>
        D+{d}
      </text>
      {p && (
        <text className="font-mono" textAnchor="middle" fill="#a8a29e" fontSize={10} dy={24}>
          {formatDateMD(p.date)}
        </text>
      )}
    </g>
  );
}

type TPayload = { value: number; name: string; color: string };
function CustomTooltip({
  active,
  payload,
  label,
  byIndex,
}: {
  active?: boolean;
  payload?: TPayload[];
  label?: number;
  byIndex: Map<number, ProgressPoint>;
}) {
  if (!active || !payload || !payload.length) return null;
  const p = label !== undefined ? byIndex.get(label) : undefined;
  return (
    <div className="rounded-md bg-text px-2.5 py-1.5 font-mono text-[11.5px] text-white shadow-lg">
      <div className="font-semibold">
        D+{label} {p && `· ${formatDateMD(p.date)}`}
      </div>
      {payload.map((s) => (
        <div key={s.name} style={{ color: s.name === '식별률' ? '#FCA5C4' : '#e7e5e4' }}>
          {s.name} {s.value}%
        </div>
      ))}
    </div>
  );
}

export function ProgressChart() {
  const { data } = useQuery({ queryKey: ['dashboard', 'progress'], queryFn: getProgressTrend });
  const points = data ?? [];
  const byIndex = new Map(points.map((p) => [p.dIndex, p]));

  // 4주 전체 한 판. 주 단위(7일) 눈금만 표기 (주간 화살표 없음 — 진척률은 한 화면).
  const last = points.at(-1)?.dIndex ?? 0;
  const ticks = points.filter((p) => p.dIndex % 7 === 0).map((p) => p.dIndex);
  if (!ticks.includes(last)) ticks.push(last);

  return (
    <Panel
      title="진척률 추이"
      headerRight={
        <span className="flex items-center gap-3 font-mono text-[11px] text-text-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-2.5 rounded-full bg-brand" />
            식별률
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-2.5 rounded-full bg-[#9CA3AF]" />
            참여율
          </span>
        </span>
      }
    >
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 12, right: 16, left: 0, bottom: 28 }}>
            <CartesianGrid stroke="#e7e5e4" strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="dIndex"
              type="number"
              domain={[0, last]}
              ticks={ticks}
              interval={0}
              tickLine={false}
              axisLine={{ stroke: '#e7e5e4' }}
              tick={(p) => TickXAxis(p, byIndex) as never}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: '#78716c', fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={(p) => (
                <CustomTooltip
                  active={p.active}
                  payload={p.payload as unknown as TPayload[]}
                  label={p.label as number}
                  byIndex={byIndex}
                />
              )}
              cursor={{ stroke: '#0c0a09', strokeDasharray: '3 3', strokeOpacity: 0.4 }}
            />
            <Legend wrapperStyle={{ display: 'none' }} />
            <ReferenceLine x={TODAY_DPLUS} stroke="#0c0a09" strokeDasharray="2 3" strokeOpacity={0.25} />
            <Line
              type="monotone"
              dataKey="participateRate"
              name="참여율"
              stroke={GRAY}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="identifyRate"
              name="식별률"
              stroke={LG_RED}
              strokeWidth={2.5}
              strokeLinecap="round"
              // 일자별 점 항상 표시 — 동그라미 1개 = 1일
              dot={{ r: 2.5, fill: LG_RED, stroke: '#fff', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: LG_RED, stroke: '#fff', strokeWidth: 2.5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
