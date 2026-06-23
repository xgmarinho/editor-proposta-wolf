# Painel Editor da Proposta Wolf® — Design

Data: 2026-06-23
Projeto: `proposta-wolf-claude` (React 19 + Vite 7, mobile 375px)
Status: aprovado pelo usuário, pronto para plano de implementação.

## Objetivo

Transformar a proposta — hoje um site React com todo o conteúdo hardcoded em
`src/main.jsx` — num **editor visual** que a equipe usa para gerar propostas por
cliente. A **base é um template imutável**: cada edição trabalha sobre uma **cópia**;
a base nunca é escrita. A saída é **HTML autocontido** (download), com as animações
preservadas. Sem backend, sem login.

## Decisões do usuário (brainstorming)

1. **Escopo:** editar uma proposta por vez, mantendo a base intacta — cada edição é uma cópia.
2. **Persistência:** os dois — lista de cópias no navegador (localStorage) **e** import/export `.json`.
3. **Entrega:** HTML autocontido (download de um arquivo `.html` único). Sem deploy acoplado.
4. **Interface:** split view — preview ao vivo à esquerda, formulário (accordion por seção) à direita.
5. **Roadmap editável:** a timeline da Estratégia também é totalmente editável (add/remover passos), mantendo a responsividade.

## Arquitetura

### Princípio central: um renderizador, dois usos
O mesmo conjunto de componentes que desenha a proposta serve para (a) o preview ao
vivo do editor e (b) o HTML exportado. Garante "o que você vê = o que você exporta".

### Camadas
- **Modelo de dados** (`src/data/`): `baseProposal` (constante imutável, extraída do
  `main.jsx` atual) + `schema`/helpers (criar item vazio por tipo de bloco, validação leve).
- **Renderizador** (`src/render/`): os componentes atuais (`Hero`, `Overview`, `Scope`,
  `Materials`, `Strategy`, `Timeline`, `StartSection`, `Team`, `Proposal`, etc.)
  refatorados para ler de um objeto `proposal` (props/contexto) em vez de conteúdo
  hardcoded. Toda a lógica de motion permanece.
- **Editor** (`src/editor/`): a UI do painel (split view, formulários, persistência, export).
- **Viewer** (`src/viewer/`): ponto de entrada mínimo que renderiza o renderizador lendo
  `window.__PROPOSTA__`. É a base do preview (em iframe) e do export single-file.

### Dois alvos de build
1. **Editor app** (`index.html`): o painel que a equipe usa. Build padrão.
2. **Viewer single-file** (`vite-plugin-singlefile`): renderizador-only, tudo inline
   (JS/CSS/assets base64), lê `window.__PROPOSTA__`. O HTML resultante é embutido no
   editor como **string de template** (raw import) e usado tanto para gerar o preview
   quanto para o export.

## Modelo de dados (JSON)

Um objeto único representa a proposta. Forma aproximada (campos finais saem do conteúdo real):

```
{
  version: 1,
  meta:    { clientName, validityDays },
  hero:    { brandName, headingText, headingStrong, proofText, avatars: [dataURL] },
  marquee: { logos: [dataURL] },
  overview:{ pillNumber, pillLabel, headingText, headingStrong, cards: [{ title, body }] },
  scope:   { pillNumber, pillLabel, headingText, copy,
             metric: { prefix, value, label },
             channels: [{ icon, title, lines: [{ qty, label }] }] },
  materials:{ headingText, headingStrong, copy,
             metric: { prefix, value, label },
             buttons: [{ icon, label }] },
  strategy:{ pillNumber, pillLabel, headingText, headingStrong,
             cards: [{ icon, title, body }],
             cycleTitleText, cycleTitleStrong,
             steps: [{ num, title, body, isFinal }] },        // roadmap
  start:   { pillNumber, pillLabel, headingText, copy,
             checklist: [string],
             needs: { title, items: [string], warning: { label, body } } },
  team:    { pillNumber, pillLabel, headingText,
             metric: { value, label },
             people: [{ icon, qty, role, body }] },
  proposal:{ headingText, recurrence,
             included: [string],
             price: { currency, value, period }, note, ctaLabel, validity }
}
```

### Convenções
- **Ícones**: armazenados como **nome** (string). Um registro `iconRegistry` mapeia
  `nome → componente Phosphor`. O editor expõe um **seletor de ícone** com um set curado
  (os ícones já usados hoje + alguns extras relevantes).
