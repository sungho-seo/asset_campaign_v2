// 대시보드 mock 베이스라인 (캠페인 규모). 임직원 화면의 실시간 sample(mockDb)과 합산되어 표시된다.
// 식별률/참여율 등은 dashboardSelectors에서 baseline + live sample로 계산.

export const CAMPAIGN = {
  totalAssets: 12847,
  totalEmployees: 3200,
  startDate: '2026-06-22', // D+0
  endDate: '2026-07-17', // D+25 (마지막 주는 4일 — X축 눈금 6/22·6/29·7/6·7/13·7/17)
  weeks: 4,
};

/** 진척률 추이 '오늘' 마커 (D+N). */
export const TODAY_DPLUS = 7;

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
  const end = new Date(CAMPAIGN.endDate + 'T00:00:00+09:00');
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000);
  const out: ProgressPoint[] = [];
  for (let d = 0; d <= totalDays; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const f = d / totalDays;
    // 로지스틱 유사 증가
    const identify = Math.round((28 * f ** 0.7 + 1) * 10) / 10; // ~ 0→29%
    const participate = Math.round((50 * f ** 0.6 + 2) * 10) / 10; // ~ 0→52%
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

// ── 일자별 신규 vs 수정 비율 (v1 유지) — 캠페인 전 기간(주 단위 < > 이동) ──
export type DailyEditNew = { dPlus: number; date: string; edit: number; neo: number };
function buildDaily(): DailyEditNew[] {
  const start = new Date(CAMPAIGN.startDate + 'T00:00:00+09:00');
  const end = new Date(CAMPAIGN.endDate + 'T00:00:00+09:00');
  const total = Math.round((end.getTime() - start.getTime()) / 86400000);
  const out: DailyEditNew[] = [];
  for (let d = 0; d <= total; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const weekday = date.getDay();
    const base = weekday === 0 || weekday === 6 ? 60 : 320;
    const seed = (d * 9301 + 49297) % 233280;
    const jitter = (seed / 233280 - 0.5) * 120;
    const edit = Math.max(20, Math.round(base + jitter));
    const neo = Math.max(2, Math.round(edit * (0.08 + (seed % 7) / 100)));
    out.push({ dPlus: d, date: date.toISOString(), edit, neo });
  }
  return out;
}
export const dailyEditNew: DailyEditNew[] = buildDaily();

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

// ── §7.5 IT 자산 정보 카드 baseline ──
export const ASSET_TYPE_BASELINE = {
  onprem: { total: 9420, modified: 318, neo: 41 },
  cloud: { total: 3427, modified: 94, neo: 46 },
  unassigned: 7610,
  retired: 233,
};

// 담당자 전원 퇴사 (인사 별도 쿼리 결과 — 화면만 준비)
export type RetiredAssetRow = { id: string; ip: string; hostname: string; lastOwner: string; retiredAt: string };
export const retiredAssets: RetiredAssetRow[] = [
  { id: 'R-1', ip: '10.10.1.21', hostname: 'legacy-erp-01', lastOwner: '강퇴직(2026-03)', retiredAt: '2026-03-31' },
  { id: 'R-2', ip: '10.10.1.34', hostname: 'old-mail-relay', lastOwner: '윤퇴직(2026-04)', retiredAt: '2026-04-15' },
  { id: 'R-3', ip: '10.10.1.88', hostname: 'archive-nas-02', lastOwner: '한퇴직(2026-02)', retiredAt: '2026-02-28' },
];

// ── §7.6 방치 자산 ──
export const ABANDONED = {
  abandoned: 8247,
  total: 12847,
  deltaPrevDay: -63,
};
export type AbandonedRow = { id: string; hostname: string; note: string };
export const abandonedByTab: { all: AbandonedRow[]; withOwner: AbandonedRow[]; withAccess: AbandonedRow[] } = {
  all: [
    { id: 'ab1', hostname: 'unknown-srv-201', note: '담당자 없음 · 미열람' },
    { id: 'ab2', hostname: 'unknown-srv-202', note: '담당자 없음 · 미열람' },
    { id: 'ab3', hostname: 'dev-pc-330', note: '담당자 없음 · 미열람' },
  ],
  withOwner: [
    { id: 'ab4', hostname: 'ha-line-07', note: '담당자 2명 지정, 갱신 안 함' },
    { id: 'ab5', hostname: 'vs-test-11', note: '담당자 1명 지정, 갱신 안 함' },
  ],
  withAccess: [
    { id: 'ab6', hostname: 'sec-proxy-03', note: '담당자 접속 이력 있음 · 보고도 갱신 안 함' },
    { id: 'ab7', hostname: 'ms-db-replica', note: '담당자 접속 이력 있음 · 보고도 갱신 안 함' },
  ],
};

// ── §7.8 이상 징후 baseline seeds (검색률 Top 10 / 검색 0건) ──
export type SearchTopRow = { key: string; attempts: number; searchers: number };
export const searchTopIp: SearchTopRow[] = [
  { key: '10.20.30.40', attempts: 47, searchers: 12 },
  { key: '172.16.8.10', attempts: 38, searchers: 9 },
  { key: '1.1.1.1', attempts: 31, searchers: 14 },
  { key: '10.70.1.10', attempts: 22, searchers: 6 },
  { key: '2.2.2.2', attempts: 19, searchers: 8 },
];
export const searchTopHost: SearchTopRow[] = [
  { key: 'visz-web-01', attempts: 41, searchers: 10 },
  { key: 'sec-siem-01', attempts: 27, searchers: 7 },
  { key: 'es-sys-dev-01', attempts: 18, searchers: 5 },
];
export const searchTopPerson: SearchTopRow[] = [
  { key: '서성호', attempts: 33, searchers: 4 },
  { key: '이몽룡', attempts: 25, searchers: 6 },
  { key: '정약용', attempts: 17, searchers: 3 },
];
export type DupEditSeed = {
  id: string; ip: string; hostname: string;
  userA: string; teamA: string; userB: string; teamB: string; occurredAt: string;
};
export const dupEditSeed: DupEditSeed[] = [
  { id: 'de1', ip: '1.1.1.1', hostname: 'ha-ctrl-01', userA: '박문수', teamA: '제어연구팀', userB: '김현수', teamB: '제어연구팀', occurredAt: '2026-06-23T10:00:00+09:00' },
  { id: 'de2', ip: '10.70.1.10', hostname: 'es-sys-dev-01', userA: '윤서연', teamA: '시스템개발팀', userB: '이몽룡', teamB: '인프라운영팀', occurredAt: '2026-06-24T13:11:00+09:00' },
];
export type OverwriteSeed = {
  id: string; ip: string; hostname: string;
  overwroteBy: string; overwroteTeam: string; previousBy: string; previousTeam: string; occurredAt: string;
};
export const overwriteSeed: OverwriteSeed[] = [
  { id: 'ov1', ip: '10.80.0.5', hostname: 'sec-siem-01', overwroteBy: '정우성', overwroteTeam: '보안운영팀', previousBy: '정약용', previousTeam: '보안운영팀', occurredAt: '2026-06-24T15:30:00+09:00' },
];
export type OwnerChangeSeed = {
  id: string; ip: string; hostname: string;
  actor: string; actorTeam: string; action: 'add' | 'remove'; target: string; targetTeam: string; role: string; occurredAt: string;
};
export const ownerChangeSeed: OwnerChangeSeed[] = [
  { id: 'oc1', ip: '2.2.2.2', hostname: 'vs-platform-a', actor: '이서진', actorTeam: '플랫폼개발팀', action: 'add', target: '이서진', targetTeam: '플랫폼개발팀', role: '현업', occurredAt: '2026-06-25T09:00:00+09:00' },
  { id: 'oc2', ip: '10.70.1.10', hostname: 'es-sys-dev-01', actor: '윤아름', actorTeam: 'SM팀', action: 'remove', target: '김춘향', targetTeam: 'SM팀', role: 'SM', occurredAt: '2026-06-25T16:40:00+09:00' },
];

export type ZeroSearchRow = { id: string; query: string; searcher: string; at: string; proceeded: boolean };
export const zeroSearches: ZeroSearchRow[] = [
  { id: 'z1', query: '10.99.5.5', searcher: '김현수', at: '2026-06-17T11:00:00+09:00', proceeded: true },
  { id: 'z2', query: 'new-vm-xyz', searcher: '이서진', at: '2026-06-17T14:20:00+09:00', proceeded: false },
];
