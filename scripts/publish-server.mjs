// Writer + store do editor de orçamentos. Zero dependências.
// Persistência: JSON-file atômico (data/proposals.json) — fonte da verdade do
// time (multi-device). localStorage do navegador vira só cache/rascunho local.
//
// Auth: token de time único (PUBLISH_TOKEN) no header x-publish-token. Todos
// veem todas as propostas. `author` é só atribuição (texto livre), não login.
//
// Endpoints (token, exceto /health, /p tracking):
//   POST   /api/publish            {slug, html, id?, meta?}  -> grava HTML + upsert store
//   GET    /api/proposals                                    -> lista (metadados)
//   GET    /api/proposals/:id                                -> proposta completa
//   POST   /api/proposals          {proposal}                -> upsert (rascunho/edição)
//   DELETE /api/proposals/:id                                -> remove (store + HTML)
//   GET    /api/track/:slug        (sem token)               -> +1 view, status=viewed
//   GET    /health                 (sem token)               -> ok
//   [legado] GET /api/list, POST /api/delete                 -> mantidos
import http from "node:http";
import { writeFile, rename, mkdir, readFile, unlink } from "node:fs/promises";
import { join, dirname } from "node:path";

const PORT = Number(process.env.PORT || 8132);
const TOKEN = process.env.PUBLISH_TOKEN || "";
const OUT_DIR = process.env.OUT_DIR || "/opt/static/orcamento/p";
const DATA_DIR = process.env.DATA_DIR || "/data";
const STORE = join(DATA_DIR, "proposals.json");
const BASE_URL = process.env.BASE_URL || "https://orcamento.wolfpacks.com.br";
const MAX_BYTES = 8 * 1024 * 1024;
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
async function writeAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const tmp = path + ".tmp";
  await writeFile(tmp, content, "utf8");
  await rename(tmp, path);
}

