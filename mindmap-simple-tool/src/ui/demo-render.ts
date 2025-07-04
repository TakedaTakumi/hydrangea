// mindmap-canvasのSVGにサンプルツリーを描画するデモスクリプト
import { getStateManager } from '../core/state-manager';
import { buildMindMapTreeFromMap } from '../utils/helpers';
import {
  renderMindMapNodes,
  renderMindMapLinks,
} from '../mindmap/mindmap-renderer';

document.addEventListener('DOMContentLoaded', () => {
  const svg = document.getElementById('mindmap-canvas') as SVGSVGElement | null;
  if (!svg) return;
  const d3svg = require('d3').select(svg);

  // 状態管理からノードマップとルートIDを取得
  const stateManager = getStateManager();
  const nodes = stateManager.getNodes();
  const rootId = stateManager.getState().rootNodeId;
  const tree = buildMindMapTreeFromMap(nodes, rootId);
  if (!tree) return;

  // エッジ描画
  renderMindMapLinks(d3svg, tree, 'curve', {
    color: '#38bdf8',
    strokeWidth: 3,
    strokeDasharray: '6,3',
  });
  // ノード描画
  renderMindMapNodes(d3svg, tree);
  svg.classList.remove('hidden');
});
