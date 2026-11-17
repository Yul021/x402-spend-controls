import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

const asset = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
let created = 0;
const client = new CdpX402Client({
  environment: "development",
  spendControls: {
    maxAmountPerPayment: { atomic: 10_000n, asset },
    maxCumulativeSpend: { atomic: 25_000n, asset },
    maxCumulativeSpendWindow: "30s",
  },
});
client.onAfterPaymentCreation(async () => { created++; });
const f = wrapFetchWithPayment(globalThis.fetch, client);
const t0 = Date.now();
const sec = () => Math.round((Date.now() - t0) / 1000);

const call = async (label: string, url: string) => {
  try {
    const r = await f(url);
    console.log(`${sec()}s ${label}: HTTP ${r.status} (authorizations so far: ${created})`);
  } catch (e: any) {
    console.log(`${sec()}s ${label}: ${String(e.message).slice(0, 70)} (authorizations so far: ${created})`);
  }
};

await call("bad seller #1", "http://localhost:4021/item");
await call("bad seller #2", "http://localhost:4021/item");
await call("honest seller (budget used up?)", "http://localhost:4021/good");
await new Promise(r => setTimeout(r, 35_000));
await call("honest seller after 35s", "http://localhost:4021/good");
