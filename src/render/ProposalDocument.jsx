import React from "react";
import "../styles.css";
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
