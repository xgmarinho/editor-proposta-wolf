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
