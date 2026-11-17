#!/usr/bin/env bash
# Runs experiments E1-E8 and saves every output under results/<timestamp>/.
# Usage (from this folder, with the three CDP_* variables exported):  bash run_all.sh
set -u

ASSET="0x036CbD53842c5426634e7929541eC2318f3dCF7e"
TSX="npx --yes tsx"

for v in CDP_API_KEY_ID CDP_API_KEY_SECRET CDP_WALLET_SECRET; do
  if [ -z "${!v:-}" ]; then
    echo "$v is not set. Export it first."
    exit 1
  fi
done

OUT="results/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$OUT"

stop_mocks() {
  for p in 4021 4022; do
    lsof -ti :"$p" 2>/dev/null | xargs kill 2>/dev/null || true
  done
}
trap stop_mocks EXIT
stop_mocks

section() { echo; echo "=== $1 ==="; }

start_mock() { # $1 = script, $2 = mode, $3 = log file name
  MODE="$2" $TSX "$1" > "$OUT/$3" 2>&1 &
  sleep 5
}

{
  echo "date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "node: $(node --version)"
  npm ls @coinbase/cdp-sdk @x402/core @x402/fetch 2>&1
  echo "wallet: $($TSX address.ts 2>/dev/null | tail -n 1)"
} 2>&1 | tee "$OUT/env.txt"

section "E1 defaults (public demo seller, pays 0.01 test USDC)"
$TSX client.ts 2>&1 | tee "$OUT/e1_defaults.txt"

section "E2 per-payment cap boundary"
for cap in 1 9999 10000; do
  CAP=$cap $TSX client-limit.ts 2>&1 | tee -a "$OUT/e2_cap_boundary.txt"
done

section "E3 cumulative cap, one process"
ASSET=$ASSET MODE=seq $TSX cumulative.ts 2>&1 | tee "$OUT/e3_cumulative.txt"

section "E4 restart (same window, new process)"
ASSET=$ASSET MODE=seq $TSX cumulative.ts 2>&1 | tee "$OUT/e4_restart.txt"

section "E5 concurrency"
for i in 1 2 3; do
  ASSET=$ASSET N=5 $TSX par2.ts 2>&1 | tee -a "$OUT/e5_concurrency.txt"
done
ASSET=$ASSET N=10 $TSX par2.ts 2>&1 | tee -a "$OUT/e5_concurrency.txt"

section "start mock sellers (port 4021 returns 502 after a payment, port 4022 asks for another token)"
start_mock mock.ts fail502 mock1_fail502.log
start_mock mock2.ts fail502 mock2.log

section "E6 failed payments (mock returns 502)"
$TSX ambiguous2.ts 2>&1 | tee "$OUT/e6_fail502.txt"

section "E7 asset scope"
ALLOWED=0 $TSX asset.ts 2>&1 | tee "$OUT/e7_asset_scope.txt"
ALLOWED=1 $TSX asset.ts 2>&1 | tee -a "$OUT/e7_asset_scope.txt"

section "E8 release after the window (takes about 40 seconds)"
$TSX release.ts 2>&1 | tee "$OUT/e8_release.txt"

section "E6 variant: mock returns a 402 rejection"
stop_mocks
sleep 2
start_mock mock.ts reject402 mock1_reject402.log
$TSX ambiguous2.ts 2>&1 | tee "$OUT/e6_reject402.txt"

section "done"
echo "Outputs saved in $OUT"
echo "Look up the wallet address from $OUT/env.txt on https://sepolia.basescan.org to compare on-chain transfers with the results."
