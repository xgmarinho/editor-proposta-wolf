import React, { useRef } from "react";
import wolfLogo from "../assets/wolf-logo.svg";

export default function TopBar({ clientName, onNewFromBase, onSaveCopy, onToggleSaved, onImport, onExportJson, onExportHtml, onPublish, publishing }) {
  const fileRef = useRef(null);
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img src={wolfLogo} alt="" />
        <span>Agência Wolf®</span>
      </div>
      <span className="topbar-client">{clientName}</span>
      <div className="topbar-actions">
        <button type="button" onClick={onNewFromBase}>Nova da base</button>
        <button type="button" onClick={onSaveCopy}>Salvar cópia</button>
        <button type="button" onClick={onToggleSaved}>Propostas salvas</button>
        <button type="button" onClick={() => fileRef.current?.click()}>Importar .json</button>
        <button type="button" onClick={onExportJson}>Exportar .json</button>
        <button type="button" onClick={onExportHtml}>Exportar HTML</button>
        <button type="button" className="primary" onClick={onPublish} disabled={publishing}>{publishing ? "Gerando…" : "Gerar link do cliente"}</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => onImport(String(r.result)); r.readAsText(f); } e.target.value = ""; }} />
      </div>
    </header>
  );
}
