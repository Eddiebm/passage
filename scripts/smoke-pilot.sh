#!/usr/bin/env bash
# Passage pilot smoke checks — HTTP health + optional production build.
set -euo pipefail

RUN_BUILD=false
BASE_URL="http://localhost:3000"

for arg in "$@"; do
  case "$arg" in
    --build)
      RUN_BUILD=true
      ;;
    -h | --help)
      echo "Usage: $0 [BASE_URL] [--build]"
      echo "  BASE_URL  Site root (default: http://localhost:3000)"
      echo "  --build   Run npm run build before HTTP checks"
      exit 0
      ;;
    *)
      BASE_URL="$arg"
      ;;
  esac
done

# Trim trailing slash
BASE_URL="${BASE_URL%/}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

warn_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "WARN: $name is not set"
  else
    echo "OK:   $name is set"
  fi
}

echo "== Passage pilot smoke =="
echo "Base URL: $BASE_URL"
echo ""
echo "== Environment (warn only) =="
warn_env DATABASE_URL
warn_env POSTGRES_URL
warn_env NEXT_PUBLIC_SITE_URL
warn_env BLOB_READ_WRITE_TOKEN
warn_env PAYSTACK_SECRET_KEY
warn_env PASSAGE_ADMIN_PASSWORD
echo ""

if [[ "$RUN_BUILD" == true ]]; then
  echo "== npm run build =="
  npm run build
  echo ""
fi

check_url() {
  local path="$1"
  local label="$2"
  echo -n "GET $path ($label)... "
  curl -sf "${BASE_URL}${path}" -o /dev/null
  echo "OK"
}

check_redirect() {
  local path="$1"
  local expected_location="$2"
  local label="$3"
  echo -n "GET $path ($label)... "
  local location
  location="$(curl -sI "${BASE_URL}${path}" | awk -F': ' 'tolower($1)=="location" {print $2}' | tr -d '\r')"
  if [[ "$location" != "${BASE_URL}${expected_location}" ]]; then
    echo "FAIL (expected ${BASE_URL}${expected_location}, got ${location:-none})"
    exit 1
  fi
  echo "OK"
}

echo "== HTTP checks =="
check_url "/" "homepage"
check_url "/memorial/samuel-mensah-2026" "seed memorial (Christian example)"
check_url "/memorial/ghana-muslim-example-2026" "seed memorial (Ghana Muslim example)"
check_url "/memorial/samuel-mensah-2026/print" "print page"
check_redirect "/memorial/bannerman-samuel-2026" "/memorial/samuel-mensah-2026" "legacy example slug redirect"
check_url "/privacy" "privacy policy"
echo ""
echo "All smoke checks passed."
