// Cliente do catálogo de pacotes (produtos/serviços). Mesmo token/padrão do serverStore.
import { getToken, clearToken } from "./serverStore.js";

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

export const RECORRENCIA_LABEL = {
  unico: "Pagamento único",
  mensal: "Mensal",
  trimestral: "Trimestral",
  anual: "Anual",
};

export async function listPacotes() {
  const out = await call("GET", "/api/pacotes");
  return out.items || [];
}
export async function savePacote(pacote) {
  return call("POST", "/api/pacotes", { pacote });
}
export async function deletePacote(id) {
  return call("DELETE", "/api/pacotes/" + encodeURIComponent(id));
}
