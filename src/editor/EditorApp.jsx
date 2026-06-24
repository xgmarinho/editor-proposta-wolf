import React, { useEffect, useRef, useState } from "react";
import { baseProposal } from "../data/baseProposal.js";
import { cloneProposal } from "../data/proposalOps.js";
import { formSchema } from "./formSchema.js";
import SectionForm from "./SectionForm.jsx";
import Preview from "./Preview.jsx";
import TopBar from "./TopBar.jsx";
import SavedPanel from "./SavedPanel.jsx";
import NewProposalModal from "./NewProposalModal.jsx";
import { applyPreset, getPreset } from "../data/presets.js";
import viewerTemplate from "./viewerTemplate.js";
import { buildExportHtml, slugify } from "./exportHtml.js";
import { publishProposal } from "./publish.js";
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

// Campos derivados: nunca editados à mão, sempre seguem clientName/validityDays.
// Mantém a proposta consistente mesmo sem esses campos na sidebar.
function applyDerived(d) {
  const days = Number(d.meta.validityDays);
  return {
    ...d,
    overview: { ...d.overview, headingStrong: d.meta.clientName },
    proposal: { ...d.proposal, validity: `Proposta válida por ${days} dia${days === 1 ? "" : "s"}` },
  };
}

export default function EditorApp() {
  const [data, setData] = useState(() => applyDerived(loadDraft() || cloneProposal(baseProposal)));
  // Toda mutação passa por aqui → re-deriva os campos dependentes.
  const updateData = (next) => setData(applyDerived(next));
  const [showSaved, setShowSaved] = useState(false);
  // Primeiro acesso (sem rascunho salvo) abre o início rápido — barreira mínima.
  const [showNew, setShowNew] = useState(() => !loadDraft());
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

  const onCreateNew = ({ presetId, clientName, price, validityDays }) => {
    updateData(applyPreset(getPreset(presetId), { clientName, price, validityDays }));
    setShowNew(false);
  };
  const onSaveCopy = () => { const name = prompt("Nome da cópia:", data.meta.clientName || "Proposta"); if (name) { saveCopy(name, data); refreshCopies(); alert("Cópia salva."); } };
  const onImport = (text) => { try { updateData(importJson(text)); } catch { alert("JSON inválido."); } };
  const onExportJson = () => download(`proposta-${slugify(data.meta.clientName)}.json`, exportJson(data), "application/json");
  const onExportHtml = () => download(`proposta-${slugify(data.meta.clientName)}.html`, buildExportHtml(viewerTemplate, data), "text/html");
  const [publishing, setPublishing] = useState(false);
  const onPublish = async () => {
    setPublishing(true);
    try {
      // Slug estável por proposta: gera 1x com sufixo aleatório (link não-advinhável)
      // e guarda em meta.shareSlug — republicar reusa a mesma URL.
      let publishData = data;
      let slug = data.meta.shareSlug;
      if (!slug) {
        const rand = Math.random().toString(36).slice(2, 8);
        slug = `${slugify(data.meta.clientName)}-${rand}`;
        publishData = applyDerived({ ...data, meta: { ...data.meta, shareSlug: slug } });
        setData(publishData);
      }
      const url = await publishProposal(publishData, slug);
      try { await navigator.clipboard.writeText(url); } catch {}
      prompt("Link do cliente (copiado):", url);
    } catch (e) {
      alert(e.message || "Falha ao publicar.");
    } finally {
      setPublishing(false);
    }
  };
  const onOpen = (id) => { const c = loadCopy(id); if (c) { updateData(cloneProposal(c.data)); setShowSaved(false); } };
  const onDuplicate = (id) => { duplicateCopy(id); refreshCopies(); };
  const onDelete = (id) => { if (confirm("Excluir esta cópia?")) { deleteCopy(id); refreshCopies(); } };

  return (
    <div className="editor">
      <TopBar
        clientName={data.meta.clientName}
        onNew={() => setShowNew(true)} onSaveCopy={onSaveCopy}
        onToggleSaved={() => setShowSaved(true)} onImport={onImport}
        onExportJson={onExportJson} onExportHtml={onExportHtml}
        onPublish={onPublish} publishing={publishing}
      />
      <div className="editor-body">
        <div className="editor-form">
          {formSchema.map((section, i) => {
            const showGroup = i === 0 || formSchema[i - 1].group !== section.group;
            return (
              <React.Fragment key={section.key}>
                {showGroup && <p className="form-group-label">{section.group}</p>}
                <SectionForm section={section} data={data} onChange={updateData} onFocus={onFocusSection} />
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
      {showNew && (
        <NewProposalModal onCreate={onCreateNew} onClose={() => setShowNew(false)} />
      )}
    </div>
  );
}
