# x402 spend-controls experiments

Experiments for the CPSC 3640 project "Stress-Testing Spend Controls for x402 Payment Agents". They test the spend controls in Coinbase's official x402 client SDK on a testnet (Base Sepolia, test USDC). No real money is used.

## Versions

Node.js 22.19.0, @coinbase/cdp-sdk 1.62.0, @x402/core and @x402/fetch 2.31.0.

## Setup

    npm install @coinbase/cdp-sdk @x402/core @x402/evm @x402/svm @x402/extensions @x402/fetch

Create a CDP API key and Wallet Secret in the CDP portal and export them (never write them into a file):

    export CDP_API_KEY_ID="..."
    export CDP_API_KEY_SECRET="..."
    export CDP_WALLET_SECRET="..."

Print the wallet address with `npx tsx address.ts` and fund it with test USDC (Base Sepolia) from the CDP portal faucet.

## Run

    bash run_all.sh

This takes about five minutes, spends about 0.1 test USDC, and saves every output under `results/<timestamp>/`.

## Experiments

- E1 defaults: `client.ts`
- E2 per-payment cap: `client-limit.ts` (set `CAP`)
- E3 and E4 cumulative cap and restart: `cumulative.ts`
- E5 concurrency: `par2.ts`
- E6 failed payments: `mock.ts` and `ambiguous2.ts`
- E7 asset scope: `mock2.ts` and `asset.ts`
- E8 release after the window: `release.ts`

The mock sellers do not check signatures and do not settle on-chain. Everything uses `environment: "development"` (Base Sepolia). Omitting it would use mainnet, so do not remove it.
