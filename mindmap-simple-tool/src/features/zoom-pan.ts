// d3-zoom を使ったズーム・パン機能（型安全・モジュール設計）
import * as d3 from 'd3';

/**
 * ズーム・パン機能をSVG要素に適用する
 * @param svg SVG要素のd3セレクション
 * @param onZoom オプション: ズーム時のコールバック
 */
export function applyZoomPan(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  onZoom?: (transform: d3.ZoomTransform) => void
): void {
  const zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.2, 3])
    .on('zoom', event => {
      svg
        .select('g.mindmap-root')
        .attr('transform', event.transform.toString());
      if (onZoom) onZoom(event.transform);
    });

  svg.call(zoomBehavior as any);
}
