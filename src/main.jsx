import React from "react";
import { createRoot } from "react-dom/client";
import ProposalDocument from "./render/ProposalDocument.jsx";
import { baseProposal } from "./data/baseProposal.js";

createRoot(document.getElementById("root")).render(<ProposalDocument data={baseProposal} />);
