import React, { useState } from "react";

// Compartilhar o link do cliente: copiar, WhatsApp, ver como cliente.
export default function ShareModal({ url, clientName, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  const msg = `Olá! Segue a proposta da Agência Wolf${clientName ? " para " + clientName : ""}: ${url}`;
  const wa = "https://wa.me/?text=" + encodeURIComponent(msg);

  return (
    <div className="saved-overlay" onClick={onClose}>
      <div className="saved-panel sm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="saved-head"><b>Link do cliente pronto</b><button type="button" onClick={onClose}>fechar</button></div>
        <div className="sm-url" onClick={copy} title="clicar para copiar">{url}</div>
        <div className="sm-actions">
          <button type="button" className="sm-btn primary" onClick={copy}>{copied ? "Copiado ✓" : "Copiar link"}</button>
          <a className="sm-btn wa" href={wa} target="_blank" rel="noreferrer">Enviar no WhatsApp</a>
          <a className="sm-btn" href={url} target="_blank" rel="noreferrer">Ver como cliente</a>
        </div>
        <p className="sm-hint">Quando o cliente abrir, a proposta aparece como "Vista" na lista do time.</p>
      </div>
    </div>
  );
}
