# Estado do projeto - Proposta Wolf (cópia Claude) — HANDOFF

Data: 2026-06-22 (pausa para compactar)

> Cópia separada de `../proposta-wolf` (trabalho do Codex). Toda a continuidade
> da sessão Claude está AQUI. Na volta, executar o "PLANO DA PRÓXIMA SESSÃO".

## Local / como rodar

`C:\Users\Windows 10\Documents\Codex\2026-06-22\o-qu\work\proposta-wolf-claude`

```powershell
npm install
npm run dev                      # local (127.0.0.1)
npx vite --host 0.0.0.0 --port 5180   # exposto na rede (celular): http://192.168.0.2:5180/
npm run build
```

Arquivos do app: só `src/main.jsx` (todos os componentes) + `src/styles.css`.
Para compactar: pode EXCLUIR `node_modules/` e `dist/` do zip e rodar
`npm install` na volta (mais leve).

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
