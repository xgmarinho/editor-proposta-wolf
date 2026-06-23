import React from "react";
// NÃO importar "../styles.css" aqui: como import com efeito colateral, o Vite o
// injetaria GLOBALMENTE no documento pai (vazando no cromo do editor). O CSS da
// proposta é entregue só onde deve: no iframe do editor (Preview, via ?inline) e
// no viewer standalone/export (viewer/main.jsx importa o styles.css).
import { Hero, Marquee, Overview, Scope, Materials, Strategy, StartSection, Team, Proposal, Footer } from "./sections.jsx";

export default function ProposalDocument({ data }) {
  return (
    <main>
      <Hero data={data} />
      <Marquee data={data} />
      <Overview data={data} />
      <Scope data={data} />
      <Materials data={data} />
      <Strategy data={data} />
      <StartSection data={data} />
      <Team data={data} />
      <Proposal data={data} />
      <Footer data={data} />
    </main>
  );
}
