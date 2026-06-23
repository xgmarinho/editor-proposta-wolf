import React from "react";

export default function SavedPanel({ copies, onOpen, onDuplicate, onDelete, onClose }) {
  return (
    <div className="saved-overlay" onClick={onClose}>
      <div className="saved-panel" onClick={(e) => e.stopPropagation()}>
        <div className="saved-head"><b>Propostas salvas</b><button type="button" onClick={onClose}>fechar</button></div>
        {copies.length === 0 && <p className="saved-empty">Nenhuma cópia salva ainda.</p>}
        <ul>
          {copies.map((c) => (
            <li key={c.id}>
              <button type="button" className="saved-name" onClick={() => onOpen(c.id)}>{c.name}</button>
              <small>{c.updatedAt?.slice(0, 10)}</small>
              <span className="saved-actions">
                <button type="button" onClick={() => onDuplicate(c.id)}>duplicar</button>
                <button type="button" onClick={() => onDelete(c.id)}>excluir</button>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
