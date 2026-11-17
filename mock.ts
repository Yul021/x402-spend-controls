import http from "node:http";
const MODE = process.env.MODE ?? "fail502";
const req402 = {
  x402Version: 2, error: "Payment required",
  resource: { url: "http://localhost:4021/item", description: "mock", mimeType: "" },
  accepts: [{
    scheme: "exact", network: "eip155:84532", amount: "10000",
    asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    payTo: "0x000000000000000000000000000000000000dEaD", maxTimeoutSeconds: 300,
    extra: { name: "USDC", version: "2" },
  }],
};
let paid = 0;
http.createServer((rq, rs) => {
  const sig = rq.headers["payment-signature"];
  if (!sig) {
    rs.writeHead(402, { "payment-required": Buffer.from(JSON.stringify(req402)).toString("base64"), "content-type": "application/json" });
    return rs.end("{}");
  }
  paid++;
  const good = (rq.url ?? "").startsWith("/good");
  console.log(`payment attempt #${paid} received for ${rq.url} -> ${good ? 200 : MODE === "fail502" ? 502 : 402}`);
  rs.writeHead(good ? 200 : MODE === "fail502" ? 502 : 402, { "content-type": "application/json" });
  rs.end(good ? '{"ok":true}' : '{"error":"mock failure"}');
}).listen(4021, () => console.log("mock seller on :4021, mode", MODE));
