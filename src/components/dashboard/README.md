# 대시보드 모듈 가이드 (개발자용)

v2는 **v1에서 링크로 진입해 대시보드만 보여주는** 용도로 운영됩니다(PRD §7).
이 문서는 대시보드 화면을 빠르게 파악·수정하기 위한 지도입니다.

## 0. 모드 — 대시보드 전용

- 플래그: [`src/config.ts`](../../config.ts) `DASHBOARD_ONLY` (기본 `true`)
- 동작: `App.tsx`가 `DASHBOARD_ONLY`일 때 `/dashboard`만 라우팅하고 그 외 경로는 `/dashboard`로 보냅니다. `TopBar`의 안내/임직원 탭도 숨깁니다.
- 안내/임직원 화면 코드는 **삭제하지 않고 비활성**만 했습니다. 전체 앱을 보려면:
  ```bash
  VITE_DASHBOARD_ONLY=false npm run dev
  ```
- 접근 권한: `/dashboard`는 `RequireDashboard`(정보보호담당)만 통과. mock은 `mockAuth.isInfoSecurityTeam=true`.

## 1. 화면 진입점

| 파일 | 역할 |
|---|---|
| [`routes/DashboardPage.tsx`](../../routes/DashboardPage.tsx) | 대시보드 페이지 조립 (섹션 배치) |

페이지 구성 순서(위→아래): **KPI 5종 → 진척률·히트맵 → IT자산정보·이상징후 → 검색분석 → 조직별 참여율 → 일자별 신규vs수정**.

## 2. 섹션 컴포넌트 (`src/components/dashboard/`)

| 파일 | 화면 | 비고 |
|---|---|---|
| `KpiCards.tsx` | KPI 5종(식별률·참여율·접속자·업데이트·방치) | 접속자/업데이트 클릭 → 사이드 패널 |
| `AbandonedCard.tsx` | 방치 자산 KPI 카드 | 클릭 → 3탭 드로어(전체/담당자지정/접속이력) |
| `ProgressChart.tsx` | 진척률 추이 (식별률 LG레드 + 참여율 그레이) | 4주 한 판, 일자별 점 표시 |
| `HourlyHeatmap.tsx` | 시간대별 접속 히트맵 (인디고 5단계) | 주 단위 `< >` (WeekNav) |
| `WeekNav.tsx` | 주 단위 이동 컨트롤 | 히트맵·StackedBar 공용 |
| `AssetInfoSection.tsx` | IT 자산 정보 4카드 | 온프레미스/클라우드/미지정/전원퇴사 → 목록 드로어 |
| `AnomalySection.tsx` | 이상 징후/충돌 + 검색 분석 | `IncidentPanel` 1개로 두 섹션 렌더 |
| `IncidentDrawer.tsx` | 이상 징후 상세 드로어 | stats + 검색 + CSV + 표 + 자산 드릴다운 |
| `IncidentTable.tsx` (drawer/) | 이상 징후 표 (키별 레이아웃) | IP/Host 2줄, 아바타, A vs B |
| `AssetDetailDrawer.tsx` | 2겹 자산 현재 정보 (읽기전용) | 목록 행 클릭 시 위로 열림 |
| `OrgSection.tsx` | 조직별 참여율 17+1 카드 + 트리 드로어 | 정렬/검색/CSV, '해외법인' 평면 목록 |
| `StackedBar.tsx` | 일자별 신규 vs 수정 비율 | 주 단위 `< >` |

### 공용 부품
- [`drawer/ListSidePanel.tsx`](../drawer/ListSidePanel.tsx) — **모든 목록 사이드 패널의 공통 틀**: 상단 stats(발생 건수 등) + 검색창 + CSV 버튼. `children`은 `(filter) => ReactNode`.
- [`drawer/SideDrawer.tsx`](../drawer/SideDrawer.tsx) — 기반 드로어(좌측 브랜드 막대·핑크 헤더·portal). `padded` 토글.
- [`kpi/KPICard.tsx`](../kpi/KPICard.tsx), [`kpi/MetricRow.tsx`](../kpi/MetricRow.tsx) — KPI 카드 / 클릭 가능한 지표 행.
- [`layout/Panel.tsx`](../layout/Panel.tsx), `PageHeader.tsx`, `Shell.tsx` — 카드/헤더/본문 컨테이너.
- [`common/Avatar.tsx`](../common/Avatar.tsx) — 담당자 이니셜 아바타.

## 3. 데이터 레이어 (모두 mock — 교체 지점)

모든 화면은 TanStack Query로 아래 selector를 호출합니다. **실제 백엔드 연동 시 이 함수들만 교체**하면 됩니다.

| 파일 | 내용 |
|---|---|
| [`lib/api/dashboard.ts`](../../lib/api/dashboard.ts) | 대시보드 selector 전부 (`getKpi`, `getProgressTrend`, `getHourlyHeatmap`, `getDailyEditNew`, `getAssetTypeSummary`, `getAssetList`, `getRetiredAssets`, `getAbandoned`, `getAnomalySummary`, `getAnomalyDetail`, `getOrganizations`, `getOrgTree`, `getAccessLog`, `getUpdatedAssets`) |
| [`lib/api/assets.ts`](../../lib/api/assets.ts) | `getAssetByRef` (드릴다운 자산 조회) |
| [`lib/mockDashboard.ts`](../../lib/mockDashboard.ts) | 캠페인 baseline 수치 + 차트/접속/업데이트/이상징후 **시드 데이터** |
| [`lib/mockOrganizations.ts`](../../lib/mockOrganizations.ts) | 17개 대단위 조직 + 해외법인 + 기타 **트리 생성기**(seeded, 결정적) |
| [`lib/csv.ts`](../../lib/csv.ts) | 클라이언트 CSV 다운로드 |
| [`lib/api/README.md`](../../lib/api/README.md) | **실제 API 엔드포인트 명세**(요청/응답/권한) |

### 핵심 계산
- **식별률** = (baseline 식별 + 라이브 sample 식별) ÷ 전체 자산. sample 식별 판정은 [`types/domain.ts`](../../types/domain.ts) `isAssetIdentified`.
- **참여율** = (baseline 응답자 + noticeStore 응답자) ÷ 전체 임직원.
- 캠페인 기간: `CAMPAIGN.startDate ~ endDate` (현재 6/22~7/17, D+0~D+25). X축 눈금은 7일 간격.

### baseline + 라이브 합산
대시보드 수치는 `mockDashboard`의 **캠페인 규모 baseline**과, 임직원 화면(전체 모드)에서 발생한 **라이브 이벤트(`src/lib/mock.ts` mockDb)**를 합산합니다. 대시보드 전용 모드에서는 라이브 이벤트가 없으므로 baseline + 시드만 표시됩니다.

## 4. 사이드 패널 패턴 (중요)

- 목록 패널은 **`ListSidePanel`** 로 통일 — 상세 stats / 검색 / CSV가 기본 제공됩니다.
- 이상 징후·IP중복 상세는 **`IncidentDrawer`** → `IncidentTable`(키별 컬럼) 사용.
- 자산이 등장하는 목록은 행 클릭 시 **`AssetDetailDrawer`(2겹)** 가 위로 열리고, 닫으면 첫 패널로 복귀합니다.

## 5. 색/룩앤필 토큰

`tailwind.config.ts`에 v1 토큰 정착: `brand`(#A50034)/`brand-soft`(#FCE4EC), `bg`/`line`/`text`(2~4)/`panel`, `success`/`warn`/`danger`/`purple`(+soft), Geist/JetBrains Mono. 히트맵만 인디고(`#e0e7ff`~`#1e1b4b`).
