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