// --- store (serializado: 1 processo, escritas encadeadas) ---------------------
let writeChain = Promise.resolve();
async function loadStore() {
  try { return JSON.parse(await readFile(STORE, "utf8")); }
  catch (e) { if (e.code === "ENOENT") return { proposals: [] }; throw e; }
}
function saveStore(mutator) {
  // encadeia mutações para evitar corrida de leitura-modificação-escrita
  const next = writeChain.then(async () => {
    const db = await loadStore();
    const result = await mutator(db);
    await writeAtomic(STORE, JSON.stringify(db, null, 2));
    return result;
  });
  writeChain = next.catch(() => {}); // não trava a cadeia em erro
  return next;
}
function nowIso() { return new Date().toISOString(); }
function genId() { return "p_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
// metadados expostos na lista (sem o blob `data`, que é pesado)
function meta(p) {
  const { data, ...m } = p; return m;
}

// --- estágio (coluna do kanban) -----------------------------------------------
// Ordem do funil. ganha/perdida = terminais (mesmo rank, não auto-avançam).
const STAGES = ["rascunho", "enviada", "vista", "negociacao", "ganha", "perdida"];
const RANK = { rascunho: 0, enviada: 1, vista: 2, negociacao: 3, ganha: 4, perdida: 4 };
const TERMINAL = new Set(["ganha", "perdida"]);
// estágio efetivo de um registro (deriva de status p/ propostas antigas sem stage)
function stageOf(p) {
  if (p.stage && RANK[p.stage] != null) return p.stage;
  if (p.status === "viewed") return "vista";
  if (p.status === "published") return "enviada";
  return "rascunho";
}
// avança o estágio só pra frente e nunca a partir de um terminal
function bumpStage(p, target) {
  const cur = stageOf(p);
  if (TERMINAL.has(cur)) return;
  if (RANK[target] > RANK[cur]) p.stage = target;
}

// injeta um pixel de tracking no HTML publicado (mesma origem) — registra abertura
function injectTracking(html, slug) {
  const tag = `<script>try{fetch(${JSON.stringify("/api/track/" + slug)},{method:"GET",keepalive:true})}catch(e){}</script>`;
  return html.includes("</body>") ? html.replace("</body>", tag + "</body>") : html + tag;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url || "";

    if (req.method === "GET" && url === "/health") return json(res, 200, { ok: true });

    // tracking de abertura (público, sem token)
    if (req.method === "GET" && url.startsWith("/api/track/")) {
      const slug = decodeURIComponent(url.slice("/api/track/".length)).trim();
      if (SLUG_RE.test(slug)) {
        await saveStore((db) => {
          const p = db.proposals.find((x) => x.slug === slug);
          if (p) { p.views = (p.views || 0) + 1; p.lastViewedAt = nowIso(); if (p.status === "published") p.status = "viewed"; bumpStage(p, "vista"); }
        });
      }
      res.writeHead(204); return res.end();
    }

    // tudo abaixo exige token de time
    if (req.headers["x-publish-token"] !== TOKEN) return json(res, 401, { error: "unauthorized" });

    // lista
    if (req.method === "GET" && url === "/api/proposals") {
      const db = await loadStore();
      // garante `stage` em todo item (deriva de status p/ registros antigos)
      const items = db.proposals.map((p) => ({ ...meta(p), stage: stageOf(p) }))
        .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      return json(res, 200, { count: items.length, items });
    }
    // proposta completa
    if (req.method === "GET" && url.startsWith("/api/proposals/")) {
      const id = decodeURIComponent(url.slice("/api/proposals/".length));
      const db = await loadStore();
      const p = db.proposals.find((x) => x.id === id);
      return p ? json(res, 200, p) : json(res, 404, { error: "não existe" });
    }
    // upsert (rascunho/edição) — não publica
    if (req.method === "POST" && url === "/api/proposals") {
      const body = await readBody(req);
      const inc = body?.proposal;
      if (!inc || typeof inc !== "object" || !inc.data) return json(res, 400, { error: "proposal inválida" });
      const saved = await saveStore((db) => {
        let p = inc.id && db.proposals.find((x) => x.id === inc.id);
        if (!p) { p = { id: inc.id || genId(), createdAt: nowIso(), views: 0, status: "draft", stage: "rascunho" }; db.proposals.push(p); }
        p.clientName = inc.data?.meta?.clientName || p.clientName || "Sem nome";
        p.presetId = inc.data?.meta?.presetId || p.presetId || null;
        p.author = inc.author || p.author || "—";
        p.price = inc.data?.proposal?.price?.value ?? p.price ?? null;
        p.slug = inc.data?.meta?.shareSlug || p.slug || null;
        p.data = inc.data;
        p.updatedAt = nowIso();
        return meta(p);
      });
      return json(res, 200, saved);
    }
    // PATCH parcial: estágio (drag do kanban) + campos de CRM
    if (req.method === "PATCH" && url.startsWith("/api/proposals/")) {
      const id = decodeURIComponent(url.slice("/api/proposals/".length));
      const body = await readBody(req);
      if (body.stage != null && !STAGES.includes(body.stage)) return json(res, 400, { error: "stage inválido" });
      const saved = await saveStore((db) => {
        const p = db.proposals.find((x) => x.id === id);
        if (!p) return null;
        // drag manual seta estágio direto (inclusive regredir/terminal) — diferente do auto-avanço
        if (body.stage != null) p.stage = body.stage;
        if (body.contact != null) p.contact = String(body.contact).slice(0, 120);
        if (body.notes != null) p.notes = String(body.notes).slice(0, 4000);
        if (body.nextAction !== undefined) p.nextAction = body.nextAction; // {text, date} ou null
        if (body.lostReason != null) p.lostReason = String(body.lostReason).slice(0, 300);
        p.updatedAt = nowIso();
        return meta(p);
      });
      return saved ? json(res, 200, saved) : json(res, 404, { error: "não existe" });
    }

    // delete (store + HTML publicado)
    if (req.method === "DELETE" && url.startsWith("/api/proposals/")) {
      const id = decodeURIComponent(url.slice("/api/proposals/".length));
      const r = await saveStore((db) => {
        const i = db.proposals.findIndex((x) => x.id === id);
        if (i === -1) return null;
        const [p] = db.proposals.splice(i, 1); return p;
      });
      if (!r) return json(res, 404, { error: "não existe" });
      if (r.slug) { try { await unlink(join(OUT_DIR, r.slug + ".html")); } catch {} }
      return json(res, 200, { ok: true, id });
    }

    // PUBLICAR: grava HTML + marca no store
    if (req.method === "POST" && url === "/api/publish") {
      const body = await readBody(req);
      const slug = String(body?.slug || "").trim();
      const html = body?.html;
      if (!SLUG_RE.test(slug)) return json(res, 400, { error: "slug inválido" });
      if (typeof html !== "string" || !html.includes("<html")) return json(res, 400, { error: "html inválido" });
      await writeAtomic(join(OUT_DIR, slug + ".html"), injectTracking(html, slug));
      const out = await saveStore((db) => {
        let p = body.id && db.proposals.find((x) => x.id === body.id);
        if (!p) p = db.proposals.find((x) => x.slug === slug);
        if (!p) { p = { id: body.id || genId(), createdAt: nowIso(), views: 0 }; db.proposals.push(p); }
        const m = body.meta || {};
        p.slug = slug;
        p.clientName = m.clientName || p.clientName || "Sem nome";
        p.presetId = m.presetId || p.presetId || null;
        p.author = m.author || p.author || "—";
        p.price = m.price ?? p.price ?? null;
        if (m.data) p.data = m.data;
        p.status = "published";
        bumpStage(p, "enviada");
        p.publishedAt = nowIso();
        p.updatedAt = nowIso();
        return meta(p);
      });
      return json(res, 200, { url: `${BASE_URL}/p/${slug}`, slug, id: out.id });
    }

    // legado
    if (req.method === "GET" && url === "/api/list") {
      const db = await loadStore();
      const items = db.proposals.filter((p) => p.slug).map((p) => ({ slug: p.slug, url: `${BASE_URL}/p/${p.slug}`, mtime: p.publishedAt || p.updatedAt }));
      return json(res, 200, { count: items.length, items });
    }
    if (req.method === "POST" && url === "/api/delete") {
      const body = await readBody(req);
      const slug = String(body?.slug || "").trim();
      if (!SLUG_RE.test(slug)) return json(res, 400, { error: "slug inválido" });
      try { await unlink(join(OUT_DIR, slug + ".html")); }
      catch (e) { if (e.code === "ENOENT") return json(res, 404, { error: "não existe" }); throw e; }
      await saveStore((db) => { const p = db.proposals.find((x) => x.slug === slug); if (p) { p.slug = null; p.status = "draft"; } });
      return json(res, 200, { ok: true, slug });
    }

    return json(res, 404, { error: "not found" });
  } catch (e) {
    return json(res, e.code === 413 ? 413 : (e.code === 400 ? 400 : 500), { error: e.message || "erro" });
  }
});

const BIND = process.env.BIND || "0.0.0.0";
server.listen(PORT, BIND, () => console.log(`publish-server on ${BIND}:${PORT} → out=${OUT_DIR} store=${STORE}`));
