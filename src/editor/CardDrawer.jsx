import React, { useState } from "react";
import { patchProposal } from "./serverStore.js";

const STAGES = [
  { stage: "rascunho", label: "Rascunho" },
  { stage: "enviada", label: "Enviada" },
  { stage: "vista", label: "Vista" },
  { stage: "negociacao", label: "Negociação" },
  { stage: "ganha", label: "Ganha" },
  { stage: "perdida", label: "Perdida" },
];
const fmtPrice = (v) => (v == null ? "—" : "R$ " + Number(v).toLocaleString("pt-BR"));
const onlyDigits = (s) => (s || "").replace(/\D/g, "");

// Detalhe/CRM de uma proposta: contato, notas, próxima ação, estágio, ganha/perdida.
// Lê do item da lista (já tem tudo menos o blob `data`); salva via PATCH.
export default function CardDrawer({ item, onClose, onEdit, onChanged }) {
  const [contact, setContact] = useState(item.contact || "");
  const [notes, setNotes] = useState(item.notes || "");
  const [naText, setNaText] = useState(item.nextAction?.text || "");
  const [naDate, setNaDate] = useState(item.nextAction?.date || "");
  const [stage, setStage] = useState(item.stage);
  const [saving, setSaving] = useState(false);

  const save = async (extra = {}) => {
    setSaving(true);
    try {
      const nextAction = naText || naDate ? { text: naText, date: naDate } : null;
      await patchProposal(item.id, { contact, notes, nextAction, stage, ...extra });
      onChanged && onChanged();
      onClose();
    } catch (e) { alert(e.message || "Falha ao salvar."); }
    finally { setSaving(false); }
  };

  const setStageQuick = async (s) => {
    if (s === "perdida") {
      const reason = prompt("Motivo da perda (opcional):") || "";
      setStage(s); await save({ stage: s, lostReason: reason });
    } else { setStage(s); await save({ stage: s }); }
  };

  const wa = contact ? "https://wa.me/" + onlyDigits(contact) : null;
  const link = item.slug ? `${location.origin}/p/${item.slug}` : null;

  return (
    <div className="saved-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="saved-head">
          <b>{item.clientName}</b>
          <button type="button" onClick={onClose}>fechar</button>
        </div>
        <div className="drawer-sub">{fmtPrice(item.price)} · {item.author}{item.views ? ` · aberta ${item.views}×` : ""}</div>

        <p className="drawer-lbl">Estágio</p>
        <div className="drawer-stages">
          {STAGES.map((s) => (
            <button type="button" key={s.stage}
              className={"drawer-stage" + (stage === s.stage ? " active" : "")}
              onClick={() => setStageQuick(s.stage)}>{s.label}</button>
          ))}
        </div>

        <label className="drawer-lbl">Contato (WhatsApp)
          <div className="drawer-contact">
            <input className="npm-input" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="55 73 9 9999-9999" />
            {wa && <a className="drawer-wa" href={wa} target="_blank" rel="noreferrer">abrir</a>}
          </div>
        </label>

        <div className="npm-row">
          <label className="drawer-lbl">Próxima ação
            <input className="npm-input" value={naText} onChange={(e) => setNaText(e.target.value)} placeholder="Ex: cobrar retorno" />
          </label>
          <label className="drawer-lbl">Quando
            <input className="npm-input" type="date" value={naDate} onChange={(e) => setNaDate(e.target.value)} />
          </label>
        </div>

        <label className="drawer-lbl">Notas da negociação
          <textarea className="npm-input drawer-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Histórico, objeções, próximos passos…" />
        </label>

        {link && <div className="drawer-link">Link do cliente: <a href={link} target="_blank" rel="noreferrer">{item.slug}</a></div>}

        <div className="drawer-foot">
          <button type="button" className="drawer-edit" onClick={() => onEdit(item.id)}>Editar proposta</button>
          <button type="button" className="drawer-save" onClick={() => save()} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</button>
        </div>
      </div>
    </div>
  );
}
