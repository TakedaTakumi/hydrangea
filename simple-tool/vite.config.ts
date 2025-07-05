import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    minify: "esbuild", // 高速な圧縮
    chunkSizeWarningLimit: 600, // チャンクサイズ警告閾値（KB）
    treeshake: true, // 未使用コード除去
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["d3"],
        },
      },
    },
  },
  base: "./", // 相対パスでの静的ファイル生成
  publicDir: "public", // 静的アセットのディレクトリ
});
