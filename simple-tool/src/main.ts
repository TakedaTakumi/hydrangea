import * as d3 from "d3";

// エントリポイント（仮実装）
// 今後ここにアプリの初期化処理を追加

document.addEventListener("DOMContentLoaded", () => {
  const svg = d3.select("#mindmap-canvas");
  // SVGの初期化確認用に枠線を描画
  svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 800)
    .attr("height", 600)
    .attr("fill", "none")
    .attr("stroke", "#cbd5e1")
    .attr("stroke-width", 2);
});
