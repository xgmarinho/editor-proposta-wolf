import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import ProposalDocument from "../render/ProposalDocument.jsx";
import proposalCss from "../styles.css?inline";

// Renderiza o ProposalDocument DENTRO de um iframe (isolamento de CSS/motion),
// via portal. Atualiza reativamente sem recarregar — animações `once` não repetem.
//
// Um iframe SEM `src` (about:blank) não dispara `onLoad` de forma confiável: o
// load pode ocorrer antes do React anexar o handler. Por isso inicializamos pelo
// ref no `useEffect` (o contentDocument de um iframe srcless já está disponível
// de forma síncrona) e reforçamos com `onLoad`. `init` é idempotente.
export default function Preview({ data }) {
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
    setBody(doc.body);
  }, []);

  useEffect(() => { init(); }, [init]);

  return (
    <iframe ref={frameRef} title="preview" className="preview-frame" onLoad={init}>
      {body && createPortal(<ProposalDocument data={data} />, body)}
    </iframe>
  );
}
