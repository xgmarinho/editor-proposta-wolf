import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Builda apenas viewer.html como um único HTML autocontido (JS/CSS/assets inline).
export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    outDir: "viewer-dist",
    rollupOptions: { input: "viewer.html" },
    assetsInlineLimit: 100000000, // inline de todos os assets (imagens base64)
    cssCodeSplit: false,
  },
});
