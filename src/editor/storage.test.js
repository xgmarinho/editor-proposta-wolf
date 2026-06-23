import { describe, it, expect, beforeEach } from "vitest";
import { saveDraft, loadDraft, listCopies, saveCopy, loadCopy, duplicateCopy, deleteCopy, exportJson, importJson } from "./storage";

function memStore() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: (k) => m.delete(k) };
}

describe("storage", () => {
  let store;
  beforeEach(() => { store = memStore(); });

  it("draft round-trip", () => {
    saveDraft({ a: 1 }, store);
    expect(loadDraft(store)).toEqual({ a: 1 });
  });
  it("loadDraft vazio retorna null", () => {
    expect(loadDraft(store)).toBeNull();
  });
  it("saveCopy adiciona à lista e loadCopy recupera", () => {
    const c = saveCopy("Cliente X", { v: 1 }, store);
    expect(c.name).toBe("Cliente X");
    expect(listCopies(store)).toHaveLength(1);
    expect(loadCopy(c.id, store).data).toEqual({ v: 1 });
  });
  it("duplicateCopy cria nova entrada com mesmo data", () => {
    const c = saveCopy("X", { v: 1 }, store);
    const d = duplicateCopy(c.id, store);
    expect(d.id).not.toBe(c.id);
    expect(listCopies(store)).toHaveLength(2);
    expect(d.data).toEqual({ v: 1 });
  });
  it("deleteCopy remove", () => {
    const c = saveCopy("X", { v: 1 }, store);
    deleteCopy(c.id, store);
    expect(listCopies(store)).toHaveLength(0);
  });
  it("export/import json round-trip", () => {
    const data = { hero: { brandName: "W" } };
    expect(importJson(exportJson(data))).toEqual(data);
  });
  it("importJson inválido lança", () => {
    expect(() => importJson("{nope")).toThrow();
  });
});
