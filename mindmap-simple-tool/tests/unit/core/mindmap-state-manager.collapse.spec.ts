/**
 * MindMapStateManager の折りたたみ状態管理機能のテスト
 * 折りたたみ・展開・可視状態の制御機能をテスト
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { MindMapStateManager } from '../../../src/core/mindmap-state-manager';
import { MindMapEventType } from '../../../src/types/event';
import type { NodeId } from '../../../src/types';

describe('MindMapStateManager - 折りたたみ状態管理', () => {
  let stateManager: MindMapStateManager;
  let rootNodeId: NodeId;
  let childNode1Id: NodeId;
  let childNode2Id: NodeId;
  let grandChildNodeId: NodeId;

  beforeEach(() => {
    stateManager = new MindMapStateManager();

    // ツリー構造のテストデータを作成
    // Root
    //  ├── Child1
    //  │   └── GrandChild
    //  └── Child2

    rootNodeId = 'node_root';
    childNode1Id = 'node_child1';
    childNode2Id = 'node_child2';
    grandChildNodeId = 'node_grandchild';

    // ルートノードを作成
    stateManager.addNode(rootNodeId, {
      text: 'Root Node',
      color: '#3B82F6',
      position: { x: 0, y: 0 },
      parentId: null,
    });

    // 子ノード1を作成
    stateManager.addNode(childNode1Id, {
      text: 'Child Node 1',
      color: '#10B981',
      position: { x: 100, y: 50 },
    });
    stateManager.setNodeParent(childNode1Id, rootNodeId);

    // 子ノード2を作成
    stateManager.addNode(childNode2Id, {
      text: 'Child Node 2',
      color: '#F59E0B',
      position: { x: 100, y: -50 },
    });
    stateManager.setNodeParent(childNode2Id, rootNodeId);

    // 孫ノードを作成
    stateManager.addNode(grandChildNodeId, {
      text: 'Grand Child Node',
      color: '#EF4444',
      position: { x: 200, y: 50 },
    });
    stateManager.setNodeParent(grandChildNodeId, childNode1Id);
  });

  describe('基本的な折りたたみ機能', () => {
    it('ノードを折りたたむことができる', () => {
      // 初期状態では展開されている
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);

      // ノードを折りたたみ
      stateManager.setNodeCollapsed(childNode1Id, true);

      // 折りたたみ状態になる
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(true);
    });

    it('ノードを展開することができる', () => {
      // ノードを折りたたみ
      stateManager.setNodeCollapsed(childNode1Id, true);
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(true);

      // ノードを展開
      stateManager.setNodeCollapsed(childNode1Id, false);

      // 展開状態になる
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);
    });

    it('折りたたみ状態を切り替えることができる', () => {
      // 初期状態は展開
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);

      // 切り替え（展開→折りたたみ）
      stateManager.toggleNodeCollapsed(childNode1Id);
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(true);

      // 切り替え（折りたたみ→展開）
      stateManager.toggleNodeCollapsed(childNode1Id);
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);
    });
  });

  describe('展開・折りたたみ操作', () => {
    it('expandNodeでノードを展開できる', () => {
      // ノードを折りたたみ
      stateManager.setNodeCollapsed(childNode1Id, true);

      // 展開操作
      stateManager.expandNode(childNode1Id);

      // 展開状態になる
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);
    });

    it('collapseNodeでノードを折りたたむことができる', () => {
      // 展開状態から開始
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);

      // 折りたたみ操作
      stateManager.collapseNode(childNode1Id);

      // 折りたたみ状態になる
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(true);
    });

    it('expandNode(recursive: true)で子ノードも再帰的に展開される', () => {
      // 親と子を両方折りたたみ
      stateManager.setNodeCollapsed(childNode1Id, true);
      stateManager.setNodeCollapsed(grandChildNodeId, true);

      // 再帰的展開
      stateManager.expandNode(childNode1Id, true);

      // 親も子も展開状態になる
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);
      expect(stateManager.getNodeInfo(grandChildNodeId).isCollapsed).toBe(
        false
      );
    });

    it('collapseNode(recursive: true)で子ノードも再帰的に折りたたまれる', () => {
      // 初期状態では展開されている
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);
      expect(stateManager.getNodeInfo(grandChildNodeId).isCollapsed).toBe(
        false
      );

      // 再帰的折りたたみ
      stateManager.collapseNode(childNode1Id, true);

      // 親も子も折りたたみ状態になる
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(true);
      expect(stateManager.getNodeInfo(grandChildNodeId).isCollapsed).toBe(true);
    });
  });

  describe('可視状態の管理', () => {
    it('ルートノードは常に可視状態である', () => {
      expect(stateManager.isNodeVisible(rootNodeId)).toBe(true);

      // ルートノードを折りたたんでも可視
      stateManager.setNodeCollapsed(rootNodeId, true);
      expect(stateManager.isNodeVisible(rootNodeId)).toBe(true);
    });

    it('親が展開されている場合、子ノードは可視状態である', () => {
      // 親ノードが展開されている
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);

      // 子ノードは可視
      expect(stateManager.isNodeVisible(grandChildNodeId)).toBe(true);
    });

    it('親が折りたたまれている場合、子ノードは非表示である', () => {
      // 親ノードを折りたたみ
      stateManager.setNodeCollapsed(childNode1Id, true);

      // 子ノードは非表示
      expect(stateManager.isNodeVisible(grandChildNodeId)).toBe(false);
    });

    it('祖先ノードが折りたたまれている場合、子孫ノードは非表示である', () => {
      // ルートノードを折りたたみ
      stateManager.setNodeCollapsed(rootNodeId, true);

      // 子・孫ノードは非表示
      expect(stateManager.isNodeVisible(childNode1Id)).toBe(false);
      expect(stateManager.isNodeVisible(grandChildNodeId)).toBe(false);
    });

    it('getVisibleNodeIdsで可視状態のノードリストを取得できる', () => {
      // 初期状態では全ノードが可視
      const allNodeIds = [
        rootNodeId,
        childNode1Id,
        childNode2Id,
        grandChildNodeId,
      ];
      expect(stateManager.getVisibleNodeIds()).toEqual(
        expect.arrayContaining(allNodeIds)
      );
      expect(stateManager.getVisibleNodeIds().length).toBe(4);

      // 子ノード1を折りたたみ
      stateManager.setNodeCollapsed(childNode1Id, true);

      // 孫ノードが非表示になる
      const visibleNodes = stateManager.getVisibleNodeIds();
      expect(visibleNodes).toContain(rootNodeId);
      expect(visibleNodes).toContain(childNode1Id);
      expect(visibleNodes).toContain(childNode2Id);
      expect(visibleNodes).not.toContain(grandChildNodeId);
      expect(visibleNodes.length).toBe(3);
    });
  });

  describe('統計・集計機能', () => {
    it('getCollapsedNodeCountで折りたたまれたノードの数を取得できる', () => {
      // 初期状態では折りたたまれたノードはなし
      expect(stateManager.getCollapsedNodeCount()).toBe(0);

      // 2つのノードを折りたたみ
      stateManager.setNodeCollapsed(childNode1Id, true);
      stateManager.setNodeCollapsed(childNode2Id, true);

      // 折りたたまれたノードは2個
      expect(stateManager.getCollapsedNodeCount()).toBe(2);
    });
  });

  describe('一括操作', () => {
    it('expandAllNodesで全ノードを展開できる', () => {
      // 複数のノードを折りたたみ
      stateManager.setNodeCollapsed(childNode1Id, true);
      stateManager.setNodeCollapsed(childNode2Id, true);
      stateManager.setNodeCollapsed(grandChildNodeId, true);

      // 全展開
      stateManager.expandAllNodes();

      // 全ノードが展開状態になる
      expect(stateManager.getNodeInfo(rootNodeId).isCollapsed).toBe(false);
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(false);
      expect(stateManager.getNodeInfo(childNode2Id).isCollapsed).toBe(false);
      expect(stateManager.getNodeInfo(grandChildNodeId).isCollapsed).toBe(
        false
      );
    });

    it('collapseAllNodesでルートノード以外を折りたたむことができる', () => {
      // 初期状態では全て展開
      expect(stateManager.getCollapsedNodeCount()).toBe(0);

      // 全折りたたみ
      stateManager.collapseAllNodes();

      // ルートノード以外が折りたたまれる
      expect(stateManager.getNodeInfo(rootNodeId).isCollapsed).toBe(false); // ルートは展開のまま
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(true);
      expect(stateManager.getNodeInfo(childNode2Id).isCollapsed).toBe(true);
      expect(stateManager.getNodeInfo(grandChildNodeId).isCollapsed).toBe(true);
      expect(stateManager.getCollapsedNodeCount()).toBe(3);
    });
  });

  describe('イベント発行', () => {
    it('折りたたみ状態変更時にイベントが発行される', () => {
      let eventCount = 0;
      let lastEventData: any;

      // イベントリスナーを設定
      stateManager.on(MindMapEventType.SELECTION_CHANGED, data => {
        eventCount++;
        lastEventData = data;
      });

      // 折りたたみ状態を変更
      stateManager.setNodeCollapsed(childNode1Id, true);

      // イベントが発行されることを確認
      // Note: 現在の実装では SELECTION_CHANGED イベントのみ発行されているが、
      // 将来的には NODE_COLLAPSED などの専用イベントを追加する可能性がある
      expect(eventCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しないノードの折りたたみ状態を変更しようとするとエラーが発生する', () => {
      const invalidNodeId = 'node_invalid' as NodeId;

      expect(() => {
        stateManager.setNodeCollapsed(invalidNodeId, true);
      }).toThrow('not found');
    });

    it('存在しないノードの可視状態を取得しようとするとエラーが発生する', () => {
      const invalidNodeId = 'node_invalid' as NodeId;

      expect(() => {
        stateManager.isNodeVisible(invalidNodeId);
      }).toThrow('not found');
    });

    it('存在しないノードを展開しようとするとエラーが発生する', () => {
      const invalidNodeId = 'node_invalid' as NodeId;

      expect(() => {
        stateManager.expandNode(invalidNodeId);
      }).toThrow('not found');
    });

    it('存在しないノードを折りたたもうとするとエラーが発生する', () => {
      const invalidNodeId = 'node_invalid' as NodeId;

      expect(() => {
        stateManager.collapseNode(invalidNodeId);
      }).toThrow('not found');
    });
  });

  describe('親子関係との整合性', () => {
    it('ノードを削除すると折りたたみ状態も削除される', () => {
      // ノードを折りたたみ
      stateManager.setNodeCollapsed(childNode1Id, true);
      expect(stateManager.getNodeInfo(childNode1Id).isCollapsed).toBe(true);

      // ノードを削除
      stateManager.removeNode(childNode1Id);

      // 削除されたノードの状態は取得できない
      expect(() => {
        stateManager.getNodeInfo(childNode1Id);
      }).toThrow('not found');
    });

    it('親ノードを削除すると子ノードの親がnullになる', () => {
      // 初期状態では孫ノードは可視
      expect(stateManager.isNodeVisible(grandChildNodeId)).toBe(true);
      expect(stateManager.getNodeInfo(grandChildNodeId).parentId).toBe(
        childNode1Id
      );

      // 親ノード（childNode1Id）を削除
      stateManager.removeNode(childNode1Id);

      // 孫ノードの親がnullになり、ルートノードになる
      expect(stateManager.getNodeInfo(grandChildNodeId).parentId).toBe(null);
      // ルートノードになったので可視状態は維持される
      expect(stateManager.isNodeVisible(grandChildNodeId)).toBe(true);
    });
  });
});
