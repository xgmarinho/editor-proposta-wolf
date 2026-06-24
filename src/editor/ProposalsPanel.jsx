import React, { useState, useEffect, useCallback } from "react";
import { listProposals } from "./serverStore.js";

const STATUS = {
  draft: { label: "Rascunho", cls: "st-draft" },
  published: { label: "Enviada", cls: "st-pub" },
  viewed: { label: "Vista pelo cliente", cls: "st-view" },
};

function fmtDate(s) { return s ? s.slice(0, 10).split("-").reverse().join("/") : ""; }
function fmtPrice(v) { return v == null ? "" : "R$ " + Number(v).toLocaleString("pt-BR"); }

// Lista do time (multi-device): lê o store server-side. Status, autor, views.
export default function ProposalsPanel({ onOpen, onDelete, onClose }) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState(null);

  const refresh = useCallback(() => {
    setErr(null);
    listProposals().then(setItems).catch((e) => setErr(e.message || "erro"));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const del = async (id) => {
    if (!confirm("Excluir esta proposta? (remove o link do cliente também)")) return;
    await onDelete(id);
    refresh();
  };

  return (
    <div className="saved-overlay" onClick={onClose}>
      <div className="saved-panel pp-panel" onClick={(e) => e.stopPropagation()}>
        <div className="saved-head"><b>Propostas do time</b><button type="button" onClick={onClose}>fechar</button></div>
        {err && <p className="saved-empty">Erro: {err}. <button type="button" className="pp-link" onClick={refresh}>tentar de novo</button></p>}
        {!err && items == null && <p className="saved-empty">Carregando…</p>}
        {!err && items && items.length === 0 && <p className="saved-empty">Nenhuma proposta ainda. Crie uma em "Nova proposta".</p>}
        <ul className="pp-list">
          {items && items.map((p) => {
            const st = STATUS[p.status] || STATUS.draft;
            return (
              <li key={p.id} className="pp-item">
                <button type="button" className="pp-name" onClick={() => onOpen(p.id)}>
                  <b>{p.clientName}</b>
                  <small>{fmtPrice(p.price)} · {p.author} · {fmtDate(p.updatedAt)}</small>
                </button>
                <span className={"pp-status " + st.cls}>{st.label}{p.views ? ` · ${p.views}×` : ""}</span>
                <div className="pp-actions">
                  {p.slug && <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="pp-open-link">link</a>}
                  <button type="button" onClick={() => del(p.id)}>excluir</button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