- **Imagens** (avatares, logos, uploads): armazenadas como **data URL base64** no JSON,
  para que cópia e export sejam autocontidos. As imagens da base são convertidas para
  base64 no momento do export (ou pré-convertidas), mantendo `baseProposal` legível.
- **Títulos com destaque**: cada heading vira `headingText` (texto cheio) +
  `headingStrong` (trecho a destacar, opcional). O renderizador divide em segmentos e
  aplica a ênfase, alimentando o `WordReveal` existente sem mudar a animação.

## Editor (split view)

- **Layout**: esquerda = preview; direita = formulário. Em telas estreitas, empilha
  (preview em cima/recolhível, formulário embaixo) — o editor em si é responsivo.
- **Preview**: `<iframe>` em 375px rodando o viewer; recebe o JSON atual via `postMessage`
  a cada mudança (debounce). Isola motion/CSS do cromo do editor e espelha o export.
- **Formulário**: accordion, uma seção por bloco. Campos: texto, textarea, número,
  **upload de imagem** (drag-and-drop → base64), **seletor de ícone**.
- **Blocos repetíveis** ganham **+ adicionar** / **× remover** por item:
  Visão geral (cards), Escopo (canais + linhas), Materiais (botões), Estratégia
  (cards **+ passos do roadmap**), Início (checklist + needs), Equipe (pessoas),
  Proposta (incluso). Reordenar fica **fora do v1** (YAGNI).
- **Barra de topo**: `Nova da base` · `Salvar cópia` · `Propostas salvas` ·
  `Importar .json` · `Exportar .json` · `Exportar HTML`.

## Persistência

- **Rascunho atual**: autosave em `localStorage["wolf:draft"]` a cada mudança (debounce).
- **Salvar cópia**: pede um nome → grava em `localStorage["wolf:copies"]` como
  `{ id, name, updatedAt, data }`.
- **Propostas salvas**: painel lista as cópias → abrir / duplicar / excluir.
- **Importar/Exportar `.json`**: input de arquivo (parse + validação leve) / download do JSON atual.
- **Base**: `baseProposal` é constante somente-leitura. `Nova da base` reseta a cópia de
  trabalho para a base. O arquivo da base nunca é escrito em runtime.

## Exportar HTML autocontido

1. O viewer é buildado como single-file (tudo inline) e embutido no editor como string.
2. No export: injeta `<script>window.__PROPOSTA__ = <json><\/script>` antes do bundle.
3. Todas as imagens já estão base64 no JSON (ou são convertidas no ato).
4. Gera `Blob` → download `proposta-<clientName>.html`: arquivo único, animações intactas,
   abre em qualquer navegador, pronto pra WhatsApp/e-mail/hospedagem manual.

## Roadmap (Timeline) editável + responsivo

- `strategy.steps` é totalmente editável: add/remover/editar `num`, `title`, `body`.
- Cada passo tem um toggle **`isFinal`** (o passo "✓") para que o ícone de check não
  fique preso a uma posição fixa.
- **Responsividade**: a spine (linha) é `position:absolute` ocupando a altura total do
  container flex-column, então se ajusta sozinha a N passos. O desenho ligado ao scroll
  (`scaleY` 0→1) mapeia o container inteiro, independente da contagem.
- Critério de verificação: layout correto e legível com **2 passos** e com **8 passos**.

## Fora de escopo (v1)

- Ordem das seções (fixa).
- Reordenar itens dentro de um bloco (drag-sort).
- Troca de tema/cores/fontes.
- Login, backend, multi-usuário, deploy automático.

## Critérios de sucesso

1. A proposta renderizada a partir de `baseProposal` é **visualmente idêntica** à atual
   (nenhuma regressão visual/animação após a extração para dados).
2. Editar qualquer campo no formulário reflete no preview ao vivo.
3. Adicionar/remover itens (incl. passos do roadmap) funciona e mantém responsividade.
4. Salvar cópia → recarregar a página → reabrir a cópia traz o conteúdo de volta.
5. Exportar `.json` e reimportar reconstrói a mesma proposta.
6. Exportar HTML gera **um arquivo** que abre offline com as animações funcionando.
7. A base nunca é alterada por nenhuma ação do editor.
