// Cliente do store server-side (fonte da verdade do time, multi-device).
// Token de time + nome do autor ficam no navegador (pedidos 1x).
const TOKEN_KEY = "wolf.publishToken";
const AUTHOR_KEY = "wolf.author";

export function getToken() {
  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = prompt("Token de acesso do painel (pede uma vez, fica salvo):") || "";
    if (t) localStorage.setItem(TOKEN_KEY, (t = t.trim()));
  }
  return (t || "").trim();
}
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

export function getAuthor() {
  let a = localStorage.getItem(AUTHOR_KEY);
  if (!a) {
    a = prompt("Seu nome (aparece em 'criado por' nas propostas):") || "";
    if (a) localStorage.setItem(AUTHOR_KEY, (a = a.trim()));
  }
  return (a || "—").trim();
}

async function call(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json", "x-publish-token": getToken() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) { clearToken(); throw new Error("Token inválido. Tente de novo."); }
  if (!res.ok) throw new Error("Erro " + res.status);
  if (res.status === 204) return null;
  return res.json();
}

export async function listProposals() {
  const out = await call("GET", "/api/proposals");
  return out.items || [];
}
export async function getProposal(id) { return call("GET", "/api/proposals/" + encodeURIComponent(id)); }
export async function saveProposal(data, id, author) {
  const out = await call("POST", "/api/proposals", { proposal: { id, author: author || getAuthor(), data } });
  return out;
}
export async function deleteProposal(id) { return call("DELETE", "/api/proposals/" + encodeURIComponent(id)); }
