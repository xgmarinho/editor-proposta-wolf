import React, { useState } from "react";
import { baseProposal } from "../data/baseProposal.js";
import { cloneProposal } from "../data/proposalOps.js";
import { applyPreset, getPreset } from "../data/presets.js";
import AppShell from "./AppShell.jsx";
import Dashboard from "./Dashboard.jsx";
import Pacotes from "./Pacotes.jsx";
import KanbanBoard from "./KanbanBoard.jsx";
import EditorApp, { applyDerived } from "./EditorApp.jsx";
import NewProposalModal from "./NewProposalModal.jsx";
import "./editor.css";

// Raiz: shell com sidebar (dashboard / pipeline / produtos-serviços).
// Editar/criar proposta entra no editor em tela cheia (sem sidebar).
export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | board | pacotes | config | editor
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const openEditor = (data, id) => { setEditing({ data: cloneProposal(data), id: id || null }); setView("editor"); };
  const onOpenProposal = (p) => openEditor(p.data, p.id);
  const onCreateNew = ({ presetId, clientName, price, validityDays }) => {
    setShowNew(false);
    openEditor(applyPreset(getPreset(presetId), { clientName, price, validityDays }), null);
  };
  const backToShell = () => { setEditing(null); setView("board"); };

  if (view === "editor" && editing) {
    return (
      <EditorApp
        key={editing.id || "novo"}
        initialData={editing.data}
        initialId={editing.id}
        onBack={backToShell}
        onChanged={() => {}}
      />
    );
  }

  return (
    <AppShell active={view} onNav={setView}>
      {view === "dashboard" && <Dashboard onNav={setView} />}
      {view === "board" && <KanbanBoard onOpen={onOpenProposal} onNew={() => setShowNew(true)} />}
      {view === "pacotes" && <Pacotes />}
      {view === "config" && (
        <div className="main-area">
          <div className="crumb"><span className="cur">Configurações</span></div>
          <div className="page">
            <div className="page-head"><div><div className="greet">Configurações</div><div className="page-sub">Preferências do painel</div></div></div>
            <div className="panel"><div className="empty"><p>Em breve.</p></div></div>
          </div>
        </div>
      )}
      {showNew && <NewProposalModal onCreate={onCreateNew} onClose={() => setShowNew(false)} />}
    </AppShell>
  );
}
