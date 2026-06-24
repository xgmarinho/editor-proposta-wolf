import { buildExportHtml } from "./exportHtml.js";
import viewerTemplate from "./viewerTemplate.js";
import { getToken, getAuthor, clearToken } from "./serverStore.js";

// Publica a proposta como HTML self-contido + registra no store. Devolve {url, id}.
// O slug vem pronto do chamador (com sufixo aleatório, não-advinhável).
export async function publishProposal(data, slug, id) {
  const token = getToken();
  if (!token) throw new Error("Sem token de acesso.");
  const html = buildExportHtml(viewerTemplate, data);
  const res = await fetch("/api/publish", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-publish-token": token },
    body: JSON.stringify({
      slug, html, id,
      meta: {
        clientName: data?.meta?.clientName,
        presetId: data?.meta?.presetId,
        author: getAuthor(),
        price: data?.proposal?.price?.value,
        data,
      },
    }),
  });
  if (res.status === 401) { clearToken(); throw new Error("Token inválido. Tente de novo."); }
  if (!res.ok) throw new Error("Falha ao publicar (" + res.status + ").");
  return res.json(); // { url, slug, id }
}
