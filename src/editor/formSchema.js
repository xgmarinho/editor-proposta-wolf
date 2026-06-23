// Descrição declarativa do formulário. Cada `path` é relativo à raiz da proposta.
// Tipos: text | textarea | number | image | icon | list
//
// `group` agrupa as seções no menu. `num` é o índice do EDITOR (sequencial, na
// ordem em que a seção aparece na proposta) — NÃO confundir com o `pillNumber`
// (o "01/02/04..." que o cliente vê na proposta), que continua sendo um campo
// editável dentro de cada seção. Estratégia e Roadmap são seções separadas
// (apontam para a mesma fatia `strategy.*`, mas editadas em blocos distintos).
export const formSchema = [
  { key: "meta", group: "Ajustes", title: "Cliente & validade", fields: [
    { type: "text", path: ["meta", "clientName"], label: "Nome do cliente" },
    { type: "number", path: ["meta", "validityDays"], label: "Validade (dias)" },
  ]},

  { key: "hero", group: "Conteúdo da proposta", num: "01", title: "Capa", fields: [
    { type: "text", path: ["hero", "brandName"], label: "Marca (rodapé da capa)" },
    { type: "text", path: ["hero", "headingText"], label: "Título" },
    { type: "text", path: ["hero", "headingStrong"], label: "Trecho em destaque" },
    { type: "text", path: ["hero", "proofText"], label: "Prova social" },
    { type: "list", path: ["hero", "avatars"], label: "Avatares", itemType: "image", itemFields: [{ type: "image", path: [], label: "Imagem" }] },
  ]},
  { key: "marquee", group: "Conteúdo da proposta", num: "02", title: "Logos (marquee)", fields: [
    { type: "list", path: ["marquee", "logos"], label: "Logos", itemType: "image", itemFields: [{ type: "image", path: [], label: "Logo" }] },
  ]},
  { key: "overview", group: "Conteúdo da proposta", num: "03", title: "Visão geral", fields: [
    { type: "text", path: ["overview", "pillNumber"], label: "Número do selo (na proposta)" },
    { type: "text", path: ["overview", "pillLabel"], label: "Rótulo do selo" },
    { type: "text", path: ["overview", "headingText"], label: "Título" },
    { type: "text", path: ["overview", "headingStrong"], label: "Trecho em destaque" },
    { type: "list", path: ["overview", "cards"], label: "Cards", itemType: "card", itemFields: [
      { type: "text", path: ["title"], label: "Título" },
      { type: "textarea", path: ["body"], label: "Texto" },
    ]},
  ]},
  { key: "scope", group: "Conteúdo da proposta", num: "04", title: "Escopo", fields: [
    { type: "text", path: ["scope", "pillNumber"], label: "Número do selo (na proposta)" },
    { type: "text", path: ["scope", "pillLabel"], label: "Rótulo do selo" },
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
  { key: "materials", group: "Conteúdo da proposta", num: "05", title: "Materiais", fields: [
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
  { key: "strategy", group: "Conteúdo da proposta", num: "06", title: "Estratégia", fields: [
    { type: "text", path: ["strategy", "pillNumber"], label: "Número do selo (na proposta)" },
    { type: "text", path: ["strategy", "pillLabel"], label: "Rótulo do selo" },
    { type: "text", path: ["strategy", "headingText"], label: "Título" },
    { type: "text", path: ["strategy", "headingStrong"], label: "Trecho em destaque" },
    { type: "list", path: ["strategy", "cards"], label: "Cards", itemType: "strategyCard", itemFields: [
      { type: "icon", path: ["icon"], label: "Ícone" },
      { type: "text", path: ["title"], label: "Título" },
      { type: "textarea", path: ["body"], label: "Texto" },
    ]},
  ]},
  { key: "roadmap", group: "Conteúdo da proposta", num: "07", title: "Roadmap", fields: [
    { type: "text", path: ["strategy", "cycleTitleText"], label: "Título do ciclo" },
    { type: "text", path: ["strategy", "cycleTitleStrong"], label: "Ciclo · destaque" },
    { type: "list", path: ["strategy", "steps"], label: "Passos do roadmap", itemType: "step", itemFields: [
      { type: "text", path: ["num"], label: "Número/marca (ex: 01 ou ✓)" },
      { type: "text", path: ["title"], label: "Título" },
      { type: "textarea", path: ["body"], label: "Texto" },
    ]},
  ]},
  { key: "start", group: "Conteúdo da proposta", num: "08", title: "Início", fields: [
    { type: "text", path: ["start", "pillNumber"], label: "Número do selo (na proposta)" },
    { type: "text", path: ["start", "pillLabel"], label: "Rótulo do selo" },
    { type: "text", path: ["start", "headingText"], label: "Título" },
    { type: "textarea", path: ["start", "copy"], label: "Descrição" },
    { type: "list", path: ["start", "checklist"], label: "Checklist", itemType: "checklist", itemFields: [{ type: "text", path: [], label: "Item" }] },
    { type: "text", path: ["start", "needs", "title"], label: "Título · precisamos de você" },
    { type: "list", path: ["start", "needs", "items"], label: "Precisamos de você", itemType: "need", itemFields: [{ type: "text", path: [], label: "Item" }] },
    { type: "text", path: ["start", "needs", "warning", "label"], label: "Aviso · rótulo" },
    { type: "textarea", path: ["start", "needs", "warning", "body"], label: "Aviso · texto" },
  ]},
  { key: "team", group: "Conteúdo da proposta", num: "09", title: "Equipe", fields: [
    { type: "text", path: ["team", "pillNumber"], label: "Número do selo (na proposta)" },
    { type: "text", path: ["team", "pillLabel"], label: "Rótulo do selo" },
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
  { key: "proposal", group: "Conteúdo da proposta", num: "10", title: "Proposta & preço", fields: [
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
