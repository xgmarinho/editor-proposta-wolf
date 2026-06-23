import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const html = readFileSync("viewer-dist/viewer.html", "utf8");
mkdirSync("src/editor", { recursive: true });
// Exporta o HTML single-file como string para o editor injetar dados e exportar.
writeFileSync(
  "src/editor/viewerTemplate.js",
  "// GERADO por scripts/embed-viewer.mjs — não editar à mão.\nexport default " + JSON.stringify(html) + ";\n",
);
console.log("viewerTemplate.js gerado (" + html.length + " bytes).");
