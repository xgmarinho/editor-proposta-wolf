import React from "react";
import { describe, it, expect } from "vitest";
import { iconRegistry, iconNames, getIcon } from "./iconRegistry";

// Ícones do @phosphor-icons/react v2 são componentes forwardRef (objetos),
// não funções — então validamos "é um tipo de componente React válido".
const isComponent = (c) => c != null && (typeof c === "function" || typeof c === "object");

describe("iconRegistry", () => {
  it("expõe todos os ícones usados pela proposta", () => {
    const required = [
      "ArrowUpRight", "InstagramLogo", "TiktokLogo", "XLogo", "LinkedinLogo",
      "FolderSimple", "EnvelopeSimple", "SquaresFour", "Buildings",
      "CalendarBlank", "UsersThree", "PencilSimpleLine", "VideoCamera",
    ];
    for (const name of required) {
      expect(isComponent(iconRegistry[name]), `falta ${name}`).toBe(true);
    }
  });
  it("iconNames lista as chaves do registro", () => {
    expect(iconNames).toEqual(Object.keys(iconRegistry));
  });
  it("getIcon faz fallback para um ícone válido com nome desconhecido", () => {
    expect(isComponent(getIcon("NaoExiste"))).toBe(true);
  });
});
