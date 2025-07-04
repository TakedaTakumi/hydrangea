import { describe, it, expect, beforeEach } from 'bun:test';
import { JSDOM } from 'jsdom';
import { renderMindMapLinks } from '../../../src/mindmap/mindmap-renderer';
import { sampleMindMapTree } from '../../../samples/sample-mindmap-tree';

// SVGの仮想DOMを用意
let document: Document;
let svg: SVGSVGElement;

beforeEach(() => {
  const dom = new JSDOM(
    '<!DOCTYPE html><body><svg id="test-svg"></svg></body>'
  );
  document = dom.window.document;
  svg = document.getElementById('test-svg') as SVGSVGElement;
});

describe('renderMindMapLinks', () => {
  it('エッジの色・太さ・破線がSVG属性に反映される', () => {
    // d3-selectionでラップ
    const d3 = require('d3');
    const d3svg = d3.select(svg);
    renderMindMapLinks(d3svg, sampleMindMapTree, 'curve', {
      color: '#38bdf8',
      strokeWidth: 4,
      strokeDasharray: '5,2',
    });
    const paths = svg.querySelectorAll('path.mindmap-link');
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach(path => {
      expect(path.getAttribute('stroke')).toBe('#38bdf8');
      expect(path.getAttribute('stroke-width')).toBe('4');
      expect(path.getAttribute('stroke-dasharray')).toBe('5,2');
    });
  });
});
