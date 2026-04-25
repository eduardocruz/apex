#!/usr/bin/env bash
# watch.sh — list KeeperHub workflow executions, formatted.
#
# Usage:  ./watch.sh
# Reads KEEPERHUB_API_KEY and KEEPERHUB_WORKFLOW_ID from ./.env
#
# What this proves: each line printed below corresponds to one execution
# that KeeperHub ran in their cloud — your laptop did not have to be on,
# this terminal did not have to be open. The workflow is scheduled and
# runs autonomously.

set -euo pipefail

cd "$(dirname "$0")"

# Load env
set -a
# shellcheck disable=SC1091
source .env
set +a

: "${KEEPERHUB_API_KEY:?missing in .env}"
: "${KEEPERHUB_WORKFLOW_ID:?missing in .env}"

URL="https://app.keeperhub.com/api/workflows/${KEEPERHUB_WORKFLOW_ID}/executions"

curl -sS --max-time 15 \
  -H "Authorization: Bearer ${KEEPERHUB_API_KEY}" \
  "${URL}" \
  | python3 format_executions.py
