# Painel Editor da Proposta Wolf® — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a proposta (hoje hardcoded em `src/main.jsx`) num editor visual split-view onde a equipe edita uma cópia da base imutável e exporta HTML autocontido, com persistência em localStorage + import/export `.json`.

**Architecture:** Um renderizador compartilhado (`src/render/`) desenha a proposta a partir de um objeto `data`. O editor (`src/editor/`) mostra esse renderizador num iframe (preview ao vivo via React portal) ao lado de um formulário schema-driven. O viewer (`src/viewer/`) é buildado como HTML single-file e serve de template para o export. A base (`baseProposal`) é constante somente-leitura; toda edição é uma cópia.

**Tech Stack:** React 19, Vite 7 (esbuild classic JSX — todo `.jsx` importa React), motion 12, @phosphor-icons/react, vite-plugin-singlefile (novo), vitest (novo, para lógica pura).

---

## Notas para o executor

- **Ambiente:** Windows + PowerShell/Bash. Prefixe TODO comando de terminal com `rtk` (regra do CLAUDE.md). Em chains `&&`, cada comando leva `rtk`.
- **JSX classic:** não existe `vite.config` com plugin React. O esbuild usa transform classic → **todo arquivo `.jsx` DEVE `import React`**. Não introduza runtime automático.
- **Sem regressão visual:** a proposta renderizada a partir de `baseProposal` tem que ficar idêntica à atual. A verificação é por screenshots (Fase 2).
- **Diretório de trabalho:** `C:/Users/Windows 10/Documents/Codex/2026-06-22/o-qu/work/proposta-wolf-claude`.
- **Commits:** o projeto não é repo próprio hoje (vive dentro do repo da home, git-ignored). **Task 0.1 inicia um repo git local** neste diretório para que os commits do plano funcionem isoladamente.

---

## Estrutura de arquivos (decisões de decomposição)

**Criar:**
- `vite.config.js` — config base (mantém esbuild classic; registra alias se preciso).
- `vite.viewer.config.js` — build single-file do viewer (plugin singlefile).
- `vitest.config.js` — config de testes (jsdom).
- `src/data/iconRegistry.js` — mapa `nome → componente Phosphor` + lista de nomes.
- `src/data/iconRegistry.test.js`
- `src/data/baseProposal.js` — a base imutável (todo o conteúdo extraído do `main.jsx`).
- `src/data/baseProposal.test.js`
- `src/data/proposalOps.js` — helpers imutáveis (add/remove/update item, empty item, splitHeading).
- `src/data/proposalOps.test.js`
- `src/render/motion.jsx` — primitivas de motion (Reveal, CountUp, StaggerList, WordReveal, StackList, Timeline) + constantes (EASE, listItem...).
- `src/render/sections.jsx` — seções (Hero, Marquee, Overview, Scope, Materials, Strategy, StartSection, Team, Proposal, Footer, Brand, SectionPill) lendo de `data`.
- `src/render/ProposalDocument.jsx` — monta `<main>` com todas as seções a partir de `data`.
- `src/viewer/main.jsx` — entry do viewer: renderiza `ProposalDocument` de `window.__PROPOSTA__ ?? baseProposal`.
- `viewer.html` — html entry do viewer.
- `scripts/embed-viewer.mjs` — lê o HTML buildado do viewer e gera `src/editor/viewerTemplate.js`.
- `src/editor/viewerTemplate.js` — **gerado** (string do HTML single-file). Não editar à mão.
- `src/editor/storage.js` — persistência (draft, cópias, import/export json).
- `src/editor/storage.test.js`
- `src/editor/exportHtml.js` — `buildExportHtml(template, data)` + `slugify`.
- `src/editor/exportHtml.test.js`
- `src/editor/formSchema.js` — descrição declarativa dos campos editáveis por seção.
- `src/editor/fields.jsx` — inputs genéricos (TextField, TextArea, NumberField, ImageDrop, IconPicker, RepeatableList).
- `src/editor/SectionForm.jsx` — renderiza uma seção do schema.
- `src/editor/Preview.jsx` — iframe + React portal + injeção de CSS.
- `src/editor/TopBar.jsx` — barra de ações.
- `src/editor/SavedPanel.jsx` — lista de propostas salvas.
- `src/editor/EditorApp.jsx` — split view + estado + autosave.
- `src/editor/editor.css` — estilos do cromo do editor (NÃO da proposta).

**Modificar:**
- `package.json` — deps (vite-plugin-singlefile, vitest, jsdom, @testing-library/react opcional) + scripts.
- `src/main.jsx` — passa a ser o entry do **editor** (renderiza `EditorApp`). O conteúdo antigo migra para `render/` + `data/`.
- `src/styles.css` — inalterado (importado como `?inline` para injeção no iframe).
- `index.html` — inalterado (já aponta `/src/main.jsx`).

**Não tocar:** `scripts/qa-screenshots.mjs` (reusar para verificação).

---

## Fase 0 — Tooling

### Task 0.1: Repo git local + dependências + config base

**Files:**
- Create: `vite.config.js`, `vitest.config.js`
- Modify: `package.json`

- [ ] **Step 1: Inicializar repo git local, .gitignore e baseline**

Crie `.gitignore` (raiz do projeto) ANTES do baseline para não rastrear artefatos:

```
node_modules
dist
viewer-dist
```

Depois:

```bash
rtk git init && rtk git add -A && rtk git commit -m "chore: baseline antes do editor"
```

Expected: cria `.git` local e um commit inicial sem `node_modules`/`dist`.

- [ ] **Step 2: Instalar dependências**

```bash
rtk npm install -D vite-plugin-singlefile vitest jsdom
```

Expected: adiciona as 3 devDependencies sem erro.

- [ ] **Step 3: Criar `vite.config.js`**

```js
import { defineConfig } from "vite";

// Mantém o transform JSX classic do esbuild (todo .jsx importa React).
// Sem plugin React aqui de propósito — não mudar para runtime automático.
export default defineConfig({
  server: { host: "127.0.0.1" },
});
```

- [ ] **Step 4: Criar `vitest.config.js`**

```js
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{js,jsx}"],
  },
});
```

- [ ] **Step 5: Adicionar scripts ao `package.json`**

Adicione em `"scripts"` (mantendo os existentes):

```json
    "test": "vitest run",
    "build:viewer": "vite build --config vite.viewer.config.js && node scripts/embed-viewer.mjs"
```

- [ ] **Step 6: Verificar que o dev server ainda sobe**

```bash
rtk npm run build
```

Expected: build conclui sem erro (`✓ built in ...`).

- [ ] **Step 7: Commit**

```bash
rtk git add -A && rtk git commit -m "chore: vite config + vitest + singlefile dep"
```

---

## Fase 1 — Modelo de dados (TDD, funções puras)

### Task 1.1: Registro de ícones

**Files:**
- Create: `src/data/iconRegistry.js`
- Test: `src/data/iconRegistry.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { iconRegistry, iconNames, getIcon } from "./iconRegistry";

// Ícones do @phosphor-icons/react v2 são componentes forwardRef (objetos),
// não funções — então validamos "é um tipo de componente React válido".
const isComponent = (c) => c != null && (typeof c === "function" || typeof c === "object");

describe("iconRegistry", () => {
  it("expõe todos os ícones usados pela proposta", () => {
    const required = [
      "ArrowUpRight", "InstagramLogo", "TiktokLogo", "XLogo", "LinkedinLogo",
      "FolderSimple", "EnvelopeSimple", "SquaresFour", "Buildings",
      "CalendarBlank", "UsersThree", "PencilSimpleLine", "VideoCamera",
    ];
    for (const name of required) {
      expect(isComponent(iconRegistry[name]), `falta ${name}`).toBe(true);
    }
  });
  it("iconNames lista as chaves do registro", () => {
    expect(iconNames).toEqual(Object.keys(iconRegistry));
  });
  it("getIcon faz fallback para um ícone válido com nome desconhecido", () => {
    expect(isComponent(getIcon("NaoExiste"))).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

```bash
rtk npx vitest run src/data/iconRegistry.test.js
```

Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `src/data/iconRegistry.js`**

```jsx
import {
  ArrowUpRight, BoundingBox, Buildings, CalendarBlank, CaretDown, Check,
  Cursor, EnvelopeSimple, FolderSimple, InstagramLogo, LinkedinLogo, Notepad,
  PenNib, PencilSimpleLine, Square, SquaresFour, TiktokLogo, UsersThree,
  VideoCamera, WarningCircle, XLogo, MegaphoneSimple, ChartLineUp, Star,
  Lightning, Palette, Globe, Camera, Microphone, ChatCircle,
} from "@phosphor-icons/react";

