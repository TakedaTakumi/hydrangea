// mindmap-canvasのSVGにサンプルツリーを描画するデモスクリプト
import { sampleMindMapTree } from '../samples/sample-mindmap-tree';
import {
  renderMindMapNodes,
  renderMindMapLinks,
} from '../src/mindmap/mindmap-renderer';

document.addEventListener('DOMContentLoaded', () => {
  const svg = document.getElementById('mindmap-canvas') as SVGSVGElement | null;
  if (!svg) return;
  // d3-selectionでラップ
  const d3svg = require('d3').select(svg);
  // まずエッジ（リンク）を描画
  renderMindMapLinks(d3svg, sampleMindMapTree, 'curve');
  // 次にノードを描画
  renderMindMapNodes(d3svg, sampleMindMapTree);
  svg.classList.remove('hidden');
});
