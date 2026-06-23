import React, { useRef } from "react";

export default function TopBar({ clientName, onNewFromBase, onSaveCopy, onToggleSaved, onImport, onExportJson, onExportHtml }) {
  const fileRef = useRef(null);
  return (
    <header className="topbar">
      <strong>Editor · Proposta Wolf®</strong>
      <span className="topbar-client">{clientName}</span>
      <div className="topbar-actions">
        <button type="button" onClick={onNewFromBase}>Nova da base</button>
        <button type="button" onClick={onSaveCopy}>Salvar cópia</button>
        <button type="button" onClick={onToggleSaved}>Propostas salvas</button>
        <button type="button" onClick={() => fileRef.current?.click()}>Importar .json</button>
        <button type="button" onClick={onExportJson}>Exportar .json</button>
        <button type="button" className="primary" onClick={onExportHtml}>Exportar HTML</button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => onImport(String(r.result)); r.readAsText(f); } e.target.value = ""; }} />
      </div>
    </header>
  );
}
