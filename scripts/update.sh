#!/usr/bin/env bash
# v2 업데이트 스크립트 — 최신 코드 pull 후 무중단에 가깝게 재기동.
# 사용: ./scripts/update.sh [branch]
set -euo pipefail

SERVICE="asset-campaign-v2"
BRANCH="${1:-main}"

cd "$(dirname "$0")/.."

echo "▶ [$SERVICE] '$BRANCH' 최신 코드 가져오기…"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "▶ [$SERVICE] 재빌드…"
docker compose build

echo "▶ [$SERVICE] 재기동…"
docker compose up -d

echo "✔ 업데이트 완료."
docker compose ps
