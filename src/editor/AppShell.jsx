import React from "react";
import { SquaresFour, Kanban, Package, Gear } from "@phosphor-icons/react";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: SquaresFour },
  { key: "board", label: "Pipeline", icon: Kanban },
  { key: "pacotes", label: "Produtos / Serviços", icon: Package },
];

function Cube() {
  return (
    <svg className="cube" viewBox="0 0 32 32" fill="none">
      <path d="M16 3 28 9.5v13L16 29 4 22.5v-13z" fill="#fff" fillOpacity=".06" />
      <path d="M16 3 28 9.5 16 16 4 9.5z" fill="#fff" />
      <path d="M4 9.5 16 16v13L4 22.5z" fill="#cfcfd6" />
      <path d="M28 9.5 16 16v13l12-6.5z" fill="#9b9ba6" />
    </svg>
  );
}

export default function AppShell({ active, onNav, children }) {
  return (
    <div className="shell">
      <aside className="side">
        <div className="side-brand">
          <Cube />
          <b>Wolf</b>
        </div>

        <div className="side-label">Operação</div>
        {NAV.map((n) => (
          <button
            key={n.key}
            className={"side-item" + (active === n.key ? " active" : "")}
            onClick={() => onNav(n.key)}
          >
            <n.icon size={19} weight={active === n.key ? "fill" : "regular"} />
            {n.label}
          </button>
        ))}

        <div className="side-label">Sistema</div>
        <button
          className={"side-item" + (active === "config" ? " active" : "")}
          onClick={() => onNav("config")}
        >
          <Gear size={19} />
          Configurações
        </button>

        <div className="side-foot">
          <div className="side-av">N</div>
          <div>
            <b>Time Wolf</b>
            <span>acesso restrito</span>
          </div>
        </div>
      </aside>
      <div className="shell-main">{children}</div>
    </div>
  );
}
