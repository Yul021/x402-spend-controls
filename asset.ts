import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

const usdc = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const allow = process.env.ALLOWED === "1";
let created = 0;
const client = new CdpX402Client({
  environment: "development",
  spendControls: {
    maxAmountPerPayment: { atomic: 10_000n, asset: usdc },
    maxCumulativeSpend: { atomic: 25_000n, asset: usdc },
    maxCumulativeSpendWindow: "24h",
    ...(allow ? { allowedAssets: [usdc] } : {}),
  },
});
client.onAfterPaymentCreation(async () => { created++; });
const f = wrapFetchWithPayment(globalThis.fetch, client);
try {
  const r = await f("http://localhost:4022/other");
  console.log(`ALLOWED=${allow}: HTTP ${r.status}, authorizations created: ${created}`);
} catch (e: any) {
  console.log(`ALLOWED=${allow}: ${String(e.message).slice(0, 140)}, authorizations created: ${created}`);
}
