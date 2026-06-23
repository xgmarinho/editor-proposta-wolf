import React, { useEffect, useRef, useState } from "react";
import { baseProposal } from "../data/baseProposal.js";
import { cloneProposal } from "../data/proposalOps.js";
import { formSchema } from "./formSchema.js";
import SectionForm from "./SectionForm.jsx";
import Preview from "./Preview.jsx";
import TopBar from "./TopBar.jsx";
import SavedPanel from "./SavedPanel.jsx";
import viewerTemplate from "./viewerTemplate.js";
import { buildExportHtml, slugify } from "./exportHtml.js";
import {
  saveDraft, loadDraft, listCopies, saveCopy, loadCopy, duplicateCopy, deleteCopy, exportJson, importJson,
} from "./storage.js";
import "./editor.css";

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function EditorApp() {
  const [data, setData] = useState(() => loadDraft() || cloneProposal(baseProposal));
  const [showSaved, setShowSaved] = useState(false);
  const [copies, setCopies] = useState(() => listCopies());
  const [focus, setFocus] = useState({ key: null, nonce: 0 });
  const debounce = useRef(null);

  // Clicar numa seção do menu → rola o preview até ela e destaca (nonce re-dispara).
  const onFocusSection = (key) => setFocus((f) => ({ key, nonce: f.nonce + 1 }));

  // Autosave do rascunho (debounce).
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => saveDraft(data), 400);
    return () => clearTimeout(debounce.current);
  }, [data]);

  const refreshCopies = () => setCopies(listCopies());

  const onNewFromBase = () => { if (confirm("Começar uma nova proposta a partir da base? O rascunho atual será substituído.")) setData(cloneProposal(baseProposal)); };
  const onSaveCopy = () => { const name = prompt("Nome da cópia:", data.meta.clientName || "Proposta"); if (name) { saveCopy(name, data); refreshCopies(); alert("Cópia salva."); } };
  const onImport = (text) => { try { setData(importJson(text)); } catch { alert("JSON inválido."); } };
  const onExportJson = () => download(`proposta-${slugify(data.meta.clientName)}.json`, exportJson(data), "application/json");
  const onExportHtml = () => download(`proposta-${slugify(data.meta.clientName)}.html`, buildExportHtml(viewerTemplate, data), "text/html");
  const onOpen = (id) => { const c = loadCopy(id); if (c) { setData(cloneProposal(c.data)); setShowSaved(false); } };
  const onDuplicate = (id) => { duplicateCopy(id); refreshCopies(); };
  const onDelete = (id) => { if (confirm("Excluir esta cópia?")) { deleteCopy(id); refreshCopies(); } };

  return (
    <div className="editor">
      <TopBar
        clientName={data.meta.clientName}
        onNewFromBase={onNewFromBase} onSaveCopy={onSaveCopy}
        onToggleSaved={() => setShowSaved(true)} onImport={onImport}
        onExportJson={onExportJson} onExportHtml={onExportHtml}
      />
      <div className="editor-body">
        <div className="editor-form">
          {formSchema.map((section, i) => {
            const showGroup = i === 0 || formSchema[i - 1].group !== section.group;
            return (
              <React.Fragment key={section.key}>
                {showGroup && <p className="form-group-label">{section.group}</p>}
                <SectionForm section={section} data={data} onChange={setData} onFocus={onFocusSection} />
              </React.Fragment>
            );
          })}
        </div>
        <div className="editor-preview">
          <Preview data={data} focus={focus} />
        </div>
      </div>
      {showSaved && (
        <SavedPanel copies={copies} onOpen={onOpen} onDuplicate={onDuplicate} onDelete={onDelete} onClose={() => setShowSaved(false)} />
      )}
    </div>
  );
}
