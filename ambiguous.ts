import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

const asset = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
let created = 0;
const client = new CdpX402Client({
  environment: "development",
  spendControls: {
    maxAmountPerPayment: { atomic: 10_000n, asset },
    maxCumulativeSpend: { atomic: 25_000n, asset },
    maxCumulativeSpendWindow: "24h",
  },
});
client.onAfterPaymentCreation(async () => { created++; });
const f = wrapFetchWithPayment(globalThis.fetch, client);

for (let i = 1; i <= 6; i++) {
  try {
    const r = await f("http://localhost:4021/item");
    console.log(`#${i} HTTP ${r.status} (payloads created so far: ${created})`);
  } catch (e: any) {
    console.log(`#${i} ${String(e.message).slice(0, 80)} (payloads created so far: ${created})`);
  }
}
