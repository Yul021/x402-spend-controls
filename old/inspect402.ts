const r = await fetch("https://x402.vercel.app/protected");
console.log("status", r.status, [...r.headers.keys()].join(","));
const h = r.headers.get("payment-required");
if (h) console.log(JSON.stringify(JSON.parse(Buffer.from(h, "base64").toString()), null, 2));
else console.log("body:", (await r.text()).slice(0, 1500));
