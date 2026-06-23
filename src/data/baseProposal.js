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
