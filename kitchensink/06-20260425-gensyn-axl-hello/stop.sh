#!/usr/bin/env bash
# Kill any processes started by start.sh.
cd "$(dirname "$0")"
if [ -f .pids ]; then
  while read -r pid; do
    [ -n "$pid" ] && kill "$pid" 2>/dev/null || true
  done < .pids
  rm -f .pids
fi
# Catch-all in case .pids is stale
pkill -f "axl-bin/node" 2>/dev/null || true
pkill -f "node server.js" 2>/dev/null || true
echo "Stopped."
