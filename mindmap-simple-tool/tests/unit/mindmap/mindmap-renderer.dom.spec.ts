import { JSDOM } from 'jsdom';
const { window } = new JSDOM('<!DOCTYPE html><body></body>');
globalThis.document = window.document;
globalThis.SVGSVGElement = window.SVGSVGElement;
// getBBoxモック: d3描画ロジックのため
if (!window.SVGElement.prototype.getBBox) {
  window.SVGElement.prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 100,
    height: 30,
  });
}

import { describe, it, expect, beforeEach } from 'bun:test';
import { renderMindMapNodes } from '../../../src/mindmap/mindmap-renderer';
import { sampleMindMapTree } from '../../../samples/sample-mindmap-tree';

describe('renderMindMapNodes', () => {
  let svg: SVGSVGElement;

  beforeEach(() => {
    svg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    ) as SVGSVGElement;
    document.body.appendChild(svg);
  });

  it('サンプルツリーを描画し、ノード数が一致する', () => {
    // d3-selectionでラップ
    const d3 = require('d3');
    const d3svg = d3.select(svg);

    renderMindMapNodes(d3svg, sampleMindMapTree);

    // SVG内のrect要素数（ノード数）を検証
    const rects = svg.querySelectorAll('rect');
    expect(rects.length).toBe(4); // ルート＋子2＋孫1

    // ルートノードのテキストが描画されているか
    const texts = svg.querySelectorAll('text');
    const textContents = Array.from(texts).map(t => t.textContent);
    expect(textContents).toContain('ルートノード');
    expect(textContents).toContain('子ノードA');
    expect(textContents).toContain('子ノードB');
    expect(textContents).toContain('孫ノードB-1');
  });

  it('ノードのrectとtextの座標・サイズ・内容が正しい', () => {
    const d3 = require('d3');
    const d3svg = d3.select(svg);

    renderMindMapNodes(d3svg, sampleMindMapTree);

    // ルートノードのrectを取得
    const rect = svg.querySelector('rect[data-id^="node_"]');
    expect(rect).toBeDefined();
    const rectX = Number(rect?.getAttribute('x'));
    const rectY = Number(rect?.getAttribute('y'));
    const rectW = Number(rect?.getAttribute('width'));
    const rectH = Number(rect?.getAttribute('height'));
    expect(rectX).toBe(0);
    expect(rectY).toBe(0);
    expect(rectW).toBeGreaterThanOrEqual(120);
    expect(rectH).toBe(60);

    // ルートノードのtextを取得
    const text = svg.querySelector('text');
    expect(text).toBeDefined();
    expect(text?.textContent).toBe('ルートノード');
    // x, y座標も検証（rectの中心付近にあることを許容範囲で判定）
    const textX = Number(text?.getAttribute('x'));
    const textY = Number(text?.getAttribute('y'));
    // 中心座標
    const centerX = rectX + rectW / 2;
    const centerY = rectY + rectH / 2;
    // ±10px以内ならOK
    expect(Math.abs(textX - centerX)).toBeLessThanOrEqual(10);
    expect(Math.abs(textY - centerY)).toBeLessThanOrEqual(10);
  });
});
