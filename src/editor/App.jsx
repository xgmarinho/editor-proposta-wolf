import React, { useState } from "react";
import { baseProposal } from "../data/baseProposal.js";
import { cloneProposal } from "../data/proposalOps.js";
import { applyPreset, getPreset } from "../data/presets.js";
import KanbanBoard from "./KanbanBoard.jsx";
import EditorApp, { applyDerived } from "./EditorApp.jsx";
import NewProposalModal from "./NewProposalModal.jsx";
import "./editor.css";

// Raiz pipeline-first: abre no board (CRM do time); editar/criar entra no editor.
export default function App() {
  const [view, setView] = useState("board"); // "board" | "editor"
  const [editing, setEditing] = useState(null); // { data, id }
  const [showNew, setShowNew] = useState(false);

  const openEditor = (data, id) => { setEditing({ data: cloneProposal(data), id: id || null }); setView("editor"); };
  const onOpenProposal = (p) => openEditor(p.data, p.id); // p = proposta completa do store
  const onCreateNew = ({ presetId, clientName, price, validityDays }) => {
    setShowNew(false);
    openEditor(applyPreset(getPreset(presetId), { clientName, price, validityDays }), null);
  };
  const backToBoard = () => { setEditing(null); setView("board"); };

  if (view === "editor" && editing) {
    return (
      <EditorApp
        key={editing.id || "novo"}
        initialData={editing.data}
        initialId={editing.id}
        onBack={backToBoard}
        onChanged={() => {}}
      />
    );
  }
  return (
    <>
      <KanbanBoard onOpen={onOpenProposal} onNew={() => setShowNew(true)} />
      {showNew && <NewProposalModal onCreate={onCreateNew} onClose={() => setShowNew(false)} />}
    </>
  );
}
