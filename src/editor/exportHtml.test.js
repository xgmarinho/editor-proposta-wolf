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
