// 대시보드 mock 베이스라인 (캠페인 규모). 임직원 화면의 실시간 sample(mockDb)과 합산되어 표시된다.
// 식별률/참여율 등은 dashboardSelectors에서 baseline + live sample로 계산.

export const CAMPAIGN = {
  totalAssets: 12847,
  totalEmployees: 3200,
  startDate: '2026-06-15', // D+0
  weeks: 4,
};

// 베이스라인(샘플 외 자산/임직원 집계분)
export const BASELINE = {
  identifiedAssets: 3001, // 식별 완료
  participants: 1318, // 안내 응답 완료자
  modifiedAssets: 412, // 정보 갱신
  newAssets: 87, // 신규 등록
  modifiedDeltaPrevDay: 4,
  newDeltaPrevDay: 8,
  visitorsToday: 263,
  visitorsCumulative: 1804,
  visitorsDeltaPrevDay: 37,
};

export type AccessAction = '갱신' | '신규등록' | '단순접속' | '담당자삭제' | '담당자추가';

export type AccessEntry = {
  id: string;
  at: string; // ISO
  empName: string;
  deptPath: string;
  action: AccessAction;
};

export const accessLogToday: AccessEntry[] = [
  { id: 'ac1', at: '2026-06-18T09:02:00+09:00', empName: '김현수', deptPath: 'HS사업본부 > H&A연구소 > 제어연구팀', action: '갱신' },
  { id: 'ac2', at: '2026-06-18T09:14:00+09:00', empName: '이서진', deptPath: 'VS사업본부 > VS연구소 > 플랫폼개발팀', action: '신규등록' },
  { id: 'ac3', at: '2026-06-18T09:41:00+09:00', empName: '박도윤', deptPath: 'CTO부문 > 클라우드플랫폼담당 > 인프라운영팀', action: '단순접속' },
  { id: 'ac4', at: '2026-06-18T10:05:00+09:00', empName: '최예린', deptPath: 'ES사업본부 > ES연구소 > 시스템개발팀', action: '갱신' },
  { id: 'ac5', at: '2026-06-18T10:33:00+09:00', empName: '정우성', deptPath: 'CSO부문 > 보안담당 > 보안운영팀', action: '담당자추가' },
  { id: 'ac6', at: '2026-06-18T11:12:00+09:00', empName: '한지민', deptPath: '한국영업본부 > 영업기획담당 > 기획1팀', action: '단순접속' },
  { id: 'ac7', at: '2026-06-18T13:20:00+09:00', empName: '오세훈', deptPath: 'MS사업본부 > MS연구소 > 회로설계팀', action: '갱신' },
  { id: 'ac8', at: '2026-06-18T14:02:00+09:00', empName: '윤아름', deptPath: 'CTO부문 > 클라우드플랫폼담당 > SM팀', action: '담당자삭제' },
  { id: 'ac9', at: '2026-06-18T15:30:00+09:00', empName: '강민호', deptPath: 'CS센터 > 서비스기획담당 > 운영팀', action: '신규등록' },
];

export type UpdatedAssetEntry = {
  id: string;
  hostname: string;
  kind: 'modified' | 'new';
  by: string;
  at: string;
  csp?: string;
};

// ── 진척률 추이 (D+0 ~ D+28) — 식별률·참여율 점진 증가 ──
export type ProgressPoint = {
  dIndex: number; // D+N
  date: string; // ISO date
  identifyRate: number; // 0~100
  participateRate: number;
};

function buildProgress(): ProgressPoint[] {
  const start = new Date(CAMPAIGN.startDate + 'T00:00:00+09:00');
  const out: ProgressPoint[] = [];
  for (let d = 0; d <= 28; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    // 로지스틱 유사 증가
    const identify = Math.round((28 * (d / 28) ** 0.7 + 1) * 10) / 10; // ~ 0→29%
    const participate = Math.round((50 * (d / 28) ** 0.6 + 2) * 10) / 10; // ~ 0→52%
    out.push({
      dIndex: d,
      date: date.toISOString(),
      identifyRate: Math.min(identify, 100),
      participateRate: Math.min(participate, 100),
    });
  }
  return out;
}

export const progressTrend: ProgressPoint[] = buildProgress();

// ── 시간대별 접속 추이 히트맵 (요일 7 × 시간 24), 주별 ──
export const HEATMAP_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

function buildHeatmapWeek(weekFactor: number): number[][] {
  // [day][hour] 접속 수
  return HEATMAP_DAYS.map((_, day) => {
    const weekend = day === 0 || day === 6;
    return Array.from({ length: 24 }, (_, hour) => {
      let base = 0;
      if (hour >= 9 && hour <= 18) base = weekend ? 4 : 28;
      else if (hour >= 7 && hour < 9) base = weekend ? 2 : 12;
      else if (hour > 18 && hour <= 21) base = weekend ? 2 : 10;
      else base = weekend ? 0 : 2;
      if (hour === 12) base = Math.round(base * 0.6); // 점심 감소
      const jitter = ((day * 7 + hour) % 5) - 2;
      return Math.max(0, Math.round((base + jitter) * weekFactor));
    });
  });
}

// 4주: 후반 주로 갈수록 접속 증가
export const heatmapByWeek: number[][][] = [
  buildHeatmapWeek(0.6),
  buildHeatmapWeek(0.85),
  buildHeatmapWeek(1.0),
  buildHeatmapWeek(0.75),
];

export const updatedAssetsToday: UpdatedAssetEntry[] = [
  { id: 'u1', hostname: 'ha-ctrl-12', kind: 'modified', by: '김현수', at: '2026-06-18T09:02:00+09:00' },
  { id: 'u2', hostname: 'vs-edge-new', kind: 'new', by: '이서진', at: '2026-06-18T09:14:00+09:00' },
  { id: 'u3', hostname: 'es-build-07', kind: 'modified', by: '최예린', at: '2026-06-18T10:05:00+09:00' },
  { id: 'u4', hostname: 'cs-gcp-batch', kind: 'new', by: '강민호', at: '2026-06-18T15:30:00+09:00', csp: 'GCP' },
  { id: 'u5', hostname: 'ms-sim-03', kind: 'modified', by: '오세훈', at: '2026-06-18T13:20:00+09:00' },
];
