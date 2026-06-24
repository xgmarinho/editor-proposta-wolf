import React, { useState } from "react";
import { presets } from "../data/presets.js";

// Início rápido: 3 campos (cliente · pacote · preço) → proposta pronta.
// Barreira mínima de entrada. Preço pré-preenche do pacote, editável.
export default function NewProposalModal({ onCreate, onClose }) {
  const [clientName, setClientName] = useState("");
  const [presetId, setPresetId] = useState("pro");
  const [price, setPrice] = useState(() => presets.find((p) => p.presetId === "pro")?.priceHint ?? 12000);
  const [validityDays, setValidityDays] = useState(7);
  const [touchedPrice, setTouchedPrice] = useState(false);

  const pickPreset = (id) => {
    setPresetId(id);
    if (!touchedPrice) {
      const hint = presets.find((p) => p.presetId === id)?.priceHint;
      if (hint != null) setPrice(hint);
    }
  };

  const create = () => {
    onCreate({ presetId, clientName: clientName.trim() || "Novo cliente", price, validityDays });
  };

  return (
    <div className="saved-overlay" onClick={onClose}>
      <div className="saved-panel npm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="saved-head"><b>Nova proposta</b><button type="button" onClick={onClose}>fechar</button></div>

        <label className="npm-label">Nome do cliente
          <input className="npm-input" autoFocus value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") create(); }}
            placeholder="Ex: Design Elements" />
        </label>

        <p className="npm-label" style={{ marginBottom: 6 }}>Pacote</p>
        <div className="npm-presets">
          {presets.map((p) => (
            <button type="button" key={p.presetId}
              className={"npm-preset" + (presetId === p.presetId ? " active" : "")}
              onClick={() => pickPreset(p.presetId)}>
              <b>{p.label}</b>
              <small>{p.tagline}</small>
            </button>
          ))}
        </div>

        <div className="npm-row">
          <label className="npm-label">Preço (R$ / mês)
            <input className="npm-input" type="number" value={price}
              onChange={(e) => { setTouchedPrice(true); setPrice(e.target.value); }} />
          </label>
          <label className="npm-label">Validade (dias)
            <input className="npm-input" type="number" value={validityDays}
              onChange={(e) => setValidityDays(e.target.value)} />
          </label>
        </div>

        <button type="button" className="npm-create" onClick={create}>Criar proposta</button>
      </div>
    </div>
  );
}
