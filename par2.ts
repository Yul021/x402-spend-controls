import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

const asset = process.env.ASSET!;
const N = Number(process.env.N ?? "5");
const t0 = Date.now();
const log: string[] = [];
let created = 0;

const client = new CdpX402Client({
  environment: "development",
  spendControls: {
    maxAmountPerPayment: { atomic: 10_000n, asset },
    maxCumulativeSpend: { atomic: 25_000n, asset },
    maxCumulativeSpendWindow: "24h",
  },
});
client.onAfterPaymentCreation(async () => {
  created++;
  log.push(`${Date.now() - t0}ms payload created`);
});

const f = wrapFetchWithPayment(globalThis.fetch, client);
const call = async (i: number) => {
  try {
    const r = await f("https://x402.vercel.app/protected", { signal: AbortSignal.timeout(30000) });
    return `#${i} HTTP ${r.status}`;
  } catch (e: any) {
    return `#${i} ${String(e.message).slice(0, 70)}`;
  }
};
const results = await Promise.all(Array.from({ length: N }, (_, i) => call(i + 1)));
console.log(results.join("\n"));
console.log(log.join("\n"));
console.log(`payloads created: ${created} (the cap allows at most 2)`);