// Ícones expostos ao seletor do editor. Nome (string) é o que vai no JSON.
export const iconRegistry = {
  ArrowUpRight, BoundingBox, Buildings, CalendarBlank, CaretDown, Check,
  Cursor, EnvelopeSimple, FolderSimple, InstagramLogo, LinkedinLogo, Notepad,
  PenNib, PencilSimpleLine, Square, SquaresFour, TiktokLogo, UsersThree,
  VideoCamera, WarningCircle, XLogo, MegaphoneSimple, ChartLineUp, Star,
  Lightning, Palette, Globe, Camera, Microphone, ChatCircle,
};

export const iconNames = Object.keys(iconRegistry);

export function getIcon(name) {
  return iconRegistry[name] || iconRegistry.Square;
}
```

- [ ] **Step 4: Rodar para ver passar**

```bash
rtk npx vitest run src/data/iconRegistry.test.js
```

Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(data): registro de ícones + seletor"
```

---

### Task 1.2: Base imutável (`baseProposal`)

Extrai TODO o conteúdo hoje hardcoded em `src/main.jsx` para um objeto. Os literais devem bater exatamente com os atuais (textos, números, ícones por nome, `\n` em cargos).

**Files:**
- Create: `src/data/baseProposal.js`
- Test: `src/data/baseProposal.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
import { describe, it, expect } from "vitest";
import { baseProposal } from "./baseProposal";

describe("baseProposal", () => {
  it("tem as seções esperadas", () => {
    for (const k of ["meta","hero","marquee","overview","scope","materials","strategy","start","team","proposal"]) {
      expect(baseProposal[k], `falta seção ${k}`).toBeTruthy();
    }
  });
  it("mantém os números-chave da proposta atual", () => {
    expect(baseProposal.scope.metric.value).toBe(152);
    expect(baseProposal.materials.metric.value).toBe(4);
    expect(baseProposal.team.metric.value).toBe(6);
    expect(baseProposal.proposal.price.value).toBe(12000);
  });
  it("tem as contagens de itens repetíveis atuais", () => {
    expect(baseProposal.overview.cards).toHaveLength(3);
    expect(baseProposal.scope.channels).toHaveLength(4);
    expect(baseProposal.materials.buttons).toHaveLength(4);
    expect(baseProposal.strategy.cards).toHaveLength(3);
    expect(baseProposal.strategy.steps).toHaveLength(5);
    expect(baseProposal.start.checklist).toHaveLength(6);
    expect(baseProposal.start.needs.items).toHaveLength(6);
    expect(baseProposal.team.people).toHaveLength(4);
    expect(baseProposal.proposal.included).toHaveLength(6);
  });
  it("marca o último passo do roadmap como final", () => {
    expect(baseProposal.strategy.steps.at(-1).isFinal).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

```bash
rtk npx vitest run src/data/baseProposal.test.js
```

Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `src/data/baseProposal.js`** (conteúdo extraído 1:1 do `main.jsx` atual)

```js
// Base imutável. NUNCA escrita em runtime — toda edição trabalha numa cópia.
// Imagens da base ficam como caminhos de asset (string começando com asset:),
// resolvidos pelo renderizador; o editor converte para base64 ao exportar.
export const baseProposal = {
  version: 1,
  meta: { clientName: "Design Elements", validityDays: 7 },
  hero: {
    brandName: "Agencia Wolf®",
    headingText: "Conteúdo e performance para sua marca.",
    headingStrong: "marca.",
    proofText: "Os maiores do mercado escolheram a Wolf®",
    avatars: ["asset:fotos/1.png", "asset:fotos/2.png", "asset:fotos/3.png", "asset:fotos/4.png"],
  },
  marquee: {
    logos: [
      "asset:marquee/1.svg", "asset:marquee/Logo.svg", "asset:marquee/Logotipos.svg",
      "asset:marquee/Union.svg", "asset:marquee/Vector.svg", "asset:marquee/Vector-1.svg",
      "asset:marquee/Vector-2.svg", "asset:marquee/Vector-3.svg", "asset:marquee/Vector-4.svg",
      "asset:marquee/Vector-5.svg",
    ],
  },
  overview: {
    pillNumber: "01", pillLabel: "Visão geral",
    headingText: "Uma operação pensada para manter a Design Elements ativa, relevante e bem posicionada.",
    headingStrong: "Design Elements",
    cards: [
      { title: "Consistência", body: "Produção recorrente e planejamento editorial para manter a marca presente, sem ruídos e sem pausas." },
      { title: "Posicionamento", body: "Comunicação profissional que constrói autoridade e diferencia a marca no segmento." },
      { title: "Oportunidades", body: "Presença digital transformada em audiência qualificada e novas conversas de negócio." },
    ],
  },
  scope: {
    pillNumber: "02", pillLabel: "Escopo",
    headingText: "Produção adaptada para cada canal da marca.", headingStrong: "",
    copy: "Produção mensal para Instagram, Facebook, TikTok, X e LinkedIn, com adaptação de linguagem e formato para cada canal.",
    metric: { prefix: "+", value: 152, label: "Entregas por mês, distribuídas entre os canais da marca." },
    channels: [
      { icon: "InstagramLogo", title: "Instagram & Facebook", lines: [{ qty: "24", label: "feed e reels" }, { qty: "60", label: "stories / Estáticos ou não" }] },
      { icon: "TiktokLogo", title: "Tiktok", lines: [{ qty: "16", label: "vídeos" }, { qty: "", label: "edição e animação simples" }] },
      { icon: "XLogo", title: "X / Twitter", lines: [{ qty: "40", label: "publicações" }, { qty: "", label: "copy e estáticos" }] },
      { icon: "LinkedinLogo", title: "Linkedin", lines: [{ qty: "12", label: "publicações" }, { qty: "", label: "institucional" }] },
    ],
  },
  materials: {
    headingText: "Criação dedicada para cada campanha.", headingStrong: "cada campanha.",
    copy: "Além do conteúdo recorrente, a operação contempla peças sob medida para ações e lançamentos da marca.",
    metric: { prefix: "até ", value: 4, label: "peças mensais de campanha" },
    buttons: [
      { icon: "FolderSimple", label: "Folders e banners" },
      { icon: "EnvelopeSimple", label: "E-mail marketing" },
      { icon: "SquaresFour", label: "Landing pages" },
      { icon: "Buildings", label: "Institucionais" },
    ],
  },
  strategy: {
    pillNumber: "04", pillLabel: "Estratégia & gestão",
    headingText: "A operação não se limita à produção. Cada ciclo é lido e ajustado.", headingStrong: "lido e ajustado.",
    cards: [
      { icon: "CalendarBlank", title: "Planejamento editorial", body: "Calendário mensal, organização de pautas e direcionamento de conteúdo." },
      { icon: "UsersThree", title: "Reunião de alinhamento", body: "Encontro mensal para revisar direção, prioridades e próximos passos." },
      { icon: "ArrowUpRight", title: "Relatório de performance", body: "Leitura de resultados e ajustes estratégicos com base nos dados de cada ciclo." },
    ],
    cycleTitleText: "Um ciclo mensal previsível.", cycleTitleStrong: "previsível.",
    steps: [
      { num: "01", title: "Planejamento", body: "Calendário editorial do mês estruturado e aprovado.", isFinal: false },
      { num: "02", title: "Aprovação", body: "Conteúdos e peças validados pelo cliente.", isFinal: false },
      { num: "03", title: "Produção", body: "Criação e edição conduzidas pelo time da Wolf.", isFinal: false },
      { num: "04", title: "Entrega", body: "Publicação e entrega dos materiais no cronograma.", isFinal: false },
      { num: "✓", title: "Performance", body: "Relatório de resultados e reunião de alinhamento.", isFinal: true },
    ],
  },
  start: {
    pillNumber: "06", pillLabel: "Início",
    headingText: "O início da operação", copy: "O calendário editorial será estruturado no início de cada mês, orientando a produção e as entregas do período.",
    checklist: [
      "Aprovação da proposta", "Alinhamento de objetivos", "Referências, materiais e acessos",
      "Linha editorial do primeiro ciclo", "Relatório de performance", "Time dedicado de 6 profissionais",
    ],
    needs: {
      title: "O que precisamos de você pra começar",
      items: [
        "Informações sobre a marca, produtos, serviços e diferenciais",
        "Materiais e referências visuais existentes",
        "Identidade visual da marca",
        "Acessos necessários às redes sociais e ferramentas",
        "Informações sobre campanhas, datas e ações relevantes",
        "Feedbacks e aprovações dentro dos prazos alinhados",
      ],
      warning: { label: "ATENÇÃO AQUI", body: "A agilidade das entregas depende diretamente do envio correto das informações e da aprovação dos materiais dentro do ciclo de produção." },
    },
  },
  team: {
    pillNumber: "08", pillLabel: "Equipe",
    headingText: "Um time dedicado ao projeto",
    metric: { value: 6, label: "profissionais na operação" },
    people: [
      { icon: "PencilSimpleLine", qty: "×1", role: "Copywriter", body: "Estratégia de mensagem e direção de texto." },
      { icon: "SquaresFour", qty: "×1", role: "Criadora\nde Conteúdo", body: "Captação e produção de conteúdo para a marca." },
      { icon: "PencilSimpleLine", qty: "×3", role: "Designers", body: "Criação visual e peças gráficas." },
      { icon: "VideoCamera", qty: "×1", role: "Editor de vídeo", body: "Edição de vídeos e animações simples." },
    ],
  },
  proposal: {
    headingText: "Sua proposta personalizada", recurrence: "Recorrência mensal",
    included: [
      "Produção de conteúdo multicanal", "Materiais de apoio para campanhas", "Planejamento editorial mensal",
      "Reunião mensal de alinhamento", "Relatório de performance", "Time dedicado de 6 profissionais",
    ],
    price: { currency: "R$", value: 12000, period: "/ mês" },
    note: "*Condição comercial a alinhar", ctaLabel: "Aprovar proposta", validity: "Proposta válida por 7 dias",
  },
};
```

- [ ] **Step 4: Rodar para ver passar**

```bash
rtk npx vitest run src/data/baseProposal.test.js
```

Expected: PASS (4 testes).

- [ ] **Step 5: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(data): baseProposal extraída do main.jsx"
```

