// d3.js マインドマップ描画基盤クラス
// SVG キャンバスの初期化・型安全なd3.js統合

import * as d3 from 'd3';
import type { MindMapNodeTree } from '../types/node';
import type { RGBAColor, Color } from '../types/index';
import { NodeShape } from '../types/index';
import { getTailwindColor } from '../config/theme';

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

/**
 * MindMapNodeTree を SVG で描画（ノード形状: 矩形/円形/角丸/楕円）
 * @param svg SVG selection
 * @param root ルートノードツリー
 */
export function renderMindMapNodes(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  root: MindMapNodeTree
) {
  // 再帰的にノードを描画
  function drawNode(node: MindMapNodeTree) {
    const { layout, style } = node;
    // ノード形状描画（既存）
    switch (style.shape) {
      case NodeShape.RECTANGLE:
        svg
          .append('rect')
          .attr('x', layout.position.x)
          .attr('y', layout.position.y)
          .attr('width', layout.size.width)
          .attr('height', layout.size.height)
          .attr('rx', 0)
          .attr('fill', colorToString(style.backgroundColor))
          .attr('stroke', colorToString(style.borderColor))
          .attr('stroke-width', style.borderWidth);
        break;
      case NodeShape.ROUNDED_RECTANGLE:
        svg
          .append('rect')
          .attr('x', layout.position.x)
          .attr('y', layout.position.y)
          .attr('width', layout.size.width)
          .attr('height', layout.size.height)
          .attr('rx', style.borderRadius)
          .attr('fill', colorToString(style.backgroundColor))
          .attr('stroke', colorToString(style.borderColor))
          .attr('stroke-width', style.borderWidth);
        break;
      case NodeShape.CIRCLE:
        svg
          .append('circle')
          .attr('cx', layout.position.x + layout.size.width / 2)
          .attr('cy', layout.position.y + layout.size.height / 2)
          .attr('r', Math.min(layout.size.width, layout.size.height) / 2)
          .attr('fill', colorToString(style.backgroundColor))
          .attr('stroke', colorToString(style.borderColor))
          .attr('stroke-width', style.borderWidth);
        break;
      case NodeShape.ELLIPSE:
        svg
          .append('ellipse')
          .attr('cx', layout.position.x + layout.size.width / 2)
          .attr('cy', layout.position.y + layout.size.height / 2)
          .attr('rx', layout.size.width / 2)
          .attr('ry', layout.size.height / 2)
          .attr('fill', colorToString(style.backgroundColor))
          .attr('stroke', colorToString(style.borderColor))
          .attr('stroke-width', style.borderWidth);
        break;
      default:
        return;
    }
    // ノード内テキスト描画前にテキスト幅を計算し、ノードサイズを調整
    const tempText = svg
      .append('text')
      .text(node.text)
      .attr('font-size', fontSizeToPx(style.fontSize))
      .attr('visibility', 'hidden')
      .attr('x', -9999)
      .attr('y', -9999);
    const bbox = (tempText.node() as SVGTextElement).getBBox();
    tempText.remove();
    // テキスト幅+パディングでノード幅を自動調整
    const padding = 24;
    const minWidth = node.layout.minSize.width;
    const maxWidth = node.layout.maxSize.width;
    const newWidth = Math.max(
      minWidth,
      Math.min(bbox.width + padding, maxWidth)
    );
    node.layout.size.width = newWidth;
    // ノード内テキスト描画（中央揃え）
    svg
      .append('text')
      .text(node.text)
      .attr('x', layout.position.x + node.layout.size.width / 2)
      .attr('y', layout.position.y + layout.size.height / 2)
      .attr('fill', colorToString(style.textColor))
      .attr('font-size', fontSizeToPx(style.fontSize))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('pointer-events', 'none');
    // 子ノードも描画
    node.children.forEach(drawNode);
  }
  drawNode(root);
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

// サンプル: デフォルトNodeStyleにTailwindカラーを適用する例
// 例: 赤色ノード
// const redNodeStyle = { ...DEFAULT_NODE_STYLE, backgroundColor: getTailwindColor('red', 400) };
