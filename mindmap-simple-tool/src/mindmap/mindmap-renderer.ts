// d3.js マインドマップ描画基盤クラス
// SVG キャンバスの初期化・型安全なd3.js統合

import * as d3 from 'd3';

/**
 * MindMapRenderer: SVGキャンバスの初期化とd3.js描画基盤
 * - 型安全なd3.js操作
 * - レスポンシブなSVGサイズ
 */
export class MindMapRenderer {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
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
}