---

### Task 1.3: Helpers imutáveis (`proposalOps`)

**Files:**
- Create: `src/data/proposalOps.js`
- Test: `src/data/proposalOps.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
import { describe, it, expect } from "vitest";
import { cloneProposal, setIn, addItem, removeItem, emptyItem, splitHeading } from "./proposalOps";

describe("proposalOps", () => {
  it("cloneProposal faz deep clone (não compartilha referência)", () => {
    const a = { x: { y: [1, 2] } };
    const b = cloneProposal(a);
    b.x.y.push(3);
    expect(a.x.y).toHaveLength(2);
  });
  it("setIn atualiza um caminho profundo imutavelmente", () => {
    const a = { hero: { headingText: "old" } };
    const b = setIn(a, ["hero", "headingText"], "new");
    expect(b.hero.headingText).toBe("new");
    expect(a.hero.headingText).toBe("old");
  });
  it("addItem acrescenta no fim de um array em path", () => {
    const a = { list: [{ v: 1 }] };
    const b = addItem(a, ["list"], { v: 2 });
    expect(b.list).toHaveLength(2);
    expect(a.list).toHaveLength(1);
  });
  it("removeItem remove pelo índice", () => {
    const a = { list: [{ v: 1 }, { v: 2 }] };
    const b = removeItem(a, ["list"], 0);
    expect(b.list).toEqual([{ v: 2 }]);
    expect(a.list).toHaveLength(2);
  });
  it("emptyItem('step') retorna passo com isFinal false", () => {
    expect(emptyItem("step")).toEqual({ num: "", title: "", body: "", isFinal: false });
  });
  it("emptyItem('channel') tem 1 linha vazia", () => {
    expect(emptyItem("channel")).toEqual({ icon: "Star", title: "", lines: [{ qty: "", label: "" }] });
  });
  it("splitHeading marca o trecho strong", () => {
    expect(splitHeading("foo bar baz", "bar")).toEqual([
      { text: "foo ", strong: false },
      { text: "bar", strong: true },
      { text: " baz", strong: false },
    ]);
  });
  it("splitHeading sem strong retorna um segmento", () => {
    expect(splitHeading("foo bar", "")).toEqual([{ text: "foo bar", strong: false }]);
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

```bash
rtk npx vitest run src/data/proposalOps.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implementar `src/data/proposalOps.js`**

```js
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
```

- [ ] **Step 4: Rodar para ver passar**

```bash
rtk npx vitest run src/data/proposalOps.test.js
```

Expected: PASS (8 testes).

- [ ] **Step 5: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(data): helpers imutáveis + splitHeading"
```

---

## Fase 2 — Renderizador compartilhado (sem regressão visual)

O renderizador é uma **portabilidade mecânica** do `main.jsx` atual: as funções de motion ficam idênticas; as seções passam a ler de `data` em vez de literais. A regra: **preservar exatamente JSX, classNames e props de motion**; só trocar a origem do conteúdo.

### Task 2.1: Primitivas de motion

**Files:**
- Create: `src/render/motion.jsx`

- [ ] **Step 1: Criar `src/render/motion.jsx`** copiando, sem alterações, do `main.jsx` atual: as constantes `EASE`, `listContainer`, `listItem`, `wordVariants`; e os componentes `useMotionEnabled`, `Reveal`, `CountUp` (com `fmtInt`, `fmtPad2`, `fmtThousands`), `StaggerList`, `toWords`, `WordReveal`, `StackList`, `Timeline`. Adicione no topo:

```jsx
import React, { useEffect, useRef } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
```

E exporte tudo que as seções usam:

```jsx
export { EASE, listItem, Reveal, CountUp, fmtInt, fmtPad2, fmtThousands, StaggerList, WordReveal, StackList, Timeline };
```

> Copie os corpos das funções **verbatim** das linhas correspondentes do `src/main.jsx` original (Reveal, CountUp, StaggerList, WordReveal, StackList, Timeline). Não altere durations, eases, viewport, nem classNames.

- [ ] **Step 2: Verificar que compila**

```bash
rtk npm run build
```

Expected: build OK (o módulo ainda não é usado, mas não pode quebrar a tipagem/parse).

- [ ] **Step 3: Commit**

```bash
rtk git add -A && rtk git commit -m "refactor(render): extrai primitivas de motion"
```

---

### Task 2.2: Seções lendo de `data`

**Files:**
- Create: `src/render/sections.jsx`, `src/render/ProposalDocument.jsx`

Mapa de origem dos dados por seção (substitui os literais atuais):

| Componente | Antes (literal) | Agora (de `data`) |
|---|---|---|
| `Brand` | "Agencia Wolf®" | `data.hero.brandName` |
| `Hero` h1 | segments fixos | `splitHeading(data.hero.headingText, data.hero.headingStrong)`, `from="up" trigger="mount"` |
| `Hero` avatars | `avatars` import | `data.hero.avatars` (via `resolveImg`) |
| `Hero` proof | texto fixo | `data.hero.proofText` |
| `Marquee` | `marqueeLogos` | `data.marquee.logos` (via `resolveImg`) |
| `Overview` pill | "01"/"Visão geral" | `data.overview.pillNumber/pillLabel` |
| `Overview` h2 | segments | `splitHeading(data.overview.headingText, data.overview.headingStrong)` |
| `Overview` cards | `items` | `data.overview.cards` |
| `Scope` | literais | `data.scope.*`; ícone via `getIcon(channel.icon)`; métrica `data.scope.metric` |
| `Materials` | literais | `data.materials.*`; botões via `getIcon(b.icon)` |
| `Strategy` cards/steps | literais | `data.strategy.cards` (ícone `getIcon`) / `data.strategy.steps` |
| `StartSection` | literais | `data.start.*` (checklist, needs.items, needs.warning) |
| `Team` | literais | `data.team.*`; ícone `getIcon(p.icon)`; `role` ainda usa `split("\n")` |
| `Proposal` | literais | `data.proposal.*`; preço `data.proposal.price` |

- [ ] **Step 1: Criar `src/render/sections.jsx`**

Topo do arquivo:

```jsx
import React from "react";
import { motion } from "motion/react";
import {
  ArrowUpRight, BoundingBox, CaretDown, Check, Cursor, Notepad, PenNib,
  Square, UsersThree, WarningCircle, CalendarBlank,
} from "@phosphor-icons/react";
import { Reveal, CountUp, fmtPad2, fmtThousands, StaggerList, WordReveal, StackList, Timeline } from "./motion.jsx";
import { getIcon } from "../data/iconRegistry.js";
import { splitHeading } from "../data/proposalOps.js";
import isotipo from "../assets/Isotipo.svg";

