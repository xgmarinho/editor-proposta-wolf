import React, { useEffect, useRef, useState } from "react";
import { formSchema } from "./formSchema.js";
import SectionForm from "./SectionForm.jsx";
import Preview from "./Preview.jsx";
import TopBar from "./TopBar.jsx";
import ShareModal from "./ShareModal.jsx";
import viewerTemplate from "./viewerTemplate.js";
import { buildExportHtml, slugify } from "./exportHtml.js";
import { publishProposal } from "./publish.js";
import { saveProposal } from "./serverStore.js";
import { saveDraft, exportJson, importJson } from "./storage.js";
import "./editor.css";

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// Campos derivados: nunca editados à mão, sempre seguem clientName/validityDays.
export function applyDerived(d) {
  const days = Number(d.meta.validityDays);
  return {
    ...d,
    overview: { ...d.overview, headingStrong: d.meta.clientName },
    proposal: { ...d.proposal, validity: `Proposta válida por ${days} dia${days === 1 ? "" : "s"}` },
  };
}

// Editor de UMA proposta. Recebe a proposta a editar do App (board pipeline-first).
export default function EditorApp({ initialData, initialId, onBack, onChanged }) {
  const [data, setData] = useState(() => applyDerived(initialData));
  const updateData = (next) => setData(applyDerived(next));
  const [currentId, setCurrentId] = useState(initialId || null);
  const [share, setShare] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [focus, setFocus] = useState({ key: null, nonce: 0 });
  const debounce = useRef(null);

  const onFocusSection = (key) => setFocus((f) => ({ key, nonce: f.nonce + 1 }));

  // Autosave do rascunho local (recuperação contra crash; o store do time é a fonte da verdade).
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => saveDraft(data), 400);
    return () => clearTimeout(debounce.current);
  }, [data]);

  const onSave = async () => {
    setSaving(true);
    try {
      const out = await saveProposal(data, currentId);
      setCurrentId(out.id);
      onChanged && onChanged();
    } catch (e) { alert(e.message || "Falha ao salvar."); }
    finally { setSaving(false); }
  };
  const onImport = (text) => { try { updateData(importJson(text)); setCurrentId(null); } catch { alert("JSON inválido."); } };
  const onExportJson = () => download(`proposta-${slugify(data.meta.clientName)}.json`, exportJson(data), "application/json");
  const onExportHtml = () => download(`proposta-${slugify(data.meta.clientName)}.html`, buildExportHtml(viewerTemplate, data), "text/html");
  const onPublish = async () => {
    setPublishing(true);
    try {
      let publishData = data;
      let slug = data.meta.shareSlug;
      if (!slug) {
        const rand = Math.random().toString(36).slice(2, 8);
        slug = `${slugify(data.meta.clientName)}-${rand}`;
        publishData = applyDerived({ ...data, meta: { ...data.meta, shareSlug: slug } });
        setData(publishData);
      }
      const out = await publishProposal(publishData, slug, currentId);
      setCurrentId(out.id);
      setShare({ url: out.url, clientName: publishData.meta.clientName });
      onChanged && onChanged();
    } catch (e) {
      alert(e.message || "Falha ao publicar.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="editor">
      <TopBar
        clientName={data.meta.clientName}
        onBack={onBack} onSave={onSave} saving={saving}
        onImport={onImport} onExportJson={onExportJson} onExportHtml={onExportHtml}
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
      {share && (
        <ShareModal url={share.url} clientName={share.clientName} onClose={() => setShare(null)} />
      )}
    </div>
  );
}
