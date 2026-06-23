import { defineConfig } from "vite";

// Mantém o transform JSX classic do esbuild (todo .jsx importa React).
// Sem plugin React aqui de propósito — não mudar para runtime automático.
export default defineConfig({
  server: { host: "127.0.0.1" },
});