// Resolve uma string de imagem: "asset:fotos/1.png" -> URL do bundle; data URL/URL -> passa direto.
const assetUrls = import.meta.glob("../assets/**/*", { eager: true, import: "default", query: "?url" });
export function resolveImg(src) {
  if (typeof src !== "string") return src;
  if (src.startsWith("asset:")) return assetUrls["../assets/" + src.slice(6)] || src;
  return src; // data: URL ou http(s)
}
```

Em seguida porte cada componente do `main.jsx` original trocando os literais conforme a tabela acima. Pontos de atenção (preservar tudo o mais idêntico):

- **`Brand`**: `<img src={isotipo} alt="" /><span>{data.hero.brandName}</span>` — recebe `data` por prop.
- **`SectionPill`**: inalterado (já recebe `number`, `label`).
- **`Hero`**: `<WordReveal from="up" trigger="mount" stagger={0.12} segments={splitHeading(data.hero.headingText, data.hero.headingStrong)} />`; avatares `data.hero.avatars.map(...)` com `src={resolveImg(avatar)}`; proof `<p>{data.hero.proofText}</p>`.
- **`Marquee`**: `const logos = data.marquee.logos; const items = [...logos, ...logos, ...logos];` com `src={resolveImg(logo)}`.
- **`Overview`/`Scope`/`Materials`/`Strategy`/`StartSection`/`Team`/`Proposal`**: cada um recebe `data` e lê sua fatia. Ícones de dados via `const Icon = getIcon(item.icon)`. As métricas `CountUp` recebem `to={data.<sec>.metric.value}` e, onde houver prefixo textual (`+`, `até `), renderize o prefixo como texto antes do `<CountUp>` exatamente como hoje (ex.: `<strong>{data.scope.metric.prefix}<CountUp to={data.scope.metric.value} /></strong>`).
- **`Materials`** botão de toolbar (`tool-pill`) é decorativo fixo — mantenha como está (não vem de dados).
- **`Strategy` steps**: `data.strategy.steps.map(s => [s.num, s.title, s.body])` passado para `Timeline`, OU adapte `Timeline` para receber objetos. Mantenha a key estável (use `index`).
- **`Proposal`** preço: `<span>{data.proposal.price.currency}</span><strong><CountUp to={data.proposal.price.value} format={fmtThousands} /></strong><span>{data.proposal.price.period}</span>`.

Exporte todos os componentes de seção.

- [ ] **Step 2: Criar `src/render/ProposalDocument.jsx`**

```jsx
import React from "react";
import "../styles.css";
import { Hero, Marquee, Overview, Scope, Materials, Strategy, StartSection, Team, Proposal, Footer } from "./sections.jsx";

export default function ProposalDocument({ data }) {
  return (
    <main>
      <Hero data={data} />
      <Marquee data={data} />
      <Overview data={data} />
      <Scope data={data} />
      <Materials data={data} />
      <Strategy data={data} />
      <StartSection data={data} />
      <Team data={data} />
      <Proposal data={data} />
      <Footer data={data} />
    </main>
  );
}
```

- [ ] **Step 3: Apontar `src/main.jsx` temporariamente para o renderizador** (verificação visual antes do editor)

Substitua o conteúdo de `src/main.jsx` por:

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import ProposalDocument from "./render/ProposalDocument.jsx";
import { baseProposal } from "./data/baseProposal.js";

createRoot(document.getElementById("root")).render(<ProposalDocument data={baseProposal} />);
```

- [ ] **Step 4: Build + subir preview e capturar screenshots**

```bash
rtk npm run build && rtk npm run dev
```

Em outro terminal (com o dev em 127.0.0.1:5173 — ajuste a porta no `scripts/qa-screenshots.mjs` se o Vite usar outra):

```bash
rtk node scripts/qa-screenshots.mjs
```

Expected: gera `qa-00.png`..`qa-11.png`. **Compare visualmente** com a proposta atual (mesma estrutura/animações). `scrollWidth` deve continuar ≤ 375 (sem overflow horizontal).

- [ ] **Step 5: Checagem de regressão**

Confirme nos screenshots: headline da capa, marquee, 3 cards de visão geral, 4 canais, 4 botões de materiais, 3 cards + roadmap (5 passos) da estratégia, checklist + needs, 4 pessoas, card de preço "R$ 12.000". Sem cortes/overflow.

- [ ] **Step 6: Commit**

```bash
rtk git add -A && rtk git commit -m "refactor(render): seções data-driven + ProposalDocument (paridade visual)"
```

---

## Fase 3 — Viewer single-file (base do export)

### Task 3.1: Entry do viewer

**Files:**
- Create: `viewer.html`, `src/viewer/main.jsx`

- [ ] **Step 1: Criar `src/viewer/main.jsx`**

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import ProposalDocument from "../render/ProposalDocument.jsx";
import { baseProposal } from "../data/baseProposal.js";

const data = typeof window !== "undefined" && window.__PROPOSTA__ ? window.__PROPOSTA__ : baseProposal;
createRoot(document.getElementById("root")).render(<ProposalDocument data={data} />);
```

- [ ] **Step 2: Criar `viewer.html`** (na raiz do projeto)

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#08080a" />
    <title>Agencia Wolf - Proposta</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/viewer/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(viewer): entry que lê window.__PROPOSTA__"
```

---

### Task 3.2: Build single-file + embed

**Files:**
- Create: `vite.viewer.config.js`, `scripts/embed-viewer.mjs`
- Gera: `src/editor/viewerTemplate.js`

- [ ] **Step 1: Criar `vite.viewer.config.js`**

```js
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Builda apenas viewer.html como um único HTML autocontido (JS/CSS/assets inline).
export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    outDir: "viewer-dist",
    rollupOptions: { input: "viewer.html" },
    assetsInlineLimit: 100000000, // inline de todos os assets (imagens base64)
    cssCodeSplit: false,
  },
});
```

- [ ] **Step 2: Criar `scripts/embed-viewer.mjs`**

```js
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const html = readFileSync("viewer-dist/viewer.html", "utf8");
mkdirSync("src/editor", { recursive: true });
// Exporta o HTML single-file como string para o editor injetar dados e exportar.
writeFileSync(
  "src/editor/viewerTemplate.js",
  "// GERADO por scripts/embed-viewer.mjs — não editar à mão.\nexport default " + JSON.stringify(html) + ";\n",
);
console.log("viewerTemplate.js gerado (" + html.length + " bytes).");
```

- [ ] **Step 3: Rodar o build do viewer**

```bash
rtk npm run build:viewer
```

Expected: builda `viewer-dist/viewer.html` e imprime `viewerTemplate.js gerado (...)`. O HTML deve conter o JS/CSS inline e as imagens da base em base64.

- [ ] **Step 4: Sanidade do template**

```bash
rtk node -e "import('./src/editor/viewerTemplate.js').then(m => { const h = m.default; console.log('tem root:', h.includes('id=\"root\"'), '| tem script inline:', h.includes('<script'), '| bytes:', h.length); })"
```

Expected: `tem root: true | tem script inline: true | bytes: <grande>`.

- [ ] **Step 5: Confirmar `.gitignore`**

O `.gitignore` já foi criado na Task 0.1 com `node_modules`, `dist`, `viewer-dist`. Confirme que cobre esses itens; não versione `viewer-dist/`.

> `src/editor/viewerTemplate.js` é versionado (faz parte do build do editor).

