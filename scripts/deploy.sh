#!/usr/bin/env bash
# v2 최초 배포 / 재배포 스크립트.
# 사용: ./scripts/deploy.sh
set -euo pipefail

SERVICE="asset-campaign-v2"
PORT="8082"

cd "$(dirname "$0")/.."

echo "▶ [$SERVICE] 이미지 빌드 (port $PORT)…"
docker compose build

echo "▶ [$SERVICE] 컨테이너 기동…"
docker compose up -d

echo "✔ 배포 완료. http://localhost:${PORT}/ 에서 확인하세요."
docker compose ps
