import { getStateManager } from './state-manager';
import { buildMindMapTreeFromMap } from '../utils/helpers';
import {
  renderMindMapNodes,
  renderMindMapLinks,
} from '../mindmap/mindmap-renderer';

/**
 * アプリケーションのメインクラス
 * 全体の初期化と調整を行う
 */
export class MindMapApp {
  private initialized = false;

  /**
   * アプリケーションの初期化
   */
  initialize(): void {
    if (this.initialized) {
      // eslint-disable-next-line no-console
      console.warn('アプリケーションは既に初期化されています');
      return;
    }

    try {
      // eslint-disable-next-line no-console
      console.log('アプリケーション初期化を開始...');

      // 状態管理からノードツリーを取得し描画
      if (typeof document !== 'undefined') {
        const svg = document.getElementById(
          'mindmap-canvas'
        ) as SVGSVGElement | null;
        if (svg) {
          const d3svg = require('d3').select(svg);
          const stateManager = getStateManager();
          const nodes = stateManager.getNodes();
          const rootId = stateManager.getState().rootNodeId;
          const tree = buildMindMapTreeFromMap(nodes, rootId);
          if (tree) {
            renderMindMapLinks(d3svg, tree, 'curve', {
              color: '#38bdf8',
              strokeWidth: 3,
              strokeDasharray: '6,3',
            });
            renderMindMapNodes(d3svg, tree);
            svg.classList.remove('hidden');
          }
        }
      }

      this.initialized = true;
      // eslint-disable-next-line no-console
      console.log('アプリケーション初期化完了');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('アプリケーション初期化エラー:', error);
      throw error;
    }
  }

  /**
   * アプリケーションの破棄
   */
  destroy(): void {
    if (!this.initialized) return;

    // TODO: リソースのクリーンアップ

    this.initialized = false;
    // eslint-disable-next-line no-console
    console.log('アプリケーションが破棄されました');
  }
}
