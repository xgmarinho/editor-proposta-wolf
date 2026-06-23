// Descrição declarativa do formulário. Cada `path` é relativo à raiz da proposta.
// Tipos: text | textarea | number | image | icon | list
//
// SÓ aparece aqui o que muda por cliente. Boilerplate fixo de marca (capa, logos,
// estratégia, roadmap, início, selos pill, CTA, etc) NÃO está no schema — segue
// renderizando da base, mas não polui a sidebar. `meta.clientName` e
// `meta.validityDays` alimentam campos derivados (overview.headingStrong e
// proposal.validity) automaticamente no EditorApp — por isso não estão aqui.
// `group` agrupa no menu; "Avançado (raro)" = muda só se o pacote mudar.
export const formSchema = [
  { key: "meta", group: "Ajustes", title: "Cliente & validade", fields: [
    { type: "text", path: ["meta", "clientName"], label: "Nome do cliente" },
    { type: "number", path: ["meta", "validityDays"], label: "Validade (dias)" },
  ]},

  { key: "overview", group: "Conteúdo da proposta", num: "01", title: "Visão geral", fields: [
    { type: "text", path: ["overview", "headingText"], label: "Título (cite o cliente)" },
  ]},
  { key: "scope", group: "Conteúdo da proposta", num: "02", title: "Escopo", fields: [
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
  { key: "proposal", group: "Conteúdo da proposta", num: "03", title: "Proposta & preço", fields: [
    { type: "list", path: ["proposal", "included"], label: "O que está incluso", itemType: "included", itemFields: [{ type: "text", path: [], label: "Item" }] },
    { type: "text", path: ["proposal", "price", "currency"], label: "Moeda" },
    { type: "number", path: ["proposal", "price", "value"], label: "Preço" },
    { type: "text", path: ["proposal", "price", "period"], label: "Período" },
  ]},

  { key: "overviewCards", group: "Avançado (raro)", title: "Visão geral · cards", fields: [
    { type: "list", path: ["overview", "cards"], label: "Cards", itemType: "card", itemFields: [
      { type: "text", path: ["title"], label: "Título" },
      { type: "textarea", path: ["body"], label: "Texto" },
    ]},
  ]},
  { key: "materials", group: "Avançado (raro)", title: "Materiais · métrica", fields: [
    { type: "number", path: ["materials", "metric", "value"], label: "Peças de campanha (valor)" },
    { type: "text", path: ["materials", "metric", "label"], label: "Métrica · legenda" },
  ]},
  { key: "team", group: "Avançado (raro)", title: "Equipe", fields: [
    { type: "number", path: ["team", "metric", "value"], label: "Métrica · valor" },
    { type: "text", path: ["team", "metric", "label"], label: "Métrica · legenda" },
    { type: "list", path: ["team", "people"], label: "Pessoas", itemType: "person", itemFields: [
      { type: "icon", path: ["icon"], label: "Ícone" },
      { type: "text", path: ["qty"], label: "Qtd (ex: ×1)" },
      { type: "text", path: ["role"], label: "Cargo (use \\n p/ quebra)" },
      { type: "textarea", path: ["body"], label: "Descrição" },
    ]},
  ]},
];
