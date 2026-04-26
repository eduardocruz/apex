#!/usr/bin/env bash
# Clone the AXL source from gensyn-ai/axl and build the `node` binary into
# ./axl-bin/node. Idempotent — skips work if already done.
set -euo pipefail
cd "$(dirname "$0")"

if [ -x ./axl-bin/node ]; then
  echo "axl-bin/node already built — skipping. Delete axl-bin/ to rebuild."
  exit 0
fi

if ! command -v go >/dev/null 2>&1; then
  echo "ERROR: Go not installed. brew install go (need 1.25.5+, but Go's toolchain auto-fetches)."
  exit 1
fi

if [ ! -d axl-src ]; then
  echo "Cloning gensyn-ai/axl..."
  git clone --depth 1 https://github.com/gensyn-ai/axl.git axl-src
fi

mkdir -p axl-bin
echo "Building node binary (Go will auto-fetch toolchain 1.25.5 if needed)..."
( cd axl-src && GOTOOLCHAIN=go1.25.5 go build -o ../axl-bin/node ./cmd/node/ )
echo "Built: $(./axl-bin/node -h 2>&1 | head -1 || echo 'ok')"
ls -lh axl-bin/node
