import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

const asset = process.env.ASSET!;
const client = new CdpX402Client({
  environment: "development",
  spendControls: {
    maxAmountPerPayment: { atomic: 10_000n, asset },
    maxCumulativeSpend: { atomic: 25_000n, asset },
    maxCumulativeSpendWindow: "24h",
  },
});
const f = wrapFetchWithPayment(globalThis.fetch, client);
const call = async (i: number) => {
  try { const r = await f("https://x402.vercel.app/protected"); return `#${i} HTTP ${r.status}`; }
  catch (e: any) { return `#${i} blocked: ${e.message}`; }
};

if (process.env.MODE === "par") console.log((await Promise.all([1, 2, 3, 4, 5].map(call))).join("\n"));
else for (let i = 1; i <= 4; i++) console.log(await call(i));
