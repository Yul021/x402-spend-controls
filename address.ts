import { CdpX402Client } from "@coinbase/cdp-sdk/x402";

// Prints the address of the CDP-managed wallet used for the experiments (Base Sepolia testnet).
const client = new CdpX402Client({ environment: "development" });
const { evmAddress } = await client.getAddresses();
console.log(evmAddress);
