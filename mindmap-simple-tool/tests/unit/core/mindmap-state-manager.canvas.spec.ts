/**
 * マインドマップ状態管理 - キャンバス表示状態管理のテスト
 *
 * このテストファイルは、MindMapStateManagerのキャンバス表示状態管理機能をテストします。
 * ズーム、パン、ビューポート操作などの機能を包括的にテストします。
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { MindMapStateManager } from '../../../src/core/mindmap-state-manager';
import { MindMapEventType } from '../../../src/types/event';
import type { Point2D, Size, MindMapViewport } from '../../../src/types';

describe('MindMapStateManager - キャンバス表示状態管理', () => {
  let manager: MindMapStateManager;

  beforeEach(() => {
    manager = new MindMapStateManager();
  });

  describe('ビューポート管理', () => {
    it('デフォルトビューポート情報を正しく初期化する', () => {
      const viewport = manager.getViewport();

      expect(viewport.zoom).toBe(1);
      expect(viewport.minZoom).toBe(0.1);
      expect(viewport.maxZoom).toBe(5);
      expect(viewport.center).toEqual({ x: 0, y: 0 });
      expect(viewport.size).toEqual({ width: 800, height: 600 });
    });

    it('部分的なビューポート更新を正しく適用する', () => {
      const newViewport: Partial<MindMapViewport> = {
        zoom: 1.5,
        center: { x: 100, y: 200 },
      };

      manager.setViewport(newViewport);
      const viewport = manager.getViewport();

      expect(viewport.zoom).toBe(1.5);
      expect(viewport.center).toEqual({ x: 100, y: 200 });
      // 他の値は変更されない
      expect(viewport.minZoom).toBe(0.1);
      expect(viewport.maxZoom).toBe(5);
      expect(viewport.size).toEqual({ width: 800, height: 600 });
    });

    it('ズーム制約を超える値を適切にクランプする', () => {
      // 最大値を超える場合
      manager.setViewport({ zoom: 10 });
      expect(manager.getViewport().zoom).toBe(5); // maxZoom

      // 最小値を下回る場合
      manager.setViewport({ zoom: 0.01 });
      expect(manager.getViewport().zoom).toBe(0.1); // minZoom
    });
  });

  describe('ズーム操作', () => {
    it('指定した値でズームレベルを設定する', () => {
      manager.setZoom(2.0);
      expect(manager.getViewport().zoom).toBe(2.0);
    });

    it('ズーム中心点を指定してズームする', () => {
      const center: Point2D = { x: 300, y: 400 };
      manager.setZoom(1.5, center);

      const viewport = manager.getViewport();
      expect(viewport.zoom).toBe(1.5);
      expect(viewport.center).toEqual(center);
    });

    it('ズームイン操作でズームレベルが正しく増加する', () => {
      manager.setZoom(1.0);
      manager.zoomIn(); // デフォルト係数 1.2

      expect(manager.getViewport().zoom).toBeCloseTo(1.2, 6);
    });

    it('カスタム係数でズームイン操作を実行する', () => {
      manager.setZoom(1.0);
      manager.zoomIn(2.0); // 2倍にズーム

      expect(manager.getViewport().zoom).toBe(2.0);
    });

    it('ズームアウト操作でズームレベルが正しく減少する', () => {
      manager.setZoom(2.0);
      manager.zoomOut(); // デフォルト係数 0.8

      expect(manager.getViewport().zoom).toBeCloseTo(1.6, 6);
    });

    it('カスタム係数でズームアウト操作を実行する', () => {
      manager.setZoom(2.0);
      manager.zoomOut(0.5); // 半分にズーム

      expect(manager.getViewport().zoom).toBe(1.0);
    });

    it('ズームリセット操作で1倍に戻す', () => {
      manager.setZoom(3.0);
      manager.resetZoom();

      expect(manager.getViewport().zoom).toBe(1.0);
    });

    it('ズーム制約を設定してズーム値を制限する', () => {
      manager.setZoomConstraints(0.5, 3.0);

      const viewport = manager.getViewport();
      expect(viewport.minZoom).toBe(0.5);
      expect(viewport.maxZoom).toBe(3.0);

      // 制約外の値をテスト
      manager.setZoom(0.2); // 最小値以下
      expect(manager.getViewport().zoom).toBe(0.5);

      manager.setZoom(5.0); // 最大値以上
      expect(manager.getViewport().zoom).toBe(3.0);
    });

    it('無効なズーム制約（最小値が最大値以上）でエラーを投げる', () => {
      expect(() => {
        manager.setZoomConstraints(2.0, 1.0);
      }).toThrow('minZoom must be less than maxZoom');
    });
  });

  describe('パン（移動）操作', () => {
    it('指定した座標にビューポート中心を移動する', () => {
      const newCenter: Point2D = { x: 500, y: 300 };
      manager.setPan(newCenter);

      expect(manager.getViewport().center).toEqual(newCenter);
    });

    it('相対的な移動量でパンを実行する', () => {
      manager.setPan({ x: 100, y: 200 });
      manager.panBy(50, -30);

      const center = manager.getViewport().center;
      expect(center).toEqual({ x: 150, y: 170 });
    });

    it('指定した点を中心にビューポートを移動する', () => {
      const targetPoint: Point2D = { x: 1000, y: 500 };
      manager.panTo(targetPoint);

      expect(manager.getViewport().center).toEqual(targetPoint);
    });
  });

  describe('ビューポートサイズ管理', () => {
    it('ビューポートサイズを更新する', () => {
      const newSize: Size = { width: 1200, height: 800 };
      manager.setViewportSize(newSize);

      expect(manager.getViewport().size).toEqual(newSize);
    });
  });

  describe('コンテンツフィット機能', () => {
    beforeEach(() => {
      // テスト用のノードを追加
      manager.addNode('node_001', {
        text: 'Node 1',
        position: { x: 0, y: 0 },
      });
      manager.addNode('node_002', {
        text: 'Node 2',
        position: { x: 200, y: 100 },
      });
      manager.addNode('node_003', {
        text: 'Node 3',
        position: { x: -100, y: -50 },
      });
    });

    it('ノードが存在しない場合はコンテンツフィットを実行しない', () => {
      const emptyManager = new MindMapStateManager();
      const originalViewport = emptyManager.getViewport();

      emptyManager.fitToContent();

      // ビューポートが変更されない
      expect(emptyManager.getViewport()).toEqual(originalViewport);
    });

    it('全ノードがビューポートに収まるようにズームとパンを調整する', () => {
      manager.fitToContent();

      const viewport = manager.getViewport();

      // ズームが調整されている（デフォルトの1から変更）
      expect(viewport.zoom).not.toBe(1);
      // 中心が調整されている（0,0から変更）
      expect(viewport.center.x).not.toBe(0);
      expect(viewport.center.y).not.toBe(0);
    });

    it('指定したパディングでコンテンツフィットを実行する', () => {
      const padding = 100;
      manager.fitToContent(padding);

      // パディングが考慮されてズーム調整される
      const viewport = manager.getViewport();
      expect(viewport.zoom).toBeGreaterThan(0);
      expect(viewport.zoom).toBeLessThanOrEqual(viewport.maxZoom);
    });
  });

  describe('表示オプション管理', () => {
    it('グリッド表示の切り替えを実行する', () => {
      expect(manager.getCanvasState().showGrid).toBe(true); // デフォルト

      manager.setShowGrid(false);
      expect(manager.getCanvasState().showGrid).toBe(false);

      manager.setShowGrid(true);
      expect(manager.getCanvasState().showGrid).toBe(true);
    });

    it('ミニマップ表示の切り替えを実行する', () => {
      expect(manager.getCanvasState().showMinimap).toBe(false); // デフォルト

      manager.setShowMinimap(true);
      expect(manager.getCanvasState().showMinimap).toBe(true);

      manager.setShowMinimap(false);
      expect(manager.getCanvasState().showMinimap).toBe(false);
    });

    it('アニメーション有効/無効の切り替えを実行する', () => {
      expect(manager.getCanvasState().animationsEnabled).toBe(true); // デフォルト

      manager.setAnimationsEnabled(false);
      expect(manager.getCanvasState().animationsEnabled).toBe(false);

      manager.setAnimationsEnabled(true);
      expect(manager.getCanvasState().animationsEnabled).toBe(true);
    });
  });

  describe('イベント発行', () => {
    it('ビューポート変更時に適切なイベントを発行する', () => {
      let eventEmitted = false;
      let eventData: any = null;

      manager.on(MindMapEventType.VIEWPORT_CHANGED, data => {
        eventEmitted = true;
        eventData = data;
      });

      manager.setZoom(2.0);

      expect(eventEmitted).toBe(true);
      expect(eventData).toBeTruthy();
      expect(eventData.viewport).toBeTruthy();
      expect(eventData.viewport.zoom).toBe(2.0);
    });

    it('パン操作時にイベントを発行する', () => {
      let eventEmitted = false;

      manager.on(MindMapEventType.VIEWPORT_CHANGED, () => {
        eventEmitted = true;
      });

      manager.setPan({ x: 100, y: 200 });

      expect(eventEmitted).toBe(true);
    });
  });

  describe('統合シナリオ', () => {
    it('複数のビューポート操作を連続で実行して正しい状態を維持する', () => {
      // 1. ズーム設定
      manager.setZoom(2.0);

      // 2. パン操作
      manager.setPan({ x: 300, y: 400 });

      // 3. ズームイン
      manager.zoomIn(1.5);

      // 4. 相対パン
      manager.panBy(100, -50);

      const viewport = manager.getViewport();
      expect(viewport.zoom).toBe(3.0); // 2.0 * 1.5
      expect(viewport.center).toEqual({ x: 400, y: 350 }); // 300+100, 400-50
    });

    it('ズーム制約変更後の操作で制約が適切に適用される', () => {
      // 初期制約設定
      manager.setZoomConstraints(0.2, 2.5);

      // 制約内でのズーム
      manager.setZoom(2.0);
      expect(manager.getViewport().zoom).toBe(2.0);

      // 制約を変更
      manager.setZoomConstraints(1.0, 4.0);

      // 新しい制約での操作
      manager.setZoom(3.5);
      expect(manager.getViewport().zoom).toBe(3.5);

      // 新しい最小値以下をテスト
      manager.setZoom(0.5);
      expect(manager.getViewport().zoom).toBe(1.0); // 新しい最小値
    });
  });
});
