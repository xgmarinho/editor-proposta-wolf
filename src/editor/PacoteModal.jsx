import React, { useState } from "react";
import { X, Plus } from "@phosphor-icons/react";
import { savePacote, RECORRENCIA_LABEL } from "./pacoteStore.js";

const CATEGORIAS = ["Tráfego Pago", "Social Media", "Branding", "Site / Landing", "Consultoria", "Audiovisual", "Outro"];

export default function PacoteModal({ pacote, onClose, onSaved }) {
  const p = pacote || {};
  const [nome, setNome] = useState(p.nome || "");
  const [categoria, setCategoria] = useState(p.categoria || CATEGORIAS[0]);
  const [descricao, setDescricao] = useState(p.descricao || "");
  const [preco, setPreco] = useState(p.preco != null ? String(p.preco) : "");
  const [recorrencia, setRecorrencia] = useState(p.recorrencia || "mensal");
  const [ativo, setAtivo] = useState(p.ativo !== false);
  const [itens, setItens] = useState(p.itens || []);
  const [novoItem, setNovoItem] = useState("");
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    const v = novoItem.trim();
    if (!v) return;
    setItens((i) => [...i, v]);
    setNovoItem("");
  };

  const salvar = async () => {
    if (!nome.trim()) { alert("Informe o nome do pacote."); return; }
    setSaving(true);
    try {
      await savePacote({
        id: p.id, nome: nome.trim(), categoria, descricao: descricao.trim(),
        preco: Number(preco) || 0, recorrencia, ativo, itens,
      });
      onSaved && onSaved();
      onClose();
    } catch (e) {
      alert(e.message || "Falha ao salvar.");
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{p.id ? "Editar pacote" : "Novo pacote"}</h3>
          <button className="icobtn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="fld">
            <label>Nome do pacote</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Gestão de Tráfego — Starter" autoFocus />
          </div>
          <div className="fld-row">
            <div className="fld">
              <label>Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="fld">
              <label>Recorrência</label>
              <select value={recorrencia} onChange={(e) => setRecorrencia(e.target.value)}>
                {Object.keys(RECORRENCIA_LABEL).map((r) => <option key={r} value={r}>{RECORRENCIA_LABEL[r]}</option>)}
              </select>
            </div>
          </div>
          <div className="fld">
            <label>Descrição</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que está incluso, pra quem é…" />
          </div>
          <div className="fld-row">
            <div className="fld">
              <label>Preço (R$)</label>
              <input type="number" min={0} step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="0,00" />
            </div>
            <div className="fld">
              <label>Status</label>
              <select value={ativo ? "1" : "0"} onChange={(e) => setAtivo(e.target.value === "1")}>
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>
            </div>
          </div>
          <div className="fld">
            <label>Itens inclusos</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={novoItem} onChange={(e) => setNovoItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
                placeholder="Ex: 16 posts/mês" />
              <button className="btn" type="button" onClick={addItem}><Plus size={16} /></button>
            </div>
            {itens.length > 0 && (
              <div className="chips">
                {itens.map((it, i) => (
                  <span className="chip" key={i}>{it}
                    <button type="button" onClick={() => setItens((arr) => arr.filter((_, idx) => idx !== i))}><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn primary" onClick={salvar} disabled={saving}>
            {saving ? "Salvando…" : p.id ? "Salvar alterações" : "Criar pacote"}
          </button>
        </div>
      </div>
    </div>
  );
}
