import React, { useEffect, useMemo, useState } from "react";
import { House, Plus, PencilSimple, Trash, Package } from "@phosphor-icons/react";
import { listPacotes, deletePacote, RECORRENCIA_LABEL } from "./pacoteStore.js";
import PacoteModal from "./PacoteModal.jsx";

const brl = (n) => "R$ " + Number(n || 0).toLocaleString("pt-BR");

export default function Pacotes() {
  const [itens, setItens] = useState(null);
  const [err, setErr] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [edit, setEdit] = useState(undefined); // undefined fechado | null novo | obj editar

  const refresh = () => {
    setErr(null);
    listPacotes().then(setItens).catch((e) => setErr(e.message || "erro"));
  };
  useEffect(refresh, []);

  const categorias = useMemo(
    () => ["todas", ...Array.from(new Set((itens || []).map((p) => p.categoria).filter(Boolean)))],
    [itens]
  );
  const visiveis = (itens || []).filter((p) => filtro === "todas" || p.categoria === filtro);

  const remover = async (p) => {
    if (!confirm(`Excluir o pacote "${p.nome}"?`)) return;
    setItens((l) => l.filter((x) => x.id !== p.id));
    try { await deletePacote(p.id); } catch { refresh(); }
  };

  return (
    <div className="main-area">
      <div className="crumb">
        <span className="home"><House size={16} weight="fill" /></span>
        <span className="sep">/</span>
        <span className="cur">Produtos / Serviços</span>
      </div>

      <div className="page">
        <div className="page-head">
          <div>
            <div className="greet">Produtos / Serviços</div>
            <div className="page-sub">Catálogo de pacotes usados nas propostas</div>
          </div>
          <div className="head-actions">
            <select className="sel" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
              {categorias.map((c) => <option key={c} value={c}>{c === "todas" ? "Todas as categorias" : c}</option>)}
            </select>
            <button className="btn primary" onClick={() => setEdit(null)}><Plus size={16} weight="bold" />Novo pacote</button>
          </div>
        </div>

        {err && <div className="callout">Erro ao carregar: {err}</div>}

        {itens && visiveis.length === 0 ? (
          <div className="panel"><div className="empty"><Package size={36} /><p>Nenhum pacote cadastrado ainda.</p></div></div>
        ) : (
          <div className="panel">
            <table className="tbl">
              <thead>
                <tr><th>Pacote</th><th>Categoria</th><th>Recorrência</th><th>Preço</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {visiveis.map((p) => (
                  <tr key={p.id}>
                    <td><div className="t-name">{p.nome}</div>{p.descricao && <div className="t-desc">{p.descricao}</div>}</td>
                    <td><span className="pill">{p.categoria}</span></td>
                    <td className="muted">{RECORRENCIA_LABEL[p.recorrencia] || p.recorrencia}</td>
                    <td><b>{brl(p.preco)}</b></td>
                    <td><span className="pill"><i className="pd" style={{ background: p.ativo ? "var(--st-ganha)" : "var(--muted)" }} />{p.ativo ? "Ativo" : "Inativo"}</span></td>
                    <td>
                      <div className="row-act">
                        <button className="icobtn" title="Editar" onClick={() => setEdit(p)}><PencilSimple size={16} /></button>
                        <button className="icobtn" title="Excluir" onClick={() => remover(p)}><Trash size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!itens && <tr><td colSpan={6} className="muted" style={{ padding: 22 }}>Carregando…</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {edit !== undefined && (
        <PacoteModal pacote={edit} onClose={() => setEdit(undefined)} onSaved={refresh} />
      )}
    </div>
  );
}
