import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

const asset = process.env.ASSET!;
const N = Number(process.env.N ?? "5");
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
  try {
    const r = await f("https://x402.vercel.app/protected");
    if (r.status === 200) return `#${i} HTTP 200`;
    const h = r.headers.get("payment-required");
    const reason = h ? JSON.parse(Buffer.from(h, "base64").toString()).error : (await r.text()).slice(0, 200);
    return `#${i} HTTP ${r.status} reason: ${reason}`;
  } catch (e: any) {
    return `#${i} blocked: ${String(e.message).slice(0, 90)}`;
  }
};
console.log((await Promise.all(Array.from({ length: N }, (_, i) => call(i + 1)))).join("\n"));
