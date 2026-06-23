# Estado do projeto - Proposta Wolf (cópia Claude) — HANDOFF

Data: 2026-06-23 (editor de propostas entregue)

> Cópia separada de `../proposta-wolf` (trabalho do Codex). Toda a continuidade
> da sessão Claude está AQUI.

## Local / como rodar

`C:\Users\Windows 10\Documents\Codex\2026-06-22\o-qu\work\proposta-wolf-claude`

```powershell
npm install
npm run dev            # editor (split view) em 127.0.0.1:5173
npm test               # 25 testes (vitest)
npm run build          # build do app/editor
npm run build:viewer   # regenera src/editor/viewerTemplate.js (necessário se mexer no renderizador)
```

## Arquitetura (mudou — não é mais "só main.jsx")
- `src/data/` — **`baseProposal.js`** (base imutável, todo o conteúdo da proposta em JSON),
  `iconRegistry.js` (nome→ícone Phosphor + `getIcon`), `proposalOps.js` (helpers imutáveis,
  `splitHeading`). Todos com `.test.js`.
- `src/render/` — renderizador compartilhado que lê de `data`: `motion.jsx` (primitivas),
  `sections.jsx` (todas as seções), `ProposalDocument.jsx`. **NÃO importa `styles.css`**
  (evita vazamento global) — o CSS entra via iframe (editor) e via `viewer/main.jsx` (export).
- `src/editor/` — a UI do editor: `EditorApp.jsx` (split view), `Preview.jsx` (iframe + portal),
  `formSchema.js` (campos declarativos), `fields.jsx`, `SectionForm.jsx`, `TopBar.jsx`,
  `SavedPanel.jsx`, `storage.js`, `exportHtml.js`, `viewerTemplate.js` (GERADO, 1.45MB).
- `src/viewer/` — entry standalone que lê `window.__PROPOSTA__` (base do export single-file).
- `src/main.jsx` — agora só monta `<EditorApp />`. `src/styles.css` — o visual da proposta (inalterado).
- Spec/plano: `docs/superpowers/specs/2026-06-23-...` e `docs/superpowers/plans/2026-06-23-...`.

---

# ✅ CONCLUÍDO em 2026-06-23 — Editor de propostas (painel CRM-like)

Entregue via plano subagent-driven (Fases 0–6). Repo git **próprio** iniciado neste diretório.

## 📦 Repositório
- **GitHub (privado):** https://github.com/eurodrigobispo/editor-proposta-wolf (branch `main`).

## 🌐 No ar (Cloudflare Pages)
- **URL da equipe:** https://editor-proposta-wolf.pages.dev (sem instalação, abre no navegador).
- Projeto Pages: `editor-proposta-wolf` (production-branch `main`). SPA estática 100% client-side.
- **Re-deploy:** `rtk npm run build:viewer && rtk npm run build` e depois
  `source ~/.bashrc && wrangler pages deploy dist --project-name editor-proposta-wolf --branch main`.
- Sem domínio custom (decisão do usuário: só `.pages.dev`). Pra adicionar depois: ver skill `/wolf-deploy`.

**O que faz:** a equipe abre o editor (split view: formulário à esquerda, proposta animada
ao vivo à direita), edita qualquer campo, **adiciona/remove itens** em todos os blocos
repetíveis (incl. **roadmap/timeline**), faz upload de imagem (base64) e escolhe ícones.
A **base fica intacta** — toda edição é uma cópia. Persistência: autosave de rascunho +
**Salvar cópia** (lista no navegador) + **Importar/Exportar `.json`**. **Exportar HTML** gera
um arquivo único autocontido (CSS+JS+imagens base64, **0 requests externos**) que abre offline
com as animações.

**Verificado ao vivo (Playwright):** paridade visual 1:1 com o original (Escopo +152, Roadmap,
Preço R$ 12.000); preview reativo; add no roadmap reflete; edição de texto reflete; export
standalone abre com avatares base64 e sem requests externos; autosave sobrevive a reload.
25 testes verdes.

**Limitação conhecida (v1):** o nó "final" da timeline (círculo branco) é por `:last-child`
no CSS, não pelo campo `isFinal` (que ficou inerte). Um passo novo adicionado ao fim herda o
visual de final. Combina com o comportamento original (✓ vinha do `:last-child` + glifo no
campo número). Reordenar itens e wirar `isFinal` ficaram **fora do v1**.

**Fora do escopo v1:** ordem das seções fixa; reordenar itens por drag; troca de tema/cores;
login/backend/deploy automático.

---

## (Histórico) Como era antes
Arquivo único `src/main.jsx` + `src/styles.css`. Migrado para a arquitetura acima.

## Fonte de verdade (Figma) — IMPORTANTE
- Arquivo **Wolf - Proposta Minimalista** › página **Proposta Final**.
- Frame principal **`113:16748`** "Agência Wolf® - Proposta", **375×9555**.
- REST do Figma com **token expirado (403)**. Usar SEMPRE o Bridge/plugin:
  `figma_execute`, `figma_capture_screenshot`. NUNCA os endpoints REST.
- Frames de referência (componentes mostrados SEPARADOS de propósito, só pra ver
  o conteúdo): `Stack - Visão Geral`, `Stack - Equipe`, `Carrossel - Estratégia`.

---

# ✅ CONCLUÍDO em 2026-06-22 (sessão de retomada)

