#!/usr/bin/env bash
# Start two AXL nodes (A: listener on tls://127.0.0.1:9001, B: peers to A) and
# the local proxy/UI server on http://localhost:5959.
#
# All processes run in the background; PIDs are written to .pids. Use stop.sh
# to tear everything down.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -x ./axl-bin/node ]; then
  echo "axl-bin/node missing — run ./install.sh first."
  exit 1
fi

# Generate persistent ed25519 identities once
[ -f private-a.pem ] || openssl genpkey -algorithm ed25519 -out private-a.pem
[ -f private-b.pem ] || openssl genpkey -algorithm ed25519 -out private-b.pem

# Stop anything left over from a previous run
./stop.sh 2>/dev/null || true
sleep 0.5

echo "Starting node A (listener on tls://127.0.0.1:9001, api 9002)..."
./axl-bin/node -config node-config-a.json > node-a.log 2>&1 &
PID_A=$!
echo "$PID_A" > .pids

# Wait for A's API to come up
for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:9002/topology >/dev/null 2>&1; then break; fi
  sleep 0.3
done

echo "Starting node B (peers to A, api 9012)..."
./axl-bin/node -config node-config-b.json > node-b.log 2>&1 &
PID_B=$!
echo "$PID_B" >> .pids

for i in $(seq 1 30); do
  if curl -sf http://127.0.0.1:9012/topology >/dev/null 2>&1; then break; fi
  sleep 0.3
done

echo "Starting proxy/UI server on http://localhost:5959..."
node server.js &
PID_S=$!
echo "$PID_S" >> .pids

echo ""
echo "Ready: open http://localhost:5959"
echo "Tail logs:   tail -f node-a.log node-b.log"
echo "Stop:        ./stop.sh"
wait
