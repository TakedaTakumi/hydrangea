import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["d3"],
        },
      },
    },
  },
  base: "./", // 相対パスでの静的ファイル生成
});
