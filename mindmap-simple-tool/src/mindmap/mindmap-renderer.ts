// d3.js マインドマップ描画基盤クラス
// SVG キャンバスの初期化・型安全なd3.js統合

import * as d3 from 'd3';
import type { MindMapNodeTree } from '../types/node';
import type { RGBAColor, Color } from '../types/index';
import { NodeShape } from '../types/index';
import type { MindMapLink } from '../types/mindmap';
import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

// d3-force用型
interface ForceNode extends SimulationNodeDatum {
  id: string;
  data: MindMapNodeTree;
}
interface ForceLink extends SimulationLinkDatum<ForceNode> {
  source: ForceNode | string;
  target: ForceNode | string;
}

/**
 * Color型（HEX or RGBA）→ SVG用カラー文字列
 */
function colorToString(color: Color): string {
  if (typeof color === 'string') return color;
  const { r, g, b, a } = color as RGBAColor;
  return `rgba(${r},${g},${b},${a})`;
}

/**
 * MindMapRenderer: SVGキャンバスの初期化とd3.js描画基盤
 * - 型安全なd3.js操作
 * - レスポンシブなSVGサイズ
 */
export class MindMapRenderer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private width: number;
  private height: number;

  constructor(
    container: HTMLElement,
    width: number = 800,
    height: number = 600
  ) {
    this.width = width;
    this.height = height;
    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('class', 'w-full h-full bg-white dark:bg-gray-900');
  }

  /**
   * SVG要素の取得
   */
  getSVG(): SVGSVGElement | null {
    return this.svg.node();
  }

  /**
   * キャンバスサイズの更新
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.svg
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);
  }

  /**
   * SVGにイベントハンドラを追加（例: クリック、ダブルクリック、コンテキストメニュー等）
   * @param type イベントタイプ（例: 'click'）
   * @param handler イベントハンドラ関数
   */
  on<K extends keyof SVGElementEventMap>(
    type: K,
    handler: (event: SVGElementEventMap[K]) => void
  ): void {
    const node = this.svg.node();
    if (node) {
      node.addEventListener(type, handler as EventListener);
    }
  }

  /**
   * SVGからイベントハンドラを削除
   */
  off<K extends keyof SVGElementEventMap>(
    type: K,
    handler: (event: SVGElementEventMap[K]) => void
  ): void {
    const node = this.svg.node();
    if (node) {
      node.removeEventListener(type, handler as EventListener);
    }
  }

  /**
   * ノード形状を動的に切り替えて再描画
   * @param root ルートノードツリー
   * @param shape 新しいノード形状
   */
  public updateNodeShape(
    root: import('../types/node').MindMapNodeTree,
    shape: import('../types/index').NodeShape
  ) {
    // すべてのノードの shape を一括変更
    function setShape(node: import('../types/node').MindMapNodeTree) {
      node.style.shape = shape;
      node.children.forEach(setShape);
    }
    setShape(root);
    // SVGをクリアして再描画
    this.svg.selectAll('*').remove();
    renderMindMapNodes(this.svg, root);
  }
}

/** MindMapNodeTree → d3-hierarchy変換 */
function toD3Hierarchy(
  root: MindMapNodeTree
): d3.HierarchyNode<MindMapNodeTree> {
  return d3.hierarchy(root, d => d.children);
}

