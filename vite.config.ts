import { defineConfig } from "vite";

export default defineConfig({
  base: "/settai-golf/",
  build: {
    target: "es2022",
    assetsInlineLimit: 4096
  }
});
