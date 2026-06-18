# API 명세 (IT 자산 등록 캠페인 v8)

현재는 `src/lib/mock.ts` + `src/lib/mockDashboard.ts` + `src/lib/mockOrganizations.ts`의
인메모리 데이터를 TanStack Query로 소비하는 **mock 모드**입니다. 아래는 실제 백엔드로 교체할 때의
계약(요청/응답/권한)을 정의합니다. 모든 응답은 JSON, 인증은 SSO 세션 쿠키 기준입니다.

## 공통

- 인증: SSO(OIDC/SAML) 세션 필수. 미인증 시 `401`.
- 권한: 대시보드(`/api/dashboard/*`)는 **정보보호담당 소속**만 접근. 그 외 `403`.
- 시각: 모든 timestamp는 ISO 8601 (`+09:00`).
- 검색 정책: 서버에서 **반드시** 권한 필터(본인 관련/미할당)를 먼저 적용한 뒤 검색어 필터.

---

## 임직원 화면 API

### `GET /api/me`
현재 사용자. (mock: `mockAuth.getCurrentUser`)
```ts
Response: {
  empNo: string; empName: string; email: string;
  deptName: string; deptPath: string; isInfoSecurityTeam: boolean;
}
```

### `GET /api/notice/me`
현재 사용자의 최신 안내 응답.
```ts
Response: NoticeResponse | null
```

### `GET /api/notice/responses`
응답 이력(누적). 관리/감사용.
```ts
Response: NoticeResponse[]
```

### `POST /api/notice/responses`
안내 응답 기록(새 행 누적, 덮어쓰지 않음 — F-GUIDE-4/7).
```ts
Request:  { ownership: 'has' | 'none' }
Response: NoticeResponse   // 201
```

### `GET /api/assets/search`
검색. **권한 필터 → 검색어 필터** 순서 필수 (§F-3, 비기능 보안).
```ts
Query:    { type: 'integrated'|'ip'|'hostname'|'owner'; q: string; page?: number }
Response: { assets: Asset[]; total: number }
// 부가효과: search_events 기록 (대시보드 검색률 Top 10 산출)
권한: 본인이 5역할 중 1개 이상 포함된 자산 + 미할당 자산만. 타인 단독 할당은 결과에서 제외.
```

### `GET /api/assets/:id`
자산 상세. 응답 헤더 `ETag: "<version>"` 포함(낙관적 잠금).
```ts
Response: Asset
// 부가효과: 상세 열람 이벤트 기록 (방치 자산 분류 — F-UPD-11)
```

### `PUT /api/assets/:id`
자산 **정보 필드** 수정(담당자 제외). 동시 수정 충돌 감지 적용.
```ts
Headers:  If-Match: "<version>"     // 열람 시점 버전 (또는 body.baseVersion)
Request:  { fields: AssetFields; confirmLatest: boolean }
Response 200: { asset: Asset }                          // 성공, version+1
Response 409: { conflict: true; current: Asset }        // 버전 불일치 → 클라이언트 3중 비교
// confirmLatest=true 시 latest_confirmations 기록 (식별률 산출 — F-AUD-4)
// overwrite(덮어쓰기 결정) 시 anomaly(overwrite) 기록
```

### `POST /api/assets/:id/owners`
담당자 추가 — **충돌 감지 제외, 즉시 반영** (F-UPD-8). owner_change_history 기록.
```ts
Request:  { role: OwnerRole; empNo; empName; email; deptPath }
Response: Asset
```

### `DELETE /api/assets/:id/owners/:ownerId`
담당자 삭제 — 즉시 반영. owner_change_history 기록.
```ts
Response: Asset
```

### `POST /api/assets`
신규 자산 등록 + IP 중복 검증 (§4.5).
```ts
Request:  { fields: AssetFields; owners: NewOwnerDraft[] }
Response 200:
  | { status: 'created'; asset: Asset; multiDup: boolean }   // 0건 또는 2건+(duplicate_ip_tag=true)
  | { status: 'single-dup'; existing: Asset }                // 1건 → 클라이언트가 '현업 추가/취소' 결정
```

### `POST /api/assets/:id/owners/self-biz`
단일 IP 중복 → 기존 자산의 현업 담당자에 본인 추가 (F-NEW-4). dup-ip-update anomaly 기록.
```ts
Response: Asset
```

---

## 대시보드 API (권한: 정보보호담당)

### `GET /api/dashboard/kpi`
```ts
Response: {
  identifiedCount; totalAssets; identifyRate;
  participantCount; totalEmployees; participateRate;
  visitorsToday; visitorsCumulative; visitorsDelta;
  modifiedCount; newCount; modifiedDelta; newDelta;
}
// 식별률 = 식별 완료 자산 / 전체 자산(Qualys)
// 참여율 = 안내 응답 완료자 / 전체 임직원
```

### `GET /api/dashboard/progress`
진척률 추이(D+0~D+28).
```ts
Response: { dIndex: number; date: string; identifyRate: number; participateRate: number }[]
```

### `GET /api/dashboard/hourly`
시간대별 접속 히트맵(주 × 요일7 × 시간24).
```ts
Response: number[][][]   // [week][day][hour] = 접속 수
```

### `GET /api/dashboard/asset-types`
```ts
Response: {
  onprem: { total; modified; neo }; cloud: { total; modified; neo };
  unassigned; retired; dupIpNew; dupIpUpdate;
}
```

### `GET /api/dashboard/asset-list?kind=onprem|cloud|unassigned|retired`
```ts
Response: { id; hostname; sub?; tag?: 'modified'|'new'|'unassigned'; csp? }[]
```

### `GET /api/dashboard/abandoned`
```ts
Response: { abandoned; total; delta; tabs: { all; withOwner; withAccess } }
// withAccess = 담당자 접속 이력 있음에도 미갱신 (가장 심각)
```

### `GET /api/dashboard/anomalies` · `GET /api/dashboard/anomalies/:key`
```ts
summary: { key: AnomalyKey; label; count; severity }[]
detail:  { columns: string[]; rows: string[][] }
// key: dup-edit | overwrite | owner-change | dup-ip-new | dup-ip-update
//    | search-top-ip | search-top-host | search-top-person | zero-search
// dup-ip-new는 동일 IP 자산 아코디언 데이터 별도 제공
```

### `GET /api/dashboard/organizations`
17개 대단위 조직 카드.
```ts
Response: { id; name; participateRate; identifyRate: number|null; members; assets; hasHundredTeam }[]
```

### `GET /api/dashboard/organizations/:id/tree`
조직 하위 트리(부문>그룹>담당>실>팀, '기타'는 평면). 팀 leaf는 구성원 목록 포함.
```ts
Response: OrgNode  // { id; name; level; stats; children?; members? }
```

---

## 동시 수정 충돌 처리 (요약)

1. `GET /api/assets/:id` 시 `ETag`(=version) 수신, 클라이언트 보관.
2. `PUT` 시 `If-Match`로 함께 전송.
3. 서버 version과 불일치 → `409 { current }`.
4. 클라이언트: 원본(열람 시점)/다른 사람 변경(current)/내 입력 **3중 비교** 모달.
   - 덮어쓰기: `If-Match: current.version`으로 재전송
   - 다른 사람 변경 가져오기: 폼을 current로 리셋
   - 취소: 패널 유지
5. **담당자 변경은 충돌 감지 대상이 아님** — 즉시 반영, 감사 기록만.