- [ ] **Step 6: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(viewer): build single-file + embed do template"
```

---

## Fase 4 — Persistência e export (TDD, puro)

### Task 4.1: Storage

**Files:**
- Create: `src/editor/storage.js`
- Test: `src/editor/storage.test.js`

API (todas recebem o objeto de storage por injeção, default `localStorage`):
`saveDraft(data, store)`, `loadDraft(store)`, `listCopies(store)`, `saveCopy(name, data, store)` → retorna a cópia `{id,name,updatedAt,data}`, `loadCopy(id, store)`, `duplicateCopy(id, store)`, `deleteCopy(id, store)`, `exportJson(data)` → string, `importJson(text)` → data (lança em JSON inválido).

- [ ] **Step 1: Escrever o teste que falha**

```js
import { describe, it, expect, beforeEach } from "vitest";
import { saveDraft, loadDraft, listCopies, saveCopy, loadCopy, duplicateCopy, deleteCopy, exportJson, importJson } from "./storage";

function memStore() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
}

describe("storage", () => {
  let store;
  beforeEach(() => { store = memStore(); });

  it("draft round-trip", () => {
    saveDraft({ a: 1 }, store);
    expect(loadDraft(store)).toEqual({ a: 1 });
  });
  it("loadDraft vazio retorna null", () => {
    expect(loadDraft(store)).toBeNull();
  });
  it("saveCopy adiciona à lista e loadCopy recupera", () => {
    const c = saveCopy("Cliente X", { v: 1 }, store);
    expect(c.name).toBe("Cliente X");
    expect(listCopies(store)).toHaveLength(1);
    expect(loadCopy(c.id, store).data).toEqual({ v: 1 });
  });
  it("duplicateCopy cria nova entrada com mesmo data", () => {
    const c = saveCopy("X", { v: 1 }, store);
    const d = duplicateCopy(c.id, store);
    expect(d.id).not.toBe(c.id);
    expect(listCopies(store)).toHaveLength(2);
    expect(d.data).toEqual({ v: 1 });
  });
  it("deleteCopy remove", () => {
    const c = saveCopy("X", { v: 1 }, store);
    deleteCopy(c.id, store);
    expect(listCopies(store)).toHaveLength(0);
  });
  it("export/import json round-trip", () => {
    const data = { hero: { brandName: "W" } };
    expect(importJson(exportJson(data))).toEqual(data);
  });
  it("importJson inválido lança", () => {
    expect(() => importJson("{nope")).toThrow();
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

```bash
rtk npx vitest run src/editor/storage.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implementar `src/editor/storage.js`**

```js
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
```

- [ ] **Step 4: Rodar para ver passar**

```bash
rtk npx vitest run src/editor/storage.test.js
```

Expected: PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(editor): camada de storage (draft + cópias + json)"
```

---

### Task 4.2: Montagem do HTML de export

**Files:**
- Create: `src/editor/exportHtml.js`
- Test: `src/editor/exportHtml.test.js`

- [ ] **Step 1: Escrever o teste que falha**

```js
import { describe, it, expect } from "vitest";
import { slugify, buildExportHtml } from "./exportHtml";

const TEMPLATE = '<!doctype html><html><head></head><body><div id="root"></div><script type="module">console.log(1)</script></body></html>';

describe("exportHtml", () => {
  it("slugify normaliza nome de cliente", () => {
    expect(slugify("Design Elements®")).toBe("design-elements");
    expect(slugify("  Açaí  da Praça ")).toBe("acai-da-praca");
    expect(slugify("")).toBe("proposta");
  });
  it("injeta window.__PROPOSTA__ antes do primeiro <script>", () => {
    const html = buildExportHtml(TEMPLATE, { hero: { brandName: "W" } });
    expect(html).toContain("window.__PROPOSTA__");
    expect(html.indexOf("window.__PROPOSTA__")).toBeLessThan(html.indexOf('console.log(1)'));
  });
  it("o JSON injetado é recuperável", () => {
    const data = { x: 1, s: "</script>" };
    const html = buildExportHtml(TEMPLATE, data);
    const m = html.match(/window\.__PROPOSTA__\s*=\s*([\s\S]*?);<\/script>/);
    expect(m).toBeTruthy();
    expect(JSON.parse(m[1])).toEqual(data);
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**

```bash
rtk npx vitest run src/editor/exportHtml.test.js
```

Expected: FAIL.

- [ ] **Step 3: Implementar `src/editor/exportHtml.js`**

```js
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
```

> Nota: `safeJson` escapa `<`/`>` e o teste faz `JSON.parse` do trecho — `JSON.parse` aceita os escapes `<` etc., então o round-trip do teste passa.

- [ ] **Step 4: Rodar para ver passar**

```bash
rtk npx vitest run src/editor/exportHtml.test.js
```

Expected: PASS (3 testes).

- [ ] **Step 5: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(editor): montagem do HTML autocontido"
```

---

## Fase 5 — Editor UI

### Task 5.1: Schema declarativo dos formulários

**Files:**
- Create: `src/editor/formSchema.js`

Tipos de campo: `text`, `textarea`, `number`, `image`, `icon`, `list`. Um `list` aponta para um array em `path` e descreve os campos de cada item (`itemFields`) e o `itemType` (para `emptyItem`).

- [ ] **Step 1: Criar `src/editor/formSchema.js`**

```js
// Descrição declarativa do formulário. Cada `path` é relativo à raiz da proposta.
// Tipos: text | textarea | number | image | icon | list
export const formSchema = [
  { key: "meta", title: "Cliente & validade", fields: [
    { type: "text", path: ["meta", "clientName"], label: "Nome do cliente" },
    { type: "number", path: ["meta", "validityDays"], label: "Validade (dias)" },
  ]},
  { key: "hero", title: "Capa", fields: [
    { type: "text", path: ["hero", "brandName"], label: "Marca (rodapé da capa)" },
    { type: "text", path: ["hero", "headingText"], label: "Título" },
    { type: "text", path: ["hero", "headingStrong"], label: "Trecho em destaque" },
    { type: "text", path: ["hero", "proofText"], label: "Prova social" },
    { type: "list", path: ["hero", "avatars"], label: "Avatares", itemType: "image", itemFields: [{ type: "image", path: [], label: "Imagem" }] },
  ]},
  { key: "marquee", title: "Logos (marquee)", fields: [
    { type: "list", path: ["marquee", "logos"], label: "Logos", itemType: "image", itemFields: [{ type: "image", path: [], label: "Logo" }] },
  ]},
  { key: "overview", title: "01 · Visão geral", fields: [
    { type: "text", path: ["overview", "pillNumber"], label: "Número" },
    { type: "text", path: ["overview", "pillLabel"], label: "Rótulo" },
    { type: "text", path: ["overview", "headingText"], label: "Título" },
    { type: "text", path: ["overview", "headingStrong"], label: "Trecho em destaque" },
    { type: "list", path: ["overview", "cards"], label: "Cards", itemType: "card", itemFields: [
      { type: "text", path: ["title"], label: "Título" },
      { type: "textarea", path: ["body"], label: "Texto" },
    ]},
  ]},
  { key: "scope", title: "02 · Escopo", fields: [
    { type: "text", path: ["scope", "pillNumber"], label: "Número" },
    { type: "text", path: ["scope", "pillLabel"], label: "Rótulo" },
    { type: "text", path: ["scope", "headingText"], label: "Título" },
    { type: "textarea", path: ["scope", "copy"], label: "Descrição" },
    { type: "text", path: ["scope", "metric", "prefix"], label: "Métrica · prefixo" },
    { type: "number", path: ["scope", "metric", "value"], label: "Métrica · valor" },
    { type: "textarea", path: ["scope", "metric", "label"], label: "Métrica · legenda" },
    { type: "list", path: ["scope", "channels"], label: "Canais", itemType: "channel", itemFields: [
      { type: "icon", path: ["icon"], label: "Ícone" },
      { type: "text", path: ["title"], label: "Nome do canal" },
      { type: "list", path: ["lines"], label: "Linhas", itemType: "line", itemFields: [
        { type: "text", path: ["qty"], label: "Quantidade" },
        { type: "text", path: ["label"], label: "Descrição" },
      ]},
    ]},
  ]},
  { key: "materials", title: "Materiais", fields: [
    { type: "text", path: ["materials", "headingText"], label: "Título" },
    { type: "text", path: ["materials", "headingStrong"], label: "Trecho em destaque" },
    { type: "textarea", path: ["materials", "copy"], label: "Descrição" },
    { type: "text", path: ["materials", "metric", "prefix"], label: "Métrica · prefixo" },
    { type: "number", path: ["materials", "metric", "value"], label: "Métrica · valor" },
    { type: "text", path: ["materials", "metric", "label"], label: "Métrica · legenda" },
    { type: "list", path: ["materials", "buttons"], label: "Botões", itemType: "button", itemFields: [
      { type: "icon", path: ["icon"], label: "Ícone" },
      { type: "text", path: ["label"], label: "Rótulo" },
    ]},
  ]},
  { key: "strategy", title: "04 · Estratégia & roadmap", fields: [
    { type: "text", path: ["strategy", "pillNumber"], label: "Número" },
    { type: "text", path: ["strategy", "pillLabel"], label: "Rótulo" },
    { type: "text", path: ["strategy", "headingText"], label: "Título" },
    { type: "text", path: ["strategy", "headingStrong"], label: "Trecho em destaque" },
    { type: "list", path: ["strategy", "cards"], label: "Cards", itemType: "strategyCard", itemFields: [
      { type: "icon", path: ["icon"], label: "Ícone" },
      { type: "text", path: ["title"], label: "Título" },
      { type: "textarea", path: ["body"], label: "Texto" },
    ]},
    { type: "text", path: ["strategy", "cycleTitleText"], label: "Título do ciclo" },
    { type: "text", path: ["strategy", "cycleTitleStrong"], label: "Ciclo · destaque" },
    { type: "list", path: ["strategy", "steps"], label: "Roadmap (passos)", itemType: "step", itemFields: [
      { type: "text", path: ["num"], label: "Número/marca" },
      { type: "text", path: ["title"], label: "Título" },
      { type: "textarea", path: ["body"], label: "Texto" },
    ]},
  ]},
  { key: "start", title: "06 · Início", fields: [
    { type: "text", path: ["start", "pillNumber"], label: "Número" },
    { type: "text", path: ["start", "pillLabel"], label: "Rótulo" },
    { type: "text", path: ["start", "headingText"], label: "Título" },
    { type: "textarea", path: ["start", "copy"], label: "Descrição" },
    { type: "list", path: ["start", "checklist"], label: "Checklist", itemType: "checklist", itemFields: [{ type: "text", path: [], label: "Item" }] },
    { type: "text", path: ["start", "needs", "title"], label: "Título · precisamos de você" },
    { type: "list", path: ["start", "needs", "items"], label: "Precisamos de você", itemType: "need", itemFields: [{ type: "text", path: [], label: "Item" }] },
    { type: "text", path: ["start", "needs", "warning", "label"], label: "Aviso · rótulo" },
    { type: "textarea", path: ["start", "needs", "warning", "body"], label: "Aviso · texto" },
  ]},
  { key: "team", title: "08 · Equipe", fields: [
    { type: "text", path: ["team", "pillNumber"], label: "Número" },
    { type: "text", path: ["team", "pillLabel"], label: "Rótulo" },
    { type: "text", path: ["team", "headingText"], label: "Título" },
    { type: "number", path: ["team", "metric", "value"], label: "Métrica · valor" },
    { type: "text", path: ["team", "metric", "label"], label: "Métrica · legenda" },
    { type: "list", path: ["team", "people"], label: "Pessoas", itemType: "person", itemFields: [
      { type: "icon", path: ["icon"], label: "Ícone" },
      { type: "text", path: ["qty"], label: "Qtd (ex: ×1)" },
      { type: "text", path: ["role"], label: "Cargo (use \\n p/ quebra)" },
      { type: "textarea", path: ["body"], label: "Descrição" },
    ]},
  ]},
  { key: "proposal", title: "Proposta & preço", fields: [
    { type: "text", path: ["proposal", "headingText"], label: "Título" },
    { type: "text", path: ["proposal", "recurrence"], label: "Recorrência" },
    { type: "list", path: ["proposal", "included"], label: "O que está incluso", itemType: "included", itemFields: [{ type: "text", path: [], label: "Item" }] },
    { type: "text", path: ["proposal", "price", "currency"], label: "Moeda" },
    { type: "number", path: ["proposal", "price", "value"], label: "Preço" },
    { type: "text", path: ["proposal", "price", "period"], label: "Período" },
    { type: "text", path: ["proposal", "note"], label: "Observação" },
    { type: "text", path: ["proposal", "ctaLabel"], label: "Botão (CTA)" },
    { type: "text", path: ["proposal", "validity"], label: "Validade (texto)" },
  ]},
];
```

- [ ] **Step 2: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(editor): schema declarativo dos formulários"
```

---

### Task 5.2: Inputs genéricos

**Files:**
- Create: `src/editor/fields.jsx`

- [ ] **Step 1: Criar `src/editor/fields.jsx`**

```jsx
import React, { useRef, useState } from "react";
import { iconNames, getIcon } from "../data/iconRegistry.js";

export function TextField({ label, value, onChange, textarea }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <label className="fld">
      <span>{label}</span>
      <Tag value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={textarea ? 3 : undefined} />
    </label>
  );
}

export function NumberField({ label, value, onChange }) {
  return (
    <label className="fld">
      <span>{label}</span>
      <input type="number" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

// Lê um File e devolve data URL base64 (autocontido).
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function ImageDrop({ label, value, onChange }) {
  const inputRef = useRef(null);
  async function handleFiles(files) {
    if (files && files[0]) onChange(await fileToDataUrl(files[0]));
  }
  return (
    <div className="fld">
      <span>{label}</span>
      <div
        className="imgdrop"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        {value ? <img src={value} alt="" /> : <em>Arraste ou clique para enviar</em>}
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>
    </div>
  );
}

export function IconPicker({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const Current = getIcon(value);
  return (
    <div className="fld iconpick">
      <span>{label}</span>
      <button type="button" className="iconpick-trigger" onClick={() => setOpen((o) => !o)}>
        <Current weight="light" /> <small>{value || "escolher"}</small>
      </button>
      {open && (
        <div className="iconpick-grid">
          {iconNames.map((name) => {
            const Ico = getIcon(name);
            return (
              <button type="button" key={name} title={name}
                className={name === value ? "active" : ""}
                onClick={() => { onChange(name); setOpen(false); }}>
                <Ico weight="light" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

```bash
rtk npm run build
```

Expected: build OK.

- [ ] **Step 3: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(editor): inputs genéricos (texto, número, imagem, ícone)"
```

---

### Task 5.3: SectionForm (renderiza schema + listas com add/remove)

**Files:**
- Create: `src/editor/SectionForm.jsx`

- [ ] **Step 1: Criar `src/editor/SectionForm.jsx`**

```jsx
import React, { useState } from "react";
import { setIn, addItem, removeItem, emptyItem } from "../data/proposalOps.js";
import { TextField, NumberField, ImageDrop, IconPicker } from "./fields.jsx";

function getIn(obj, path) {
  return path.reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

// Renderiza um campo simples. `basePath` é o caminho até o objeto que contém `field.path`.
function Field({ field, data, basePath, onChange }) {
  const path = [...basePath, ...field.path];
  const value = getIn(data, path);
  const set = (v) => onChange(setIn(data, path, v));
  switch (field.type) {
    case "text": return <TextField label={field.label} value={value} onChange={set} />;
    case "textarea": return <TextField label={field.label} value={value} onChange={set} textarea />;
    case "number": return <NumberField label={field.label} value={value} onChange={set} />;
    case "image": return <ImageDrop label={field.label} value={value} onChange={set} />;
    case "icon": return <IconPicker label={field.label} value={value} onChange={set} />;
    case "list": return <ListField field={field} data={data} basePath={basePath} onChange={onChange} />;
    default: return null;
  }
}

// Lista repetível com + adicionar / × remover. Suporta itens objeto e itens string
// (itemFields com path []), e aninhamento (ex.: canais > linhas).
function ListField({ field, data, basePath, onChange }) {
  const listPath = [...basePath, ...field.path];
  const items = getIn(data, listPath) || [];
  const add = () => onChange(addItem(data, listPath, emptyItem(field.itemType)));
  const remove = (i) => onChange(removeItem(data, listPath, i));
  return (
    <div className="listfld">
      <div className="listfld-head"><span>{field.label}</span><button type="button" onClick={add}>+ adicionar</button></div>
      {items.map((_, i) => (
        <div className="listfld-item" key={i}>
          <div className="listfld-item-head"><small>{field.label} {i + 1}</small><button type="button" className="rm" onClick={() => remove(i)}>× remover</button></div>
          {field.itemFields.map((f, k) => (
            <Field key={k} field={f} data={data} basePath={[...listPath, i]} onChange={onChange} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function SectionForm({ section, data, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"acc" + (open ? " open" : "")}>
      <button type="button" className="acc-head" onClick={() => setOpen((o) => !o)}>
        <b>{section.title}</b><i>{open ? "−" : "+"}</i>
      </button>
      {open && (
        <div className="acc-body">
          {section.fields.map((f, i) => (
            <Field key={i} field={f} data={data} basePath={[]} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build**

```bash
rtk npm run build
```

Expected: OK.

- [ ] **Step 3: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(editor): SectionForm com listas add/remove e aninhamento"
```

---

### Task 5.4: Preview ao vivo (iframe + portal)

**Files:**
- Create: `src/editor/Preview.jsx`

- [ ] **Step 1: Criar `src/editor/Preview.jsx`**

```jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ProposalDocument from "../render/ProposalDocument.jsx";
import proposalCss from "../styles.css?inline";

// Renderiza o ProposalDocument DENTRO de um iframe (isolamento de CSS/motion),
// via portal. Atualiza reativamente sem recarregar — animações `once` não repetem.
export default function Preview({ data }) {
  const [body, setBody] = useState(null);

  function onLoad(e) {
    const doc = e.target.contentDocument;
    const style = doc.createElement("style");
    style.textContent = proposalCss;
    doc.head.appendChild(style);
    doc.documentElement.lang = "pt-BR";
    doc.body.style.margin = "0";
    setBody(doc.body);
  }

  useEffect(() => () => setBody(null), []);

  return (
    <iframe title="preview" className="preview-frame" onLoad={onLoad}>
      {body && createPortal(<ProposalDocument data={data} />, body)}
    </iframe>
  );
}
```

> Nota: `styles.css?inline` retorna a string do CSS (suportado pelo Vite). O iframe começa vazio; ao `onLoad` injetamos o CSS e fazemos portal do React para o `body`.

- [ ] **Step 2: Build**

```bash
rtk npm run build
```

Expected: OK.

- [ ] **Step 3: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(editor): preview ao vivo via iframe + portal"
```

---

### Task 5.5: TopBar + painel de salvas

**Files:**
- Create: `src/editor/TopBar.jsx`, `src/editor/SavedPanel.jsx`

- [ ] **Step 1: Criar `src/editor/TopBar.jsx`**

```jsx
import React, { useRef } from "react";

export default function TopBar({ clientName, onNewFromBase, onSaveCopy, onToggleSaved, onImport, onExportJson, onExportHtml }) {
  const fileRef = useRef(null);
  return (
    <header className="topbar">
      <strong>Editor · Proposta Wolf®</strong>
      <span className="topbar-client">{clientName}</span>
      <div className="topbar-actions">
        <button type="button" onClick={onNewFromBase}>Nova da base</button>
        <button type="button" onClick={onSaveCopy}>Salvar cópia</button>
        <button type="button" onClick={onToggleSaved}>Propostas salvas</button>
        <button type="button" onClick={() => fileRef.current?.click()}>Importar .json</button>
        <button type="button" onClick={onExportJson}>Exportar .json</button>
        <button type="button" className="primary" onClick={onExportHtml}>Exportar HTML</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => onImport(String(r.result)); r.readAsText(f); } e.target.value = ""; }} />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Criar `src/editor/SavedPanel.jsx`**

```jsx
import React from "react";

export default function SavedPanel({ copies, onOpen, onDuplicate, onDelete, onClose }) {
  return (
    <div className="saved-overlay" onClick={onClose}>
      <div className="saved-panel" onClick={(e) => e.stopPropagation()}>
        <div className="saved-head"><b>Propostas salvas</b><button type="button" onClick={onClose}>fechar</button></div>
        {copies.length === 0 && <p className="saved-empty">Nenhuma cópia salva ainda.</p>}
        <ul>
          {copies.map((c) => (
            <li key={c.id}>
              <button type="button" className="saved-name" onClick={() => onOpen(c.id)}>{c.name}</button>
              <small>{c.updatedAt?.slice(0, 10)}</small>
              <span className="saved-actions">
                <button type="button" onClick={() => onDuplicate(c.id)}>duplicar</button>
                <button type="button" onClick={() => onDelete(c.id)}>excluir</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build + Commit**

```bash
rtk npm run build && rtk git add -A && rtk git commit -m "feat(editor): TopBar + painel de propostas salvas"
```

---

### Task 5.6: EditorApp (split view + estado + autosave + export)

**Files:**
- Create: `src/editor/EditorApp.jsx`, `src/editor/editor.css`

- [ ] **Step 1: Criar `src/editor/editor.css`**

```css
* { box-sizing: border-box; }
.editor { display: flex; flex-direction: column; height: 100vh; font-family: system-ui, sans-serif; color: #0a0a0c; background: #f4f4f6; }
.topbar { display: flex; align-items: center; gap: 14px; padding: 10px 16px; background: #0a0a0c; color: #fff; }
.topbar-client { opacity: .65; font-size: 13px; }
.topbar-actions { margin-left: auto; display: flex; gap: 8px; flex-wrap: wrap; }
.topbar-actions button { font: inherit; font-size: 12px; padding: 7px 11px; border-radius: 8px; border: 1px solid #2a2a30; background: #16161a; color: #fff; cursor: pointer; }
.topbar-actions button.primary { background: #e11d2a; border-color: #e11d2a; }
.editor-body { flex: 1; display: grid; grid-template-columns: 420px 1fr; min-height: 0; }
.editor-form { overflow-y: auto; padding: 14px; border-right: 1px solid #e1e1e5; background: #fff; }
.editor-preview { display: flex; align-items: flex-start; justify-content: center; overflow: auto; padding: 22px; background: #d8d8dd; }
.preview-frame { width: 375px; height: 812px; border: 0; border-radius: 22px; box-shadow: 0 18px 60px rgba(0,0,0,.28); background: #08080a; }
.acc { border: 1px solid #e6e6ea; border-radius: 10px; margin-bottom: 8px; overflow: hidden; }
.acc-head { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: #fafafb; border: 0; font: inherit; cursor: pointer; }
.acc.open .acc-head { background: #f0f0f3; }
.acc-body { padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.fld { display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
.fld span { color: #555; }
.fld input, .fld textarea { font: inherit; font-size: 13px; padding: 7px 9px; border: 1px solid #d4d4d9; border-radius: 7px; }
.imgdrop { border: 1px dashed #c2c2c8; border-radius: 8px; padding: 10px; text-align: center; cursor: pointer; color: #888; }
.imgdrop img { max-width: 100%; max-height: 80px; border-radius: 4px; }
.iconpick-trigger { display: flex; align-items: center; gap: 6px; padding: 7px 9px; border: 1px solid #d4d4d9; border-radius: 7px; background: #fff; cursor: pointer; }
.iconpick-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; margin-top: 6px; max-height: 160px; overflow-y: auto; padding: 6px; border: 1px solid #e6e6ea; border-radius: 8px; }
.iconpick-grid button { aspect-ratio: 1; display: grid; place-items: center; border: 1px solid transparent; border-radius: 6px; background: #f5f5f7; cursor: pointer; font-size: 18px; }
.iconpick-grid button.active { border-color: #e11d2a; }
.listfld { border-left: 2px solid #ececef; padding-left: 10px; display: flex; flex-direction: column; gap: 8px; }
.listfld-head { display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.listfld-head button, .listfld-item-head .rm { font: inherit; font-size: 11px; padding: 4px 8px; border-radius: 6px; border: 1px solid #d4d4d9; background: #fff; cursor: pointer; }
.listfld-item { border: 1px solid #eee; border-radius: 8px; padding: 9px; display: flex; flex-direction: column; gap: 8px; }
.listfld-item-head { display: flex; justify-content: space-between; align-items: center; }
.saved-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: grid; place-items: center; z-index: 50; }
.saved-panel { background: #fff; border-radius: 12px; width: min(440px, 92vw); max-height: 80vh; overflow-y: auto; padding: 16px; }
.saved-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.saved-panel ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.saved-panel li { display: flex; align-items: center; gap: 8px; padding: 8px; border: 1px solid #eee; border-radius: 8px; }
.saved-name { font: inherit; background: none; border: 0; cursor: pointer; font-weight: 600; flex: 1; text-align: left; }
.saved-actions { display: flex; gap: 6px; }
.saved-actions button { font-size: 11px; padding: 4px 8px; border: 1px solid #d4d4d9; border-radius: 6px; background: #fff; cursor: pointer; }
@media (max-width: 880px) {
  .editor-body { grid-template-columns: 1fr; }
  .editor-preview { order: -1; height: 360px; }
}
```

- [ ] **Step 2: Criar `src/editor/EditorApp.jsx`**

```jsx
import React, { useEffect, useRef, useState } from "react";
import { baseProposal } from "../data/baseProposal.js";
import { cloneProposal } from "../data/proposalOps.js";
import { formSchema } from "./formSchema.js";
import SectionForm from "./SectionForm.jsx";
import Preview from "./Preview.jsx";
import TopBar from "./TopBar.jsx";
import SavedPanel from "./SavedPanel.jsx";
import viewerTemplate from "./viewerTemplate.js";
import { buildExportHtml, slugify } from "./exportHtml.js";
import {
  saveDraft, loadDraft, listCopies, saveCopy, loadCopy, duplicateCopy, deleteCopy, exportJson, importJson,
} from "./storage.js";
import "./editor.css";

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function EditorApp() {
  const [data, setData] = useState(() => loadDraft() || cloneProposal(baseProposal));
  const [showSaved, setShowSaved] = useState(false);
  const [copies, setCopies] = useState(() => listCopies());
  const debounce = useRef(null);

  // Autosave do rascunho (debounce).
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => saveDraft(data), 400);
    return () => clearTimeout(debounce.current);
  }, [data]);

  const refreshCopies = () => setCopies(listCopies());

  const onNewFromBase = () => { if (confirm("Começar uma nova proposta a partir da base? O rascunho atual será substituído.")) setData(cloneProposal(baseProposal)); };
  const onSaveCopy = () => { const name = prompt("Nome da cópia:", data.meta.clientName || "Proposta"); if (name) { saveCopy(name, data); refreshCopies(); alert("Cópia salva."); } };
  const onImport = (text) => { try { setData(importJson(text)); } catch { alert("JSON inválido."); } };
  const onExportJson = () => download(`proposta-${slugify(data.meta.clientName)}.json`, exportJson(data), "application/json");
  const onExportHtml = () => download(`proposta-${slugify(data.meta.clientName)}.html`, buildExportHtml(viewerTemplate, data), "text/html");
  const onOpen = (id) => { const c = loadCopy(id); if (c) { setData(cloneProposal(c.data)); setShowSaved(false); } };
  const onDuplicate = (id) => { duplicateCopy(id); refreshCopies(); };
  const onDelete = (id) => { if (confirm("Excluir esta cópia?")) { deleteCopy(id); refreshCopies(); } };

  return (
    <div className="editor">
      <TopBar
        clientName={data.meta.clientName}
        onNewFromBase={onNewFromBase} onSaveCopy={onSaveCopy}
        onToggleSaved={() => setShowSaved(true)} onImport={onImport}
        onExportJson={onExportJson} onExportHtml={onExportHtml}
      />
      <div className="editor-body">
        <div className="editor-form">
          {formSchema.map((section) => (
            <SectionForm key={section.key} section={section} data={data} onChange={setData} />
          ))}
        </div>
        <div className="editor-preview">
          <Preview data={data} />
        </div>
      </div>
      {showSaved && (
        <SavedPanel copies={copies} onOpen={onOpen} onDuplicate={onDuplicate} onDelete={onDelete} onClose={() => setShowSaved(false)} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Build + Commit**

```bash
rtk npm run build && rtk git add -A && rtk git commit -m "feat(editor): EditorApp split view + autosave + export"
```

---

### Task 5.7: Tornar o editor o entry do app

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Substituir `src/main.jsx`**

```jsx
import React from "react";
import { createRoot } from "react-dom/client";
import EditorApp from "./editor/EditorApp.jsx";

createRoot(document.getElementById("root")).render(<EditorApp />);
```

- [ ] **Step 2: Garantir o template do viewer atualizado e buildar tudo**

```bash
rtk npm run build:viewer && rtk npm run build
```

Expected: ambos OK. `build:viewer` regenera `viewerTemplate.js` com a versão atual do renderizador.

- [ ] **Step 3: Subir e validar manualmente**

```bash
rtk npm run dev
```

Abra `http://127.0.0.1:5173`. Verifique:
- Split view aparece; preview à direita renderiza a proposta animada.
- Abrir uma seção, editar um texto → preview atualiza.
- Em "04 · Estratégia & roadmap", adicionar um passo → aparece no roadmap; remover → some; layout do roadmap continua alinhado.

- [ ] **Step 4: Commit**

```bash
rtk git add -A && rtk git commit -m "feat(editor): editor vira o entry do app"
```

---

## Fase 6 — Verificação ponta a ponta

### Task 6.1: Checklist dos critérios de sucesso

**Files:** nenhum (verificação manual + screenshots).

- [ ] **Step 1: Rodar a suíte de testes**

```bash
rtk npm test
```

Expected: todos os testes das Fases 1 e 4 passam.

- [ ] **Step 2: Export HTML autocontido abre offline**

No editor: `Exportar HTML` → salva `proposta-design-elements.html`. Abra o arquivo direto no navegador (sem servidor). Expected: proposta completa, com animações, sem requests externos (verifique no DevTools › Network que nada falha; imagens são `data:`).

- [ ] **Step 3: Persistência**

Salvar cópia "Teste" → recarregar a página (F5) → `Propostas salvas` → abrir "Teste". Expected: conteúdo volta. `Exportar .json`, depois `Nova da base`, depois `Importar .json` do arquivo salvo → conteúdo reconstruído.

- [ ] **Step 4: Roadmap responsivo (2 e 8 passos)**

No formulário, deixe o roadmap com **2 passos** → verifique alinhamento da linha/spine no preview. Depois leve a **8 passos** → spine cobre todos, sem sobreposição. (Marque o último como final ajustando o `num` para `✓` se desejar.)

- [ ] **Step 5: Base intacta**

Confirme que nenhuma ação escreveu em `src/data/baseProposal.js` (git status limpo nesse arquivo) e que `Nova da base` sempre traz o conteúdo original.

- [ ] **Step 6: Atualizar handoff e memória**

Atualize `PROJECT_STATE.md` (resumo do editor entregue) e a memória `project_proposta_wolf_react.md` com o novo estado. Commit:

```bash
rtk git add -A && rtk git commit -m "docs: handoff do editor de propostas"
```

---

## Auto-revisão do plano (cobertura do spec)

- **Modelo de dados** → Task 1.2. **Ícones por nome + seletor** → 1.1 + 5.2. **Imagens base64** → fields ImageDrop (5.2) + viewer inline (3.2) + export (4.2).
- **Renderizador compartilhado / dois usos** → Fase 2 + Preview (5.4) + viewer (3). **Sem regressão visual** → 2.2 (screenshots).
- **Split view + accordion + add/remove + upload + icon picker** → 5.1–5.6.
- **Persistência (draft + cópias localStorage + import/export json)** → 4.1 + 5.5 + 5.6.
- **Export HTML autocontido** → 3 (template) + 4.2 (montagem) + 5.6 (download) + 6.1 step 2.
- **Roadmap editável + responsivo** → schema 5.1 (lista steps) + verificação 6.1 step 4.
- **Base intacta** → cloneProposal em todas as edições + 6.1 step 5.
- **Fora de escopo (ordem de seções, reordenar, tema, login)** → não implementado, conforme spec.

Sem placeholders. Assinaturas consistentes (`setIn`/`addItem`/`removeItem`/`emptyItem`, `buildExportHtml`/`slugify`, storage API) entre tasks.
