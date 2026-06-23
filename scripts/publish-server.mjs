// Writer service do editor de orçamentos. Recebe {slug, html}, valida token,
// grava o HTML self-contido em OUT_DIR/<slug>.html. Zero dependências.
// Roda no HOST (systemd), atrás do Caddy em /api/publish. Bind só loopback.
import http from "node:http";
import { writeFile, rename, mkdir } from "node:fs/promises";
import { join } from "node:path";

const PORT = Number(process.env.PORT || 8132);
const TOKEN = process.env.PUBLISH_TOKEN || "";
const OUT_DIR = process.env.OUT_DIR || "/opt/static/orcamento/p";
const BASE_URL = process.env.BASE_URL || "https://orcamento.wolfpacks.com.br";
const MAX_BYTES = 8 * 1024 * 1024; // 8MB (HTML com imagens base64)
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,60}$/;

if (!TOKEN) { console.error("PUBLISH_TOKEN ausente"); process.exit(1); }

function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/api/publish") return json(res, 404, { error: "not found" });
  if (req.headers["x-publish-token"] !== TOKEN) return json(res, 401, { error: "unauthorized" });

  let size = 0;
  const chunks = [];
  req.on("data", (c) => {
    size += c.length;
    if (size > MAX_BYTES) { json(res, 413, { error: "too large" }); req.destroy(); return; }
    chunks.push(c);
  });
  req.on("end", async () => {
    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { return json(res, 400, { error: "json inválido" }); }
    const slug = String(body?.slug || "").trim();
    const html = body?.html;
    if (!SLUG_RE.test(slug)) return json(res, 400, { error: "slug inválido" });
    if (typeof html !== "string" || !html.includes("<html")) return json(res, 400, { error: "html inválido" });
    try {
      await mkdir(OUT_DIR, { recursive: true });
      const dest = join(OUT_DIR, slug + ".html");
      const tmp = dest + ".tmp";
      await writeFile(tmp, html, "utf8");
      await rename(tmp, dest); // grava atômico
      return json(res, 200, { url: `${BASE_URL}/p/${slug}`, slug });
    } catch (e) {
      return json(res, 500, { error: "falha ao gravar" });
    }
  });
});

// Bind 0.0.0.0 DENTRO do container (Docker faz o proxy); o mapeamento de host
// é 127.0.0.1:8132 no compose, então a exposição externa segue só loopback.
const BIND = process.env.BIND || "0.0.0.0";
server.listen(PORT, BIND, () => console.log(`publish-server on ${BIND}:${PORT} → ${OUT_DIR}`));
