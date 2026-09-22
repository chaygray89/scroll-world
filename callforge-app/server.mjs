import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 10000);

const headers = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "microphone=(self), camera=(), geolocation=()",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://esm.run https://esm.sh https://cdn.jsdelivr.net; connect-src 'self' https://esm.run https://esm.sh https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://*.hf.co https://raw.githubusercontent.com https://github.com https://mlc.ai https://*.mlc.ai; media-src 'self' blob: data:; img-src 'self' data: blob:; worker-src 'self' blob:; child-src 'self' blob:; object-src 'none'; frame-ancestors 'none'",
  "Cache-Control": "no-store"
};

function sendJson(res, status, body) {
  res.writeHead(status, {...headers, "Content-Type": "application/json; charset=utf-8"});
  res.end(JSON.stringify(body));
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, {
        ok: true,
        mode: "free-local",
        apiKeyRequired: false,
        paidApiRequired: false
      });
    }

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      const html = await fs.readFile(path.join(DIR, "index.html"));
      res.writeHead(200, {...headers, "Content-Type": "text/html; charset=utf-8"});
      return res.end(html);
    }

    return sendJson(res, 404, {error: "Not found"});
  } catch (error) {
    return sendJson(res, 500, {error: String(error?.message || error)});
  }
});

server.listen(PORT, () => {
  console.log(`CallForge Free listening on ${PORT}`);
});