export function renderMindMapNodes(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  root: MindMapNodeTree,
  layoutType: 'tree' | 'force' | 'radial' | 'custom' = 'tree'
) {
  // SVGサイズ取得
  const svgNode = svg.node();
  const svgWidth = svgNode ? svgNode.clientWidth || 800 : 800;
  const svgHeight = svgNode ? svgNode.clientHeight || 600 : 600;

  if (layoutType === 'force') {
    // ノードリスト化
    const nodes: ForceNode[] = [];
    function collect(node: MindMapNodeTree) {
      nodes.push({ id: node.id, data: node });
      node.children.forEach(collect);
    }
    collect(root);
    // リンクリスト化
    const links: ForceLink[] = [];
    nodes.forEach(n => {
      n.data.children.forEach(c => {
        links.push({ source: n.id, target: c.id });
      });
    });
    // 初期座標
    nodes.forEach((n, i) => {
      n.x = svgWidth / 2 + Math.cos((2 * Math.PI * i) / nodes.length) * 120;
      n.y = svgHeight / 2 + Math.sin((2 * Math.PI * i) / nodes.length) * 120;
    });
    // d3-force
    const sim = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
      .force(
        'link',
        d3
          .forceLink(links)
          .id((d: any) => d.id) // as any で型エラー回避
          .distance(160)
      )
      .stop();
    for (let i = 0; i < 100; ++i) sim.tick();
    // ForceNodeのx/yをMindMapNodeTreeに反映
    nodes.forEach(n => {
      if (typeof n.x === 'number' && typeof n.y === 'number') {
        n.data.layout.position.x = n.x;
        n.data.layout.position.y = n.y;
      }
    });
  } else if (layoutType === 'radial') {
    // d3-treeでツリー構造
    const treeLayout = d3
      .tree<MindMapNodeTree>()
      .size([2 * Math.PI, Math.min(svgWidth, svgHeight) / 2 - 80]);
    const d3Root = toD3Hierarchy(root);
    treeLayout(d3Root);
    // 極座標→デカルト座標変換
    d3Root.each(node => {
      if (typeof node.x === 'number' && typeof node.y === 'number') {
        const angle = node.x - Math.PI / 2;
        const radius = node.y;
        node.data.layout.position.x = svgWidth / 2 + Math.cos(angle) * radius;
        node.data.layout.position.y = svgHeight / 2 + Math.sin(angle) * radius;
      }
    });
  } else if (layoutType === 'custom') {
    // カスタム: ノードを水平方向に一列で並べる例
    const nodes: MindMapNodeTree[] = [];
    function collect(node: MindMapNodeTree) {
      nodes.push(node);
      node.children.forEach(collect);
    }
    collect(root);
    const spacing = 180;
    const startX = (svgWidth - spacing * (nodes.length - 1)) / 2;
    const y = svgHeight / 2;
    nodes.forEach((n, i) => {
      n.layout.position.x = startX + i * spacing;
      n.layout.position.y = y;
    });
  } else {
    // d3-treeレイアウト適用
    const treeLayout = d3.tree<MindMapNodeTree>().size([svgHeight, svgWidth]);
    const d3Root = toD3Hierarchy(root);
    treeLayout(d3Root);
    d3Root.each(node => {
      if (typeof node.x === 'number' && typeof node.y === 'number') {
        node.data.layout.position.x = node.y;
        node.data.layout.position.y = node.x;
      }
    });
  }

  // --- ノードリストをflatに収集 ---
  const flatNodes: MindMapNodeTree[] = [];
  function collectAll(node: MindMapNodeTree) {
    flatNodes.push(node);
    if (!node.state.collapsed) {
      node.children.forEach(collectAll);
    }
  }
  collectAll(root);

  // --- data join & transition ---
  const nodeGroups = svg
    .selectAll<SVGGElement, MindMapNodeTree>('g.node')
    .data(flatNodes, (d: MindMapNodeTree) => d.id);

  // --- enter ---
  const nodeEnter = nodeGroups
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr(
      'transform',
      d => `translate(${d.layout.position.x},${d.layout.position.y})`
    )
    .attr('opacity', 0);

  nodeEnter.each(function (d: MindMapNodeTree) {
    const g = d3.select(this);
    const { layout, style } = d;
    switch (style.shape) {
      case NodeShape.RECTANGLE:
        g.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', layout.size.width)
          .attr('height', layout.size.height)
          .attr('rx', 0)
          .attr('fill', colorToString(style.backgroundColor))
          .attr('stroke', colorToString(style.borderColor))
          .attr('stroke-width', style.borderWidth)
          .attr('filter', '')
          .attr('data-id', d.id);
        break;
      case NodeShape.ROUNDED_RECTANGLE:
        g.append('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', layout.size.width)
          .attr('height', layout.size.height)
          .attr('rx', style.borderRadius)
          .attr('fill', colorToString(style.backgroundColor))
          .attr('stroke', colorToString(style.borderColor))
          .attr('stroke-width', style.borderWidth)
          .attr('filter', '')
          .attr('data-id', d.id);
        break;
      case NodeShape.CIRCLE:
        g.append('circle')
          .attr('cx', layout.size.width / 2)
          .attr('cy', layout.size.height / 2)
          .attr('r', 0)
          .attr('fill', colorToString(style.backgroundColor))
          .attr('stroke', colorToString(style.borderColor))
          .attr('stroke-width', style.borderWidth)
          .attr('filter', '')
          .attr('data-id', d.id)
          .transition()
          .duration(300)
          .attr('r', Math.min(layout.size.width, layout.size.height) / 2);
        break;
      case NodeShape.ELLIPSE:
        g.append('ellipse')
          .attr('cx', layout.size.width / 2)
          .attr('cy', layout.size.height / 2)
          .attr('rx', 0)
          .attr('ry', 0)
          .attr('fill', colorToString(style.backgroundColor))
          .attr('stroke', colorToString(style.borderColor))
          .attr('stroke-width', style.borderWidth)
          .attr('filter', '')
          .attr('data-id', d.id)
          .transition()
          .duration(300)
          .attr('rx', layout.size.width / 2)
          .attr('ry', layout.size.height / 2);
        break;
      default:
        break;
    }
    g.append('text')
      .text(d.text)
      .attr('x', layout.size.width / 2)
      .attr('y', layout.size.height / 2)
      .attr('fill', colorToString(style.textColor))
      .attr('font-size', fontSizeToPx(style.fontSize))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('pointer-events', 'none')
      .attr('opacity', 0)
      .transition()
      .duration(300)
      .attr('opacity', 1);
  });
  nodeEnter.transition().duration(300).attr('opacity', 1);

  // --- update ---
  nodeGroups
    .transition()
    .duration(300)
    .attr(
      'transform',
      d => `translate(${d.layout.position.x},${d.layout.position.y})`
    )
    .attr('opacity', 1);

  // --- exit ---
  nodeGroups.exit().transition().duration(300).attr('opacity', 0).remove();
}

