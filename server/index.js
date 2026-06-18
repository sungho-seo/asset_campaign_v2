// IT 자산 등록 캠페인 v2 — 프로덕션 정적 서버 (Node + Express).
// v1과 동일 컨셉: `npm run start`로 systemd가 기동, /api/health 헬스체크 제공.
// 백엔드 API는 프런트 mock으로 처리되므로 이 서버는 정적 서빙 + 헬스체크만 담당한다.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

const PORT = Number(process.env.PORT) || 8082;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();

// 헬스체크 (deploy/update.sh 및 모니터링용)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'asset-campaign-v2', time: new Date().toISOString() });
});

// 정적 자산 (해시 파일명 → 장기 캐시)
app.use(
  '/assets',
  express.static(path.join(distDir, 'assets'), { immutable: true, maxAge: '1y' }),
);
app.use(express.static(distDir));

// SPA fallback (React Router)
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`asset-campaign-v2 listening on http://${HOST}:${PORT}`);
});
