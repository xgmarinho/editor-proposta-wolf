import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import ProposalDocument from "../render/ProposalDocument.jsx";
import proposalCss from "../styles.css?inline";

// Mapa: chave da seção no editor -> seletor da seção na proposta renderizada.
// (meta = Cliente & validade não tem seção visual própria, então não navega.)
const SECTION_SELECTOR = {
  hero: ".hero",
  marquee: ".marquee",
  overview: ".overview",
  scope: ".scope",
  materials: ".materials",
  strategy: ".strategy",
  roadmap: ".timeline",
  start: ".start",
  team: ".team",
  proposal: ".proposal",
};

// CSS aplicado SÓ no preview do editor (não vai pro export single-file):
// a scrollbar da proposta aparece apenas no hover do preview.
// O destaque de foco é feito via Web Animations API (não por classe), porque o
// className das seções é controlado pelo React e seria sobrescrito no re-render.
const PREVIEW_CSS = `
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }
html:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); }
html { scrollbar-width: thin; scrollbar-color: transparent transparent; }
html:hover { scrollbar-color: rgba(255,255,255,0.28) transparent; }
`;

// Renderiza o ProposalDocument DENTRO de um iframe (isolamento de CSS/motion),
// via portal. Atualiza reativamente sem recarregar — animações `once` não repetem.
//
// Um iframe SEM `src` (about:blank) não dispara `onLoad` de forma confiável: o
// load pode ocorrer antes do React anexar o handler. Por isso inicializamos pelo
// ref no `useEffect` (o contentDocument de um iframe srcless já está disponível
// de forma síncrona) e reforçamos com `onLoad`. `init` é idempotente.
export default function Preview({ data, focus }) {
  const frameRef = useRef(null);
  const [body, setBody] = useState(null);

  const init = useCallback(() => {
    const frame = frameRef.current;
    const doc = frame && frame.contentDocument;
    if (!doc || !doc.body) return;
    if (!doc.querySelector("style[data-proposal]")) {
      const style = doc.createElement("style");
      style.setAttribute("data-proposal", "");
      style.textContent = proposalCss;
      doc.head.appendChild(style);
      doc.documentElement.lang = "pt-BR";
      doc.body.style.margin = "0";
    }
    if (!doc.querySelector("style[data-preview]")) {
      const s2 = doc.createElement("style");
      s2.setAttribute("data-preview", "");
      s2.textContent = PREVIEW_CSS;
      doc.head.appendChild(s2);
    }
    setBody(doc.body);
  }, []);

  useEffect(() => { init(); }, [init]);

  // Navegação pelo menu: rola o preview até a seção e a destaca brevemente com
  // um pontilhado vermelho discreto. Outline inline + Web Animations (não classe)
  // para sobreviver ao re-render do React, que controla o className das seções.
  useEffect(() => {
    if (!focus || !focus.key) return undefined;
    const sel = SECTION_SELECTOR[focus.key];
    const frame = frameRef.current;
    const doc = frame && frame.contentDocument;
    if (!sel || !doc) return undefined;
    const el = doc.querySelector(sel);
    if (!el) return undefined;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
    el.style.outline = "1.5px dashed rgba(255,29,37,0.65)";
    el.style.outlineOffset = "4px";
    const clear = () => { el.style.outline = ""; el.style.outlineOffset = ""; };

    const reduce = frame.contentWindow.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(clear, 2000);
      return () => { clearTimeout(t); clear(); };
    }
    const anim = el.animate(
      [
        { outlineColor: "rgba(255,29,37,0)" },
        { outlineColor: "rgba(255,29,37,0.7)", offset: 0.18 },
        { outlineColor: "rgba(255,29,37,0.5)", offset: 0.7 },
        { outlineColor: "rgba(255,29,37,0)" },
      ],
      { duration: 2300, easing: "ease" },
    );
    anim.onfinish = clear;
    return () => { try { anim.cancel(); } catch (e) {} clear(); };
  }, [focus && focus.nonce]);

  return (
    <iframe ref={frameRef} title="preview" className="preview-frame" onLoad={init}>
      {body && createPortal(<ProposalDocument data={data} />, body)}
    </iframe>
  );
}
