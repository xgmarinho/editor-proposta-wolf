// Helpers de edição imutável da proposta. Sem dependências externas.
export function cloneProposal(p) {
  return JSON.parse(JSON.stringify(p));
}

export function setIn(obj, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const copy = Array.isArray(obj) ? obj.slice() : { ...obj };
  copy[head] = setIn(obj[head], rest, value);
  return copy;
}

function getIn(obj, path) {
  return path.reduce((acc, k) => acc[k], obj);
}

export function addItem(obj, path, item) {
  const arr = getIn(obj, path);
  return setIn(obj, path, [...arr, item]);
}

export function removeItem(obj, path, index) {
  const arr = getIn(obj, path);
  return setIn(obj, path, arr.filter((_, i) => i !== index));
}

// Itens vazios por tipo de bloco repetível.
const EMPTY = {
  card: () => ({ title: "", body: "" }),
  channel: () => ({ icon: "Star", title: "", lines: [{ qty: "", label: "" }] }),
  line: () => ({ qty: "", label: "" }),
  button: () => ({ icon: "Star", label: "" }),
  strategyCard: () => ({ icon: "Star", title: "", body: "" }),
  step: () => ({ num: "", title: "", body: "", isFinal: false }),
  checklist: () => "",
  need: () => "",
  person: () => ({ icon: "Star", qty: "×1", role: "", body: "" }),
  included: () => "",
  image: () => "",
};

export function emptyItem(type) {
  const make = EMPTY[type];
  if (!make) throw new Error(`emptyItem: tipo desconhecido "${type}"`);
  return make();
}

// Quebra um título em segmentos { text, strong } destacando a primeira ocorrência
// de `strong`. Alimenta o WordReveal sem mudar a animação.
export function splitHeading(text, strong) {
  if (!strong) return [{ text, strong: false }];
  const i = text.indexOf(strong);
  if (i === -1) return [{ text, strong: false }];
  const segs = [];
  if (i > 0) segs.push({ text: text.slice(0, i), strong: false });
  segs.push({ text: strong, strong: true });
  const after = text.slice(i + strong.length);
  if (after) segs.push({ text: after, strong: false });
  return segs;
}
