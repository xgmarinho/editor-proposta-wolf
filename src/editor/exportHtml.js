export function slugify(name) {
  const s = (name || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return s || "proposta";
}

// Escapa para embutir JSON seguro dentro de <script> (evita fechar a tag).
function safeJson(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

// Injeta a proposta como global ANTES do primeiro <script> do template single-file.
export function buildExportHtml(template, data) {
  const inject = `<script>window.__PROPOSTA__ = ${safeJson(data)};</script>`;
  const i = template.indexOf("<script");
  if (i === -1) return template.replace("</body>", inject + "</body>");
  return template.slice(0, i) + inject + template.slice(i);
}
