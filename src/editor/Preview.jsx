import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ProposalDocument from "../render/ProposalDocument.jsx";
import proposalCss from "../styles.css?inline";

// Renderiza o ProposalDocument DENTRO de um iframe (isolamento de CSS/motion),
// via portal. Atualiza reativamente sem recarregar — animações `once` não repetem.
export default function Preview({ data }) {
  const [body, setBody] = useState(null);

  function onLoad(e) {
    const doc = e.target.contentDocument;
    const style = doc.createElement("style");
    style.textContent = proposalCss;
    doc.head.appendChild(style);
    doc.documentElement.lang = "pt-BR";
    doc.body.style.margin = "0";
    setBody(doc.body);
  }

  useEffect(() => () => setBody(null), []);

  return (
    <iframe title="preview" className="preview-frame" onLoad={onLoad}>
      {body && createPortal(<ProposalDocument data={data} />, body)}
    </iframe>
  );
}