Os 3 itens abaixo foram **executados e verificados** (build OK + DOM via Playwright):
1. ✅ Pin/scroll-lock removido → `StackList` (lista vertical sequencial) em Visão
   Geral e Equipe. Cards em `position: relative`, gap 16px, reveal sequencial
   (opacity 0→1, lift). `PinnedStack`/`PinnedCard` apagados; CSS `.pin-*` removido.
2. ✅ Materiais: removido `height:820 fixo + overflow:hidden`, `padding-top` 235→150
   + `padding-bottom` 104. Os **4 botões** aparecem em grid 2×2 sem corte.
3. ✅ Estratégia: carrossel horizontal aninhado trocado por `StrategyList` (lista
   vertical, `.mini-card` width 100%). Removidos `Carousel`, `.carousel-*` e dots.

Histórico do plano original abaixo (mantido para referência):

---

### 1. REVERTER o scroll-lock (pin) das seções "Visão Geral" e "Equipe"
A animação de pin (trava a tela e empilha) **não ficou boa**. Trocar por
**lista sequencial, um card abaixo do outro**, com cada card revelando de forma
sequencial (slide-up + fade no scroll, sem travar a tela, sem empilhar).
- Em `src/main.jsx`:
  - Remover/aposentar `PinnedStack` e `PinnedCard`.
  - Fazer `Overview` e `Team` renderizarem os cards em fluxo normal (um abaixo do
    outro, `position: static`, com `gap`), cada card embrulhado num reveal
    sequencial simples (reaproveitar o componente `Reveal` com `index`).
  - Conteúdo completo SEMPRE visível (sem peek/overlap).
- Em `src/styles.css`:
  - `.stack-card` e `.team-card`: remover `position: absolute`; virar bloco normal
    com `margin-bottom` (gap ~16). Manter o resto do visual (border, radius,
    gradiente, handle, ícone, etc).
  - Pode remover `.pin-track/.pin-stage/.pin-inner` (não serão mais usados).
  - `overflow-x: clip` no `main`/`body` pode ficar (inofensivo) ou voltar a
    `hidden` — só era necessário pro sticky do pin.

### 2. Materiais ("Criação dedicada para cada campanha") — itens cortados (BUG)
No celular só aparecem **2 botões** (1ª linha); "Landing pages" e "Institucionais"
somem. NÃO é slider — é um grid 2×2 de 4 botões sendo **cortado**.
- Causa: `.materials { height: 820px; overflow: hidden; padding: 235px 18px 0 }`.
  O conteúdo passa de 820px e a 2ª linha do `.material-grid` é cortada.
- Fix: trocar `height: 820px` por `min-height: 820px` (ou auto) e/ou reduzir o
  `padding-top` (Figma usa ~159px de topo, não 235). Conferir no Figma frame
  `113:16946` (Materiais). Confirmados 4 itens no Figma: Folders e banners,
  E-mail marketing, Landing pages, Institucionais (nada além disso no Figma —
  se o usuário quiser MAIS itens, é adição nova, perguntar).

### 3. Estratégia & gestão (item 04) — carrossel lateral "solto"/bugado
O carrossel horizontal (`.carousel-track` com `overflow-x:auto` + scroll-snap +
`margin: 0 -18px`) cria um **scroll horizontal aninhado** que fica "solto" e não
desliza como deveria.
- Decidir com o usuário: (a) como ele pediu "tudo sequencial um abaixo do outro",
  o mais coerente é transformar os 3 cards da Estratégia também em **lista
  vertical sequencial**; ou (b) refazer como carrossel arrastável de verdade
  (Motion `drag="x"` com `dragConstraints`, sem scroll nativo aninhado).
  Recomendação: (a) vertical, para bater com a nova direção.
- Componentes: `Carousel` e `Strategy` em `main.jsx`; CSS `.carousel*` e
  `.mini-card`. Cards no Figma: 321×187, radius 30 (frame `113:17016`).

---

## O que está PRONTO e bom (manter)
- Largura 375px (1:1 Figma). Fundo base #08080a.
- **WordReveal**: h1 palavra por palavra subindo; h2 palavra por palavra da
  esquerda p/ direita; opacidade 0→1; independente do scroll. Em todos os h2.
- Timing lento/fluido (durations ~0.8–1.1, stagger 0.12). Tudo respeita
  `prefers-reduced-motion`.
- **Roadmap/timeline**: linha **ligada ao scroll** (desenha conforme rola) +
  passos com entrada cronometrada. (manter)
- **Marquee**: máscara de sombra nas laterais (`mask-image`, spotlight no centro)
  + fade sequencial dos logos. (manter)
- **"O que precisamos de você"**: entra item a item. (manter)
- **Fim da página corrigido**: botão "Aprovar proposta" agora 56px/radius 18
  (Figma), `.proposal` altura auto — botão inteiro + rodapé aparecem. (manter)
- Materiais (fora o corte): toolbar com ícones+carets, headline com "cada
  campanha." em negrito, divisória, métrica "até 4" + ícone. (manter)
- Equipe: título 26px, dot+qty, body, handle branco, ícone. (manter o card; só
  mudar o layout de pin → lista).
- Build de produção passa.

## Servidores rodando agora (encerrar com Ctrl+C se quiser)
- `127.0.0.1:5174` (npm run dev) e `0.0.0.0:5180` (rede / celular).

## Pendência de rede (celular)
Firewall do Windows bloqueia a porta sem admin. Liberar com (UAC):
```powershell
Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-Command','New-NetFirewallRule -DisplayName "Vite Dev 5180" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5180 -Profile Any'
```
Conferir também: mesma sub-rede (192.168.0.x) e AP/Client Isolation do roteador.
