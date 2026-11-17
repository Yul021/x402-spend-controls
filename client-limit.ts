import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

const cap = BigInt(process.env.CAP ?? "10000");
const client = new CdpX402Client({
  environment: "development",
  spendControls: { maxAmountPerPayment: { atomic: cap } },
});
const fetchWithPayment = wrapFetchWithPayment(globalThis.fetch, client);

try {
  const response = await fetchWithPayment("https://x402.vercel.app/protected");
  console.log(`cap=${cap} -> HTTP ${response.status}`);
} catch (e: any) {
  console.log(`cap=${cap} -> blocked/error:`, e.message);
  console.log("cause:", e.cause?.code ?? e.cause?.message ?? "none");
}
