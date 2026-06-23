const DRAFT_KEY = "wolf:draft";
const COPIES_KEY = "wolf:copies";

function defaultStore() {
  return typeof localStorage !== "undefined" ? localStorage : null;
}

// id estável sem depender de Date.now()/Math.random() proibidos no harness de plano:
// usa crypto.randomUUID quando existir, senão um contador derivado da lista.
function newId(existing) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const n = existing.reduce((max, c) => Math.max(max, Number(c.id) || 0), 0) + 1;
  return String(n);
}
function stamp() {
  return typeof Date !== "undefined" ? new Date().toISOString() : "";
}

export function saveDraft(data, store = defaultStore()) {
  store.setItem(DRAFT_KEY, JSON.stringify(data));
}
export function loadDraft(store = defaultStore()) {
  const raw = store && store.getItem(DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}
export function listCopies(store = defaultStore()) {
  const raw = store && store.getItem(COPIES_KEY);
  return raw ? JSON.parse(raw) : [];
}
function writeCopies(list, store) {
  store.setItem(COPIES_KEY, JSON.stringify(list));
}
export function saveCopy(name, data, store = defaultStore()) {
  const list = listCopies(store);
  const copy = { id: newId(list), name, updatedAt: stamp(), data: JSON.parse(JSON.stringify(data)) };
  writeCopies([...list, copy], store);
  return copy;
}
export function loadCopy(id, store = defaultStore()) {
  return listCopies(store).find((c) => c.id === id) || null;
}
export function duplicateCopy(id, store = defaultStore()) {
  const src = loadCopy(id, store);
  if (!src) return null;
  return saveCopy(src.name + " (cópia)", src.data, store);
}
export function deleteCopy(id, store = defaultStore()) {
  writeCopies(listCopies(store).filter((c) => c.id !== id), store);
}
export function exportJson(data) {
  return JSON.stringify(data, null, 2);
}
export function importJson(text) {
  return JSON.parse(text);
}
