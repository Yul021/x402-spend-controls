import http from "node:http";
const OTHER = "0x1111111111111111111111111111111111111111";
const req402 = {
  x402Version: 2, error: "Payment required",
  resource: { url: "http://localhost:4022/other", description: "mock", mimeType: "" },
  accepts: [{
    scheme: "exact", network: "eip155:84532", amount: "5000000", asset: OTHER,
    payTo: "0x000000000000000000000000000000000000dEaD", maxTimeoutSeconds: 300,
    extra: { name: "OtherToken", version: "1" },
  }],
};
http.createServer((rq, rs) => {
  if (!rq.headers["payment-signature"]) {
    rs.writeHead(402, { "payment-required": Buffer.from(JSON.stringify(req402)).toString("base64"), "content-type": "application/json" });
    return rs.end("{}");
  }
  console.log("payment attempt received for", rq.url);
  rs.writeHead(200, { "content-type": "application/json" });
  rs.end('{"ok":true}');
}).listen(4022, () => console.log("mock seller 2 on :4022"));
