import { CdpX402Client } from "@coinbase/cdp-sdk/x402";
import { wrapFetchWithPayment } from "@x402/fetch";

// "development" uses the Base testnet. Omit it to use Base mainnet.
const client = new CdpX402Client({ environment: "development" });

const { evmAddress } = await client.getAddresses();
console.log(`Paying from ${evmAddress}`);

const fetchWithPayment = wrapFetchWithPayment(globalThis.fetch, client);
const response = await fetchWithPayment("https://x402.vercel.app/protected");

console.log(`HTTP ${response.status}`);
