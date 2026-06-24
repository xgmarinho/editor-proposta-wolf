import React, { useEffect, useMemo, useState } from "react";
import { House, CurrencyDollar, PaperPlaneTilt, Eye, TrendUp, Package, ChartBar, Stack } from "@phosphor-icons/react";
import { listProposals } from "./serverStore.js";
import { listPacotes } from "./pacoteStore.js";

const STAGES = [
  { key: "rascunho", label: "Rascunho", cor: "var(--st-rascunho)" },
  { key: "enviada", label: "Enviada", cor: "var(--st-enviada)" },
  { key: "vista", label: "Vista", cor: "var(--st-vista)" },
  { key: "negociacao", label: "Negociação", cor: "var(--st-negociacao)" },
  { key: "ganha", label: "Ganha", cor: "var(--st-ganha)" },
  { key: "perdida", label: "Perdida", cor: "var(--st-perdida)" },
];
const brl = (n) => "R$ " + Number(n || 0).toLocaleString("pt-BR");

function StatCard({ icon: Ic, badge, badgeVariant, value, label }) {
  return (
    <div className="stat">
      <div className="stat-head">
        <div className="stat-icon"><Ic size={19} /></div>
        {badge && <span className={"vbtn " + (badgeVariant || "b")}>{badge}</span>}
      </div>
      <div className="stat-num">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard({ onNav }) {
  const [props, setProps] = useState(null);
  const [pacs, setPacs] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    listProposals().then(setProps).catch((e) => setErr(e.message || "erro"));
    listPacotes().then(setPacs).catch(() => {});
  }, []);

  const m = useMemo(() => {
    const list = props || [];
    const open = list.filter((p) => !["ganha", "perdida"].includes(p.stage));
    const enviadas = list.filter((p) => ["enviada", "vista", "negociacao", "ganha", "perdida"].includes(p.stage)).length;
    const vistas = list.filter((p) => ["vista", "negociacao", "ganha", "perdida"].includes(p.stage)).length;
    const ganhas = list.filter((p) => p.stage === "ganha").length;
    return {
      pipeline: open.reduce((s, p) => s + (Number(p.price) || 0), 0),
      abertas: open.length, enviadas, vistas, ganhas,
      taxaVista: enviadas ? Math.round((vistas / enviadas) * 100) : 0,
      taxaGanha: enviadas ? Math.round((ganhas / enviadas) * 100) : 0,
    };
  }, [props]);

  const cards = [
    { icon: CurrencyDollar, badge: "aberto", badgeVariant: "p", value: props ? brl(m.pipeline) : "—", label: "Pipeline aberto" },
    { icon: PaperPlaneTilt, badge: "saíram", badgeVariant: "b", value: props ? String(m.enviadas) : "—", label: "Propostas enviadas" },
    { icon: Eye, badge: "abertura", badgeVariant: "b", value: props ? m.taxaVista + "%" : "—", label: "Taxa de abertura" },
    { icon: TrendUp, badge: "ganhas", badgeVariant: "p", value: props ? m.taxaGanha + "%" : "—", label: "Conversão" },
  ];

  return (
    <div className="main-area">
      <div className="crumb">
        <span className="home"><House size={16} weight="fill" /></span>
        <span className="sep">/</span>
        <span className="cur">Dashboard</span>
      </div>

      <div className="page">
        <div className="page-head">
          <div>
            <div className="greet">Visão geral</div>
            <div className="page-sub">Pipeline de orçamentos e catálogo de serviços</div>
          </div>
        </div>

        {err && <div className="callout">Erro ao carregar: {err}</div>}

        <section className="stats">
          {cards.map((c) => <StatCard key={c.label} {...c} />)}
        </section>

        <section className="panels">
          <div className="panel">
            <div className="panel-head">
              <div className="ph-left">
                <div className="ph-icon"><ChartBar size={18} /></div>
                <div>
                  <div className="ph-title">Distribuição por estágio</div>
                  <div className="ph-sub">Onde estão as propostas</div>
                </div>
              </div>
            </div>
            <div className="panel-body">
              {STAGES.map((e) => {
                const n = (props || []).filter((p) => p.stage === e.key).length;
                const max = Math.max(1, (props || []).length);
                return (
                  <div key={e.key} className="bar-row">
                    <div className="bar-top">
                      <span><i className="dot" style={{ background: e.cor }} />{e.label}</span>
                      <span className="muted">{n}</span>
                    </div>
                    <div className="bar"><div className="bar-fill" style={{ width: `${(n / max) * 100}%`, background: e.cor }} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="ph-left">
                <div className="ph-icon"><Stack size={18} /></div>
                <div>
                  <div className="ph-title">Catálogo de serviços</div>
                  <div className="ph-sub">Pacotes cadastrados</div>
                </div>
              </div>
            </div>
            <div className="panel-body">
              <button className="cat-summary" onClick={() => onNav("pacotes")}>
                <div className="ph-icon"><Package size={18} /></div>
                <div>
                  <b>{pacs.length}</b>
                  <span>pacotes ({pacs.filter((p) => p.ativo).length} ativos)</span>
                </div>
              </button>
              {pacs.slice(0, 5).map((p) => (
                <div key={p.id} className="cat-row"><span>{p.nome}</span><b>{brl(p.preco)}</b></div>
              ))}
              {pacs.length === 0 && <p className="muted" style={{ fontSize: ".85rem" }}>Nenhum pacote ainda — cadastre em Produtos / Serviços.</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
