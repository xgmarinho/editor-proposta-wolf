import React, { useRef, useState, useEffect } from "react";
import { DotsThree } from "@phosphor-icons/react";
import wolfLogo from "../assets/wolf-logo.svg";

export default function TopBar({ clientName, onNew, onSave, saving, onToggleSaved, onImport, onExportJson, onExportHtml, onPublish, publishing }) {
  const fileRef = useRef(null);
  const moreRef = useRef(null);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!moreOpen) return undefined;
    const close = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [moreOpen]);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img src={wolfLogo} alt="" />
        <span>Agência Wolf®</span>
      </div>
      <span className="topbar-client">{clientName}</span>
      <div className="topbar-actions">
        <button type="button" onClick={onNew}>Nova proposta</button>
        <button type="button" onClick={onSave} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
        <button type="button" onClick={onToggleSaved}>Propostas do time</button>
        <div className="topbar-more" ref={moreRef}>
          <button type="button" onClick={() => setMoreOpen((o) => !o)} aria-label="Mais opções"><DotsThree weight="bold" size={18} /></button>
          {moreOpen && (
            <div className="topbar-more-menu">
              <button type="button" onClick={() => { setMoreOpen(false); fileRef.current?.click(); }}>Importar .json</button>
              <button type="button" onClick={() => { setMoreOpen(false); onExportJson(); }}>Exportar .json</button>
              <button type="button" onClick={() => { setMoreOpen(false); onExportHtml(); }}>Exportar HTML (offline)</button>
            </div>
          )}
        </div>
        <button type="button" className="primary" onClick={onPublish} disabled={publishing}>{publishing ? "Gerando…" : "Gerar link do cliente"}</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => onImport(String(r.result)); r.readAsText(f); } e.target.value = ""; }} />
      </div>
    </header>
  );
}
