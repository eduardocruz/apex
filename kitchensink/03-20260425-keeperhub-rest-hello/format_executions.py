"""Format KeeperHub executions JSON from stdin into a human-readable table.

Read by watch.sh. Standalone-runnable too:
    ./watch.sh             # the typical entry point
    cat resp.json | python3 format_executions.py
"""

import json
import sys


def main() -> int:
    data = json.loads(sys.stdin.read())
    runs = data if isinstance(data, list) else data.get("data", [])

    if not runs:
        print("(no executions yet — wait a few minutes or click Run in the UI)")
        return 0

    # Oldest first so you can read top-to-bottom in order
    runs.sort(key=lambda r: r.get("startedAt", ""))

    print(f"{len(runs)} execution(s) for workflow:\n")
    header = f"  {'started at':<28}  {'status':<8}  {'duration':>9}  output"
    print(header)
    print("  " + "-" * (len(header) - 2))

    for r in runs:
        when = r.get("startedAt", "?")
        status = r.get("status", "?")
        duration = f"{r.get('duration', '?')}ms"
        out = r.get("output") or {}

        if "balance" in out:
            addr = out.get("address", "?")
            body = f"{float(out['balance']):.6f} ETH for {addr[:10]}…"
        elif r.get("error"):
            body = f"error: {r['error']}"
        else:
            body = json.dumps(out)[:60]

        print(f"  {when:<28}  {status:<8}  {duration:>9}  {body}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
