// Pacotes-modelo. Cada preset é um patch sobre a baseProposal: troca escopo,
// materiais, time e preço; mantém a narrativa (títulos/copy) da base.
// A métrica de entregas (scope.metric.value) é DERIVADA da soma dos canais —
// nunca digitada à mão, então nunca fica inconsistente.
//
// NÚMEROS SÃO PONTO DE PARTIDA. Trocar pelos pacotes reais da Wolf aqui.
import { baseProposal } from "./baseProposal.js";
import { cloneProposal } from "./proposalOps.js";

function sumChannels(channels) {
  return channels.reduce((tot, c) => {
    return tot + (c.lines || []).reduce((s, l) => s + (parseInt(l.qty, 10) || 0), 0);
  }, 0);
}

// Aplica um preset sobre a base e devolve uma proposta completa e consistente.
export function applyPreset(preset, overrides = {}) {
  const d = cloneProposal(baseProposal);
  if (preset) {
    if (preset.scope) {
      d.scope = { ...d.scope, ...preset.scope };
      if (preset.scope.channels) d.scope.channels = cloneProposal(preset.scope.channels);
    }
    if (preset.materials) d.materials = { ...d.materials, metric: { ...d.materials.metric, ...preset.materials.metric } };
    if (preset.team) {
      if (preset.team.people) d.team.people = cloneProposal(preset.team.people);
      if (preset.team.metric) d.team.metric = { ...d.team.metric, ...preset.team.metric };
    }
    if (preset.proposal) {
      d.proposal = { ...d.proposal, ...preset.proposal };
      if (preset.proposal.price) d.proposal.price = { ...d.proposal.price, ...preset.proposal.price };
      if (preset.proposal.included) d.proposal.included = [...preset.proposal.included];
    }
    if (preset.presetId) d.meta = { ...d.meta, presetId: preset.presetId };
  }
  // métrica de entregas = soma real dos canais (consistência automática)
  d.scope.metric = { ...d.scope.metric, value: sumChannels(d.scope.channels) };
  d.team.metric = { ...d.team.metric, value: d.team.people.length };
  // overrides do modal "Nova proposta" (cliente, preço, validade)
  if (overrides.clientName != null) d.meta.clientName = overrides.clientName;
  if (overrides.validityDays != null) d.meta.validityDays = Number(overrides.validityDays);
  if (overrides.price != null) d.proposal.price = { ...d.proposal.price, value: Number(overrides.price) };
  return d;
}

export const presets = [
  {
    presetId: "starter",
    label: "Starter",
    tagline: "Presença essencial · 2 canais",
    priceHint: 4500,
    scope: {
      copy: "Produção mensal para Instagram e Facebook, com adaptação de linguagem e formato para cada canal.",
      channels: [
        { icon: "InstagramLogo", title: "Instagram & Facebook", lines: [{ qty: "12", label: "feed e reels" }, { qty: "30", label: "stories / Estáticos ou não" }] },
      ],
    },
    materials: { metric: { prefix: "até ", value: 2, label: "peças mensais de campanha" } },
    team: {
      people: [
        { icon: "PencilSimpleLine", qty: "×1", role: "Copywriter", body: "Estratégia de mensagem e direção de texto." },
        { icon: "SquaresFour", qty: "×1", role: "Criadora\nde Conteúdo", body: "Captação e produção de conteúdo para a marca." },
        { icon: "PencilSimpleLine", qty: "×1", role: "Designer", body: "Criação visual e peças gráficas." },
      ],
    },
    proposal: {
      price: { currency: "R$", value: 4500, period: "/ mês" },
      included: ["Conteúdo Instagram & Facebook", "Planejamento editorial mensal", "Relatório de performance", "Time dedicado de 3 profissionais"],
    },
  },
  {
    presetId: "pro",
    label: "Pro",
    tagline: "Operação multicanal · 5 canais (recomendado)",
    priceHint: 12000,
    // Pro = a base atual (multicanal completo). Sem patch de escopo: usa a base.
  },
  {
    presetId: "enterprise",
    label: "Enterprise",
    tagline: "Operação intensiva · volume dobrado",
    priceHint: 22000,
    scope: {
      copy: "Produção intensiva para Instagram, Facebook, TikTok, X, LinkedIn e YouTube, com adaptação de linguagem e formato para cada canal.",
      channels: [
        { icon: "InstagramLogo", title: "Instagram & Facebook", lines: [{ qty: "40", label: "feed e reels" }, { qty: "90", label: "stories / Estáticos ou não" }] },
        { icon: "TiktokLogo", title: "Tiktok", lines: [{ qty: "30", label: "vídeos" }, { qty: "", label: "edição e animação simples" }] },
        { icon: "XLogo", title: "X / Twitter", lines: [{ qty: "60", label: "publicações" }, { qty: "", label: "copy e estáticos" }] },
        { icon: "LinkedinLogo", title: "Linkedin", lines: [{ qty: "20", label: "publicações" }, { qty: "", label: "institucional" }] },
        { icon: "YoutubeLogo", title: "YouTube", lines: [{ qty: "8", label: "vídeos longos" }, { qty: "", label: "edição completa" }] },
      ],
    },
    materials: { metric: { prefix: "até ", value: 8, label: "peças mensais de campanha" } },
    team: {
      people: [
        { icon: "PencilSimpleLine", qty: "×2", role: "Copywriters", body: "Estratégia de mensagem e direção de texto." },
        { icon: "SquaresFour", qty: "×2", role: "Criadores\nde Conteúdo", body: "Captação e produção de conteúdo para a marca." },
        { icon: "PencilSimpleLine", qty: "×4", role: "Designers", body: "Criação visual e peças gráficas." },
        { icon: "VideoCamera", qty: "×2", role: "Editores de vídeo", body: "Edição de vídeos e animações." },
      ],
    },
    proposal: {
      price: { currency: "R$", value: 22000, period: "/ mês" },
      included: ["Produção de conteúdo multicanal intensiva", "Materiais de apoio para campanhas", "Planejamento editorial mensal", "Reunião quinzenal de alinhamento", "Relatório de performance", "Time dedicado de 10 profissionais"],
    },
  },
];

export function getPreset(id) {
  return presets.find((p) => p.presetId === id) || null;
}
