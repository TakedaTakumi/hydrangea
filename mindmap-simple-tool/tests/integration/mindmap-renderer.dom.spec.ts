import { describe, it, expect, beforeAll } from 'bun:test';
import { JSDOM } from 'jsdom';
import {
  renderMindMapNodes,
  renderMindMapLinks,
} from '../../src/mindmap/mindmap-renderer';
import { sampleMindMapTree } from '../../samples/sample-mindmap-tree';

describe('画面描画の自動テスト', () => {
  let document: Document;
  let svg: SVGSVGElement;

  beforeAll(() => {
    const dom = new JSDOM(
      '<!DOCTYPE html><body><svg id="mindmap-canvas"></svg></body>'
    );
    document = dom.window.document;
    svg = document.getElementById('mindmap-canvas') as SVGSVGElement;
    // d3-selectionでラップ
    const d3 = require('d3');
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
