import { describe, it, expect, beforeAll } from 'bun:test';
import { JSDOM } from 'jsdom';
import * as d3 from 'd3';
import {
  renderMindMapNodes,
  renderMindMapLinks,
} from '../../src/mindmap/mindmap-renderer';
import { sampleMindMapTree } from '../../samples/sample-mindmap-tree';

// JSDOMのwindow, document, SVGElementをグローバルにセット

describe('画面描画の自動テスト', () => {
  let document: Document;
  let svg: SVGSVGElement;

  beforeAll(() => {
    const dom = new JSDOM(
      '<!DOCTYPE html><body><svg id="mindmap-canvas"></svg></body>'
    );
    globalThis.window = dom.window as unknown as Window & typeof globalThis;
    globalThis.document = dom.window.document;
    globalThis.SVGElement = dom.window.SVGElement;
    // getBBoxモック: JSDOMのSVGTextElementにダミー実装を追加（型アサーションで型エラー回避）
    if (!(globalThis.SVGElement.prototype as any).getBBox) {
      (globalThis.SVGElement.prototype as any).getBBox = function () {
        return { x: 0, y: 0, width: 100, height: 20 };
      };
    }
    document = dom.window.document;
    svg = document.getElementById('mindmap-canvas') as unknown as SVGSVGElement;
    const d3svg = d3.select(svg);
    renderMindMapLinks(d3svg, sampleMindMapTree, 'curve');
    renderMindMapNodes(d3svg, sampleMindMapTree);
  });

  it('SVGにノードが描画されている', () => {
    const nodes = svg.querySelectorAll('rect, circle, ellipse');
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('SVGにエッジ（path）が描画されている', () => {
    const links = svg.querySelectorAll('path.mindmap-link');
    expect(links.length).toBeGreaterThan(0);
  });
});
