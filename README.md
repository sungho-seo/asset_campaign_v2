# IT 자산 등록 캠페인 v2 (asset-campaign-v2)

Qualys로 식별된 사내 IT 자산의 담당자·메타정보를 임직원이 직접 갱신하는 4주 캠페인 웹 서비스입니다.
정보보호담당 구성원을 위한 모니터링 대시보드를 별도 모듈로 제공합니다.

> v1(`asset_campaign`)과 **동일 호스트에서 다른 포트(8082)로 동시 운영**됩니다.
> 요구사항은 `IT_Asset_Registration_PRD_v8.docx`(v8)를 truth로 삼습니다.

## 기술 스택

- React 18 + TypeScript (strict) + Vite
- Tailwind CSS + Recharts
- React Router v6 · React Hook Form · Zod · TanStack Query · Zustand · lucide-react
- i18n: i18next + react-i18next (ko/en)

## 실행 방법

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (http://localhost:5174)
npm run build        # 타입체크 + 프로덕션 빌드 (dist/)
npm run start        # 프로덕션 서버 (Node + Express, http://localhost:8082, /api/health)
npm run preview      # (선택) vite 미리보기 (http://localhost:8082)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

## 포트 / 서비스 정보

| 항목 | 값 |
|---|---|
| 서비스명 | `asset-campaign-v2` |
| 운영(프로덕션) 포트 | `8082` |
| 개발(Vite dev) 포트 | `5174` |

## 배포 (Ubuntu 22.04, v1과 동일한 Node + Express + systemd 방식)

```bash
# 최초 설치 (서비스 계정/Node/빌드/systemd 등록까지 한 번에)
sudo bash deploy/install.sh

# 이후 업데이트 (pull → 빌드 → 재배포 → 헬스체크)
bash deploy/update.sh
```

- 운영 서버는 `npm run start`(Express, `server/index.js`)로 `dist/`를 8082 포트에 서빙하며 `/api/health` 제공.
- systemd 유닛: `deploy/asset-campaign-v2.service` (서비스명 `asset-campaign-v2`).
- 환경변수: `PORT`(기본 8082) · `BRANCH`(기본 main) · `INSTALL_DIR`(기본 `/opt/asset_campaign_v2`) · `SKIP_PULL=1`.
- 사내 SSL inspection 환경: `LOCAL_SOURCE`에 `dist/`+`node_modules/`를 포함해 넘기면 서버에서 npm 설치/빌드를 생략.

```bash
sudo journalctl -u asset-campaign-v2 -f      # 로그
sudo systemctl restart asset-campaign-v2     # 재시작
```

## 폴더 구조

```
src/
├── main.tsx, App.tsx
├── routes/                 # 페이지 (NoticePage, SearchPage, DashboardPage …)
├── components/
│   ├── common/             # Button, Input, Badge …
│   ├── layout/             # TopBar, Tabs, Panel
│   ├── feedback/           # Toast, Modal, Banner
│   ├── drawer/             # SideDrawer (재사용)
│   ├── notice/ search/ asset/ dashboard/   # 화면별 부품
│   └── _demo/              # 컴포넌트 변형 시연
├── hooks/
├── lib/                    # api/, mock*.ts, validation.ts, format.ts, queryClient.ts
├── stores/                 # Zustand (noticeStore, assetStore …)
├── types/domain.ts         # Asset, AssetOwner, NoticeResponse …
├── i18n/                   # i18next 설정 + locales(ko/en)
└── styles/globals.css

server/index.js             # 프로덕션 Express 서버 (정적 서빙 + /api/health)
deploy/                     # install.sh · update.sh · asset-campaign-v2.service
```

## Mock 모드

백엔드 API는 mock으로 처리합니다 (TanStack Query + `src/lib/mock*.ts`).
검색 정책·식별률 계산 로직은 mock에서도 PRD와 동일하게 적용됩니다.
API 계약(엔드포인트/요청/응답/권한/동시수정)은 [`src/lib/api/README.md`](src/lib/api/README.md) 참고.

## 대시보드 전용 모드 (v1 링크 진입)

v2는 기본적으로 **대시보드 전용**으로 동작합니다 (`src/config.ts`의 `DASHBOARD_ONLY=true`).
v1에서 링크로 진입하면 대시보드만 노출되고, 안내/임직원 화면은 숨겨집니다(코드는 유지, 라우트·탭만 비활성).

```bash
npm run dev                             # 대시보드 전용 (기본)
VITE_DASHBOARD_ONLY=false npm run dev   # 전체 앱(안내·임직원·대시보드)
```

대시보드 코드 구조·데이터 교체 지점은 **[`src/components/dashboard/README.md`](src/components/dashboard/README.md)** 에 정리되어 있습니다 (개발자 인계용).

데모 편의 기능:
- `/demo` — 공통 컴포넌트 변형 시연
- 자산 편집 패널의 **[DEV] 외부 수정 트리거** 버튼 — 동시 수정 충돌 모달 시연 (개발 모드 전용)
- 안내 응답은 localStorage에 누적되어 식별률·참여율이 대시보드에 즉시 반영

## 접근성 / 반응형

- 키보드: 검색창 Enter 실행, 사이드 패널·모달 ESC 닫기, Tab 순서 유지
- 반응형: 데스크탑 우선, 태블릿 그리드 축소 대응 (PRD 비기능 요구)
- 에러 바운더리 + 라우트 lazy 로딩 스켈레톤

## 진행 상태 (Phase)

- [x] **Phase 1** — 프로젝트 셋업
- [x] **Phase 2** — 디자인 시스템 + 공통 컴포넌트
- [x] **Phase 3** — 안내 페이지
- [x] **Phase 4** — 자산 검색
- [x] **Phase 5** — 자산 편집 (사이드 패널)
- [x] **Phase 6** — 신규 등록 + IP 중복 처리
- [x] **Phase 7~10** — 대시보드 (KPI / 차트 / 자산정보·방치·이상징후 / 조직별 참여율)
- [x] **Phase 11** — 통합 점검 + API 명세화
