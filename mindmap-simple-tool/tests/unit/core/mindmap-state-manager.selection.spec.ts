/**
 * MindMapStateManager の選択状態管理機能のテスト
 * 選択・選択解除・複数選択・選択状態の変更イベント等をテスト
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { MindMapStateManager } from '../../../src/core/mindmap-state-manager';
import { MindMapEventType } from '../../../src/types/event';
import type { NodeId } from '../../../src/types';

describe('MindMapStateManager - 選択状態管理', () => {
  let stateManager: MindMapStateManager;
  let testNodeIds: NodeId[];

  beforeEach(() => {
    stateManager = new MindMapStateManager();

    // テスト用ノードを作成
    testNodeIds = ['node_001', 'node_002', 'node_003'];
    testNodeIds.forEach(nodeId => {
      stateManager.addNode(nodeId, {
        text: `Test Node ${nodeId}`,
        color: '#3B82F6',
        position: { x: 0, y: 0 },
      });
    });
  });

  describe('単一ノード選択', () => {
    it('ノードを選択すると選択状態に反映される', () => {
      const nodeId = testNodeIds[0];

      // ノードを選択
      stateManager.selectNode(nodeId);

      // 選択状態を確認
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.selectedNodeIds.has(nodeId)).toBe(true);
      expect(selectionState.primaryNodeId).toBe(nodeId);
      expect(selectionState.selectionMode).toBe('single');
      expect(selectionState.selectedNodeIds.size).toBe(1);

      // ノード自体の選択状態を確認
      const nodeInfo = stateManager.getNodeInfo(nodeId);
      expect(nodeInfo.isSelected).toBe(true);
    });

    it('存在しないノードを選択しようとするとエラーが発生する', () => {
      const invalidNodeId = 'node_invalid' as NodeId;

      expect(() => {
        stateManager.selectNode(invalidNodeId);
      }).toThrow('Node node_invalid not found');
    });

    it('新しいノードを選択すると前の選択が解除される', () => {
      const firstNodeId = testNodeIds[0];
      const secondNodeId = testNodeIds[1];

      // 最初のノードを選択
      stateManager.selectNode(firstNodeId);
      expect(stateManager.getNodeInfo(firstNodeId).isSelected).toBe(true);

      // 2番目のノードを選択（単一選択）
      stateManager.selectNode(secondNodeId);

      // 状態を確認
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.selectedNodeIds.has(firstNodeId)).toBe(false);
      expect(selectionState.selectedNodeIds.has(secondNodeId)).toBe(true);
      expect(selectionState.primaryNodeId).toBe(secondNodeId);
      expect(selectionState.selectedNodeIds.size).toBe(1);

      // ノード自体の選択状態を確認
      expect(stateManager.getNodeInfo(firstNodeId).isSelected).toBe(false);
      expect(stateManager.getNodeInfo(secondNodeId).isSelected).toBe(true);
    });
  });

  describe('複数ノード選択', () => {
    it('addToSelectionフラグでノードを追加選択できる', () => {
      const firstNodeId = testNodeIds[0];
      const secondNodeId = testNodeIds[1];

      // 最初のノードを選択
      stateManager.selectNode(firstNodeId);

      // 2番目のノードを追加選択
      stateManager.selectNode(secondNodeId, true);

      // 選択状態を確認
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.selectedNodeIds.has(firstNodeId)).toBe(true);
      expect(selectionState.selectedNodeIds.has(secondNodeId)).toBe(true);
      expect(selectionState.primaryNodeId).toBe(secondNodeId);
      expect(selectionState.selectionMode).toBe('multiple');
      expect(selectionState.selectedNodeIds.size).toBe(2);

      // 両方のノードが選択状態になっている
      expect(stateManager.getNodeInfo(firstNodeId).isSelected).toBe(true);
      expect(stateManager.getNodeInfo(secondNodeId).isSelected).toBe(true);
    });

    it('複数ノード選択後に単一選択すると他の選択が解除される', () => {
      const firstNodeId = testNodeIds[0];
      const secondNodeId = testNodeIds[1];
      const thirdNodeId = testNodeIds[2];

      // 複数ノードを選択
      stateManager.selectNode(firstNodeId);
      stateManager.selectNode(secondNodeId, true);
      expect(stateManager.getSelectionState().selectedNodeIds.size).toBe(2);

      // 3番目のノードを単一選択
      stateManager.selectNode(thirdNodeId, false);

      // 3番目のノードのみが選択されている
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.selectedNodeIds.has(firstNodeId)).toBe(false);
      expect(selectionState.selectedNodeIds.has(secondNodeId)).toBe(false);
      expect(selectionState.selectedNodeIds.has(thirdNodeId)).toBe(true);
      expect(selectionState.primaryNodeId).toBe(thirdNodeId);
      expect(selectionState.selectionMode).toBe('single');
      expect(selectionState.selectedNodeIds.size).toBe(1);
    });
  });

  describe('選択解除', () => {
    it('選択されたノードを個別に選択解除できる', () => {
      const firstNodeId = testNodeIds[0];
      const secondNodeId = testNodeIds[1];

      // 複数ノードを選択
      stateManager.selectNode(firstNodeId);
      stateManager.selectNode(secondNodeId, true);
      expect(stateManager.getSelectionState().selectedNodeIds.size).toBe(2);

      // 1つ目のノードを選択解除
      stateManager.deselectNode(firstNodeId);

      // 2つ目のノードのみが選択されている
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.selectedNodeIds.has(firstNodeId)).toBe(false);
      expect(selectionState.selectedNodeIds.has(secondNodeId)).toBe(true);
      expect(selectionState.primaryNodeId).toBe(secondNodeId);
      expect(selectionState.selectedNodeIds.size).toBe(1);

      // ノード自体の選択状態を確認
      expect(stateManager.getNodeInfo(firstNodeId).isSelected).toBe(false);
      expect(stateManager.getNodeInfo(secondNodeId).isSelected).toBe(true);
    });

    it('プライマリノードを選択解除すると別のノードがプライマリになる', () => {
      const firstNodeId = testNodeIds[0];
      const secondNodeId = testNodeIds[1];

      // 複数ノードを選択（secondNodeIdがプライマリになる）
      stateManager.selectNode(firstNodeId);
      stateManager.selectNode(secondNodeId, true);
      expect(stateManager.getSelectionState().primaryNodeId).toBe(secondNodeId);

      // プライマリノードを選択解除
      stateManager.deselectNode(secondNodeId);

      // firstNodeIdがプライマリになる
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.primaryNodeId).toBe(firstNodeId);
      expect(selectionState.selectedNodeIds.size).toBe(1);
    });

    it('最後の選択ノードを解除するとプライマリノードもnullになる', () => {
      const nodeId = testNodeIds[0];

      // ノードを選択
      stateManager.selectNode(nodeId);
      expect(stateManager.getSelectionState().primaryNodeId).toBe(nodeId);

      // 選択解除
      stateManager.deselectNode(nodeId);

      // 選択状態が空になる
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.selectedNodeIds.size).toBe(0);
      expect(selectionState.primaryNodeId).toBe(null);

      // ノード自体の選択状態も解除される
      expect(stateManager.getNodeInfo(nodeId).isSelected).toBe(false);
    });

    it('選択されていないノードを選択解除しても状態は変わらない', () => {
      const selectedNodeId = testNodeIds[0];
      const unselectedNodeId = testNodeIds[1];

      // 1つのノードだけ選択
      stateManager.selectNode(selectedNodeId);
      const beforeState = stateManager.getSelectionState();

      // 選択されていないノードを選択解除
      stateManager.deselectNode(unselectedNodeId);

      // 状態が変わらない
      const afterState = stateManager.getSelectionState();
      expect(afterState.selectedNodeIds.size).toBe(
        beforeState.selectedNodeIds.size
      );
      expect(afterState.primaryNodeId).toBe(beforeState.primaryNodeId);
      expect(afterState.selectedNodeIds.has(selectedNodeId)).toBe(true);
    });
  });

  describe('全選択解除', () => {
    it('clearSelectionで全ての選択が解除される', () => {
      // 複数ノードを選択
      testNodeIds.forEach(nodeId => {
        stateManager.selectNode(nodeId, true);
      });
      expect(stateManager.getSelectionState().selectedNodeIds.size).toBe(3);

      // 全選択解除
      stateManager.clearSelection();

      // 選択状態が空になる
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.selectedNodeIds.size).toBe(0);
      expect(selectionState.primaryNodeId).toBe(null);

      // 全ノードの選択状態が解除される
      testNodeIds.forEach(nodeId => {
        expect(stateManager.getNodeInfo(nodeId).isSelected).toBe(false);
      });
    });

    it('選択が無い状態でclearSelectionを呼んでも問題ない', () => {
      // 初期状態で全選択解除
      stateManager.clearSelection();

      // 状態が空のまま
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.selectedNodeIds.size).toBe(0);
      expect(selectionState.primaryNodeId).toBe(null);
    });
  });

  describe('ノード削除時の選択状態', () => {
    it('選択されたノードを削除すると選択状態からも削除される', () => {
      const nodeToDelete = testNodeIds[0];
      const otherNode = testNodeIds[1];

      // 複数ノードを選択
      stateManager.selectNode(nodeToDelete);
      stateManager.selectNode(otherNode, true);
      expect(stateManager.getSelectionState().selectedNodeIds.size).toBe(2);

      // ノードを削除
      stateManager.removeNode(nodeToDelete);

      // 削除されたノードが選択状態からも削除される
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.selectedNodeIds.has(nodeToDelete)).toBe(false);
      expect(selectionState.selectedNodeIds.has(otherNode)).toBe(true);
      expect(selectionState.selectedNodeIds.size).toBe(1);
    });

    it('プライマリノードを削除すると別のノードがプライマリになる', () => {
      const primaryNode = testNodeIds[0];
      const otherNode = testNodeIds[1];

      // 複数ノードを選択（primaryNodeがプライマリ）
      stateManager.selectNode(otherNode);
      stateManager.selectNode(primaryNode, true);
      expect(stateManager.getSelectionState().primaryNodeId).toBe(primaryNode);

      // プライマリノードを削除
      stateManager.removeNode(primaryNode);

      // 他のノードがプライマリになる
      const selectionState = stateManager.getSelectionState();
      expect(selectionState.primaryNodeId).toBe(otherNode);
      expect(selectionState.selectedNodeIds.size).toBe(1);
    });
  });

  describe('選択状態の時刻管理', () => {
    it('選択操作でlastSelectionTimeが更新される', () => {
      const nodeId = testNodeIds[0];
      const initialTime = stateManager.getSelectionState().lastSelectionTime;

      // 少し待機
      setTimeout(() => {
        stateManager.selectNode(nodeId);

        const newTime = stateManager.getSelectionState().lastSelectionTime;
        expect(newTime).toBeGreaterThan(initialTime);
      }, 10);
    });

    it('選択解除操作でもlastSelectionTimeが更新される', () => {
      const nodeId = testNodeIds[0];

      // ノードを選択
      stateManager.selectNode(nodeId);
      const selectTime = stateManager.getSelectionState().lastSelectionTime;

      // 少し待機してから選択解除
      setTimeout(() => {
        stateManager.deselectNode(nodeId);

        const deselectTime = stateManager.getSelectionState().lastSelectionTime;
        expect(deselectTime).toBeGreaterThan(selectTime);
      }, 10);
    });
  });

  describe('イベント発行', () => {
    it('選択状態変更時にSELECTION_CHANGEDイベントが発行される', () => {
      const nodeId = testNodeIds[0];
      let eventFired = false;
      let eventData: any;

      // イベントリスナーを設定
      stateManager.on(MindMapEventType.SELECTION_CHANGED, data => {
        eventFired = true;
        eventData = data;
      });

      // ノードを選択
      stateManager.selectNode(nodeId);

      // イベントが発行されることを確認
      expect(eventFired).toBe(true);
      expect(eventData.selectedNodeIds.has(nodeId)).toBe(true);
      expect(eventData.primaryNodeId).toBe(nodeId);
      expect(typeof eventData.timestamp).toBe('number');
    });

    it('選択解除時にもSELECTION_CHANGEDイベントが発行される', () => {
      const nodeId = testNodeIds[0];
      let eventCount = 0;

      stateManager.on(MindMapEventType.SELECTION_CHANGED, () => {
        eventCount++;
      });

      // 選択と選択解除
      stateManager.selectNode(nodeId);
      stateManager.deselectNode(nodeId);

      // 2回イベントが発行される（選択時と選択解除時）
      expect(eventCount).toBe(2);
    });
  });
});