/**
 * NodeStyle.fontSize(enum) → px値へ変換
 */
function fontSizeToPx(fontSize: import('../types/index').FontSize): number {
  switch (fontSize) {
    case 'xs':
      return 12;
    case 'sm':
      return 14;
    case 'base':
      return 16;
    case 'lg':
      return 20;
    case 'xl':
      return 24;
    default:
      return 16;
  }
}

// MindMapNodeTree から d3-hierarchy tree を生成し、エッジ（リンク）を描画
// @param svg SVG selection
// @param root ルートノードツリー
// @param linkType 'curve' | 'line' で曲線/直線切り替え
export function renderMindMapLinks(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  root: MindMapNodeTree,
  linkType: 'curve' | 'line' = 'curve',
  linkStyle?: Partial<MindMapLink>
) {
  // d3-hierarchyでtree構造化
  const rootHierarchy = d3.hierarchy(root);
  const treeLayout = d3.tree<any>().size([800, 600]); // 仮サイズ
  const treeData = treeLayout(rootHierarchy);
  // d3-linkでエッジ生成
  const linkGen =
    linkType === 'curve' ? d3.linkHorizontal() : d3.linkVertical();
  svg
    .selectAll('path.mindmap-link')
    .data(treeData.links())
    .enter()
    .append('path')
    .attr('class', 'mindmap-link')
    .attr('d', (d: any) =>
      linkGen({
        source: [d.source.y, d.source.x],
        target: [d.target.y, d.target.x],
      })
    )
    .attr('fill', 'none')
    .attr('stroke', linkStyle?.color ? colorToString(linkStyle.color) : '#888')
    .attr('stroke-width', linkStyle?.strokeWidth || 2)
    .attr('stroke-dasharray', linkStyle?.strokeDasharray || '');
}

// サンプル: デフォルトNodeStyleにTailwindカラーを適用する例
// 例: 赤色ノード
// const redNodeStyle = { ...DEFAULT_NODE_STYLE, backgroundColor: getTailwindColor('red', 400) };
