import React from "react";
import { createRoot } from "react-dom/client";
import ProposalDocument from "../render/ProposalDocument.jsx";
import { baseProposal } from "../data/baseProposal.js";

const data = typeof window !== "undefined" && window.__PROPOSTA__ ? window.__PROPOSTA__ : baseProposal;
createRoot(document.getElementById("root")).render(<ProposalDocument data={data} />);
