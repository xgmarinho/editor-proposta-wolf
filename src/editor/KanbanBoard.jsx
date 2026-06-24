import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, ArrowClockwise } from "@phosphor-icons/react";
import { listProposals, getProposal, patchProposal, deleteProposal } from "./serverStore.js";

const COLUMNS = [
  { stage: "rascunho", label: "Rascunho" },
  { stage: "enviada", label: "Enviada" },
  { stage: "vista", label: "Vista" },
  { stage: "negociacao", label: "Negociação" },
  { stage: "ganha", label: "Ganha" },
  { stage: "perdida", label: "Perdida" },
];
const fmtPrice = (v) => (v == null ? "—" : "R$ " + Number(v).toLocaleString("pt-BR"));
function daysAgo(iso) {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "hoje" : d === 1 ? "ontem" : `há ${d} dias`;
}

export default function KanbanBoard({ onOpen, onNew }) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState(null);
  const [author, setAuthor] = useState("todos");
  const [dragId, setDragId] = useState(null);
  const [overStage, setOverStage] = useState(null);

  const refresh = useCallback(() => {
    setErr(null);
    listProposals().then(setItems).catch((e) => setErr(e.message || "erro"));
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const authors = useMemo(() => ["todos", ...Array.from(new Set((items || []).map((p) => p.author).filter(Boolean)))], [items]);
  const filtered = useMemo(() => (items || []).filter((p) => author === "todos" || p.author === author), [items, author]);

  const byStage = (stage) => filtered.filter((p) => p.stage === stage);

  // métricas: pipeline em aberto (não terminal) + conversão
  const metrics = useMemo(() => {
    const open = filtered.filter((p) => !["ganha", "perdida"].includes(p.stage));
    const pipeline = open.reduce((s, p) => s + (Number(p.price) || 0), 0);
    const enviadas = filtered.filter((p) => ["enviada", "vista", "negociacao", "ganha", "perdida"].includes(p.stage)).length;
    const vistas = filtered.filter((p) => ["vista", "negociacao", "ganha", "perdida"].includes(p.stage)).length;
    const ganhas = filtered.filter((p) => p.stage === "ganha").length;
    return { pipeline, enviadas, vistas, ganhas,
      taxaVista: enviadas ? Math.round((vistas / enviadas) * 100) : 0,
      taxaGanha: enviadas ? Math.round((ganhas / enviadas) * 100) : 0 };
  }, [filtered]);

  const drop = async (stage) => {
    setOverStage(null);
    const id = dragId; setDragId(null);
    if (!id) return;
    const p = (items || []).find((x) => x.id === id);
    if (!p || p.stage === stage) return;
    // otimista
    setItems((list) => list.map((x) => (x.id === id ? { ...x, stage } : x)));
    try {
      if (stage === "perdida") {
        const reason = prompt("Motivo da perda (opcional):") || "";
        await patchProposal(id, { stage, lostReason: reason });
      } else {
        await patchProposal(id, { stage });
      }
    } catch (e) { alert(e.message || "Falha ao mover."); refresh(); }
  };

  const open = async (id) => {
    try { const p = await getProposal(id); onOpen(p); }
    catch (e) { alert(e.message || "Falha ao abrir."); }
  };
  const del = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Excluir esta proposta? (remove o link do cliente também)")) return;
    setItems((list) => list.filter((x) => x.id !== id));
    try { await deleteProposal(id); } catch { refresh(); }
  };

  return (
    <div className="board">
      <header className="board-top">
        <div className="board-brand"><b>Agência Wolf®</b><span>Pipeline de propostas</span></div>
        <div className="board-metrics">
          <div className="bm"><small>Pipeline aberto</small><b>{fmtPrice(metrics.pipeline)}</b></div>
          <div className="bm"><small>Enviadas</small><b>{metrics.enviadas}</b></div>
          <div className="bm"><small>Taxa de abertura</small><b>{metrics.taxaVista}%</b></div>
          <div className="bm"><small>Conversão (ganhas)</small><b>{metrics.taxaGanha}%</b></div>
        </div>
        <div className="board-actions">
          <select className="board-filter" value={author} onChange={(e) => setAuthor(e.target.value)}>
            {authors.map((a) => <option key={a} value={a}>{a === "todos" ? "Todos os donos" : a}</option>)}
          </select>
          <button type="button" className="board-refresh" onClick={refresh} title="Atualizar"><ArrowClockwise weight="bold" size={15} /></button>
          <button type="button" className="board-new" onClick={onNew}><Plus weight="bold" size={14} /> Nova proposta</button>
        </div>
      </header>

      {err && <p className="board-msg">Erro: {err}. <button type="button" className="pp-link" onClick={refresh}>tentar de novo</button></p>}
      {!err && items == null && <p className="board-msg">Carregando pipeline…</p>}

      {!err && items && (
        <div className="board-cols">
          {COLUMNS.map((col) => {
            const cards = byStage(col.stage);
            const sum = cards.reduce((s, p) => s + (Number(p.price) || 0), 0);
            return (
              <div key={col.stage}
                className={"col" + (overStage === col.stage ? " over" : "")}
                onDragOver={(e) => { e.preventDefault(); setOverStage(col.stage); }}
                onDragLeave={() => setOverStage((s) => (s === col.stage ? null : s))}
                onDrop={() => drop(col.stage)}>
                <div className="col-head">
                  <span className={"col-dot d-" + col.stage} />
                  <b>{col.label}</b>
                  <small>{cards.length}{sum ? " · " + fmtPrice(sum) : ""}</small>
                </div>
                <div className="col-body">
                  {cards.map((p) => (
                    <article key={p.id}
                      className={"card" + (p.views ? " seen" : "")}
                      draggable
                      onDragStart={() => setDragId(p.id)}
                      onDragEnd={() => { setDragId(null); setOverStage(null); }}
                      onClick={() => open(p.id)}>
                      <div className="card-top">
                        <b className="card-client">{p.clientName}</b>
                        <button type="button" className="card-del" onClick={(e) => del(e, p.id)} title="Excluir">×</button>
                      </div>
                      <div className="card-price">{fmtPrice(p.price)}</div>
                      <div className="card-meta">
                        <span>{p.author}</span>
                        {p.views ? <span className="card-views">aberta {p.views}×</span> : <span>{daysAgo(p.publishedAt || p.updatedAt)}</span>}
                      </div>
                    </article>
                  ))}
                  {cards.length === 0 && <p className="col-empty">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
