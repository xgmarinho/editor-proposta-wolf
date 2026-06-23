// Writer service do editor de orçamentos. Endpoints (token, exceto /health):
//   POST /api/publish {slug, html}  -> grava <slug>.html, devolve url
//   GET  /api/list                  -> lista propostas publicadas
//   POST /api/delete  {slug}        -> remove <slug>.html
//   GET  /health                    -> ok (sem token, p/ healthcheck)
// Zero dependências. Roda no HOST (container), atrás do Caddy. Bind loopback no host.
import http from "node:http";
import { writeFile, rename, mkdir, readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";

const PORT = Number(process.env.PORT || 8132);
const TOKEN = process.env.PUBLISH_TOKEN || "";
const OUT_DIR = process.env.OUT_DIR || "/opt/static/orcamento/p";
const BASE_URL = process.env.BASE_URL || "https://orcamento.wolfpacks.com.br";
const MAX_BYTES = 8 * 1024 * 1024; // 8MB (HTML com imagens base64)
const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,70}$/;

if (!TOKEN) { console.error("PUBLISH_TOKEN ausente"); process.exit(1); }

function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BYTES) { reject(Object.assign(new Error("too large"), { code: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); }
      catch { reject(Object.assign(new Error("json inválido"), { code: 400 })); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") return json(res, 200, { ok: true });

    // tudo abaixo exige token
    if (req.headers["x-publish-token"] !== TOKEN) return json(res, 401, { error: "unauthorized" });

    if (req.method === "POST" && req.url === "/api/publish") {
      const body = await readBody(req);
      const slug = String(body?.slug || "").trim();
      const html = body?.html;
      if (!SLUG_RE.test(slug)) return json(res, 400, { error: "slug inválido" });
      if (typeof html !== "string" || !html.includes("<html")) return json(res, 400, { error: "html inválido" });
      await mkdir(OUT_DIR, { recursive: true });
      const dest = join(OUT_DIR, slug + ".html");
      const tmp = dest + ".tmp";
      await writeFile(tmp, html, "utf8");
      await rename(tmp, dest); // grava atômico
      return json(res, 200, { url: `${BASE_URL}/p/${slug}`, slug });
    }

    if (req.method === "GET" && req.url === "/api/list") {
      let files = [];
      try { files = await readdir(OUT_DIR); } catch { files = []; }
      const items = [];
      for (const f of files) {
        if (!f.endsWith(".html")) continue;
        const slug = f.slice(0, -5);
        let mtime = null;
        try { mtime = (await stat(join(OUT_DIR, f))).mtime.toISOString(); } catch {}
        items.push({ slug, url: `${BASE_URL}/p/${slug}`, mtime });
      }
      items.sort((a, b) => (b.mtime || "").localeCompare(a.mtime || ""));
      return json(res, 200, { count: items.length, items });
    }

    if (req.method === "POST" && req.url === "/api/delete") {
      const body = await readBody(req);
      const slug = String(body?.slug || "").trim();
      if (!SLUG_RE.test(slug)) return json(res, 400, { error: "slug inválido" });
      try { await unlink(join(OUT_DIR, slug + ".html")); }
      catch (e) { if (e.code === "ENOENT") return json(res, 404, { error: "não existe" }); throw e; }
      return json(res, 200, { ok: true, slug });
    }

    return json(res, 404, { error: "not found" });
  } catch (e) {
    return json(res, e.code === 413 ? 413 : (e.code === 400 ? 400 : 500), { error: e.message || "erro" });
  }
});

// Bind 0.0.0.0 DENTRO do container (Docker faz o proxy); o mapeamento de host
// é 127.0.0.1:8132 no compose, então a exposição externa segue só loopback.
const BIND = process.env.BIND || "0.0.0.0";
server.listen(PORT, BIND, () => console.log(`publish-server on ${BIND}:${PORT} → ${OUT_DIR}`));
