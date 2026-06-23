import { buildExportHtml, slugify } from "./exportHtml.js";
import viewerTemplate from "./viewerTemplate.js";

const TOKEN_KEY = "wolf.publishToken";

function getToken() {
  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = prompt("Token de publicação (pede uma vez, fica salvo neste navegador):") || "";
    if (t) localStorage.setItem(TOKEN_KEY, t.trim());
  }
  return (t || "").trim();
}

// Publica a proposta como HTML self-contido e devolve a URL pública do cliente.
export async function publishProposal(data) {
  const token = getToken();
  if (!token) throw new Error("Sem token de publicação.");
  const slug = slugify(data?.meta?.clientName);
  const html = buildExportHtml(viewerTemplate, data);
  const res = await fetch("/api/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-publish-token": token },
    body: JSON.stringify({ slug, html }),
  });
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    throw new Error("Token inválido. Tente de novo.");
  }
  if (!res.ok) throw new Error("Falha ao publicar (" + res.status + ").");
  const out = await res.json();
  return out.url;
}
