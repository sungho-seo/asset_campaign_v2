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
npm run build        # 타입체크 + 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기 (http://localhost:8082)
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

## 포트 / 서비스 정보

| 항목 | 값 |
|---|---|
| 서비스명 | `asset-campaign-v2` |
| 운영(프로덕션) 포트 | `8082` |
| 개발(Vite dev) 포트 | `5174` |

## 배포

```bash
./scripts/deploy.sh          # 최초/재배포 (docker compose build + up)
./scripts/update.sh main     # 최신 코드 pull 후 재기동
```

systemd 등록은 `deploy/systemd/asset-campaign-v2.service` 참고.

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
```

## Mock 모드

백엔드 API는 mock으로 처리합니다 (TanStack Query + `src/lib/mock*.ts`).
검색 정책·식별률 계산 로직은 mock에서도 PRD와 동일하게 적용됩니다.

## 진행 상태 (Phase)

- [x] **Phase 1** — 프로젝트 셋업 (현재)
- [ ] Phase 2 — 디자인 시스템 + 공통 컴포넌트
- [ ] Phase 3 — 안내 페이지
- [ ] Phase 4 — 자산 검색
- [ ] Phase 5 — 자산 편집 (사이드 패널)
- [ ] Phase 6 — 신규 등록 + IP 중복 처리
- [ ] Phase 7~10 — 대시보드
- [ ] Phase 11 — 통합 점검 + API 명세화
