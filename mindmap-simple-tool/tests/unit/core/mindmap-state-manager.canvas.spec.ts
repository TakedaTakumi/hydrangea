/**
 * マインドマップ状態管理 - キャンバス表示状態管理のテスト
 *
 * このテストファイルは、MindMapStateManagerのキャンバス表示状態管理機能をテストします。
 * ズーム、パン、ビューポート操作などの機能を包括的にテストします。
 * プロパティベーステストによりランダムな入力値での堅牢性も検証します。
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import fc from 'fast-check';
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

  describe('プロパティベーステスト - ズーム機能の堅牢性', () => {
    it('任意のズーム値で制約が正しく適用される', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 100.0, noNaN: true }), // 任意のズーム値
          fc.double({ min: 0.1, max: 1.0, noNaN: true }), // 最小ズーム
          fc.double({ min: 1.0, max: 10.0, noNaN: true }), // 最大ズーム
          (zoomValue, minZoom, maxZoom) => {
            const manager = new MindMapStateManager();

            // ズーム制約を設定
            manager.setZoomConstraints(minZoom, maxZoom);

            // 任意のズーム値を設定
            manager.setZoom(zoomValue);

            const resultZoom = manager.getViewport().zoom;

            // 結果が制約内に収まっていることを検証
            return resultZoom >= minZoom && resultZoom <= maxZoom;
          }
        ),
        { numRuns: 100 } // 100回のランダムテストを実行
      );
    });

    it('連続したズーム操作で状態の一貫性が保たれる', () => {
      fc.assert(
        fc.property(
          fc.array(fc.double({ min: 0.5, max: 5.0, noNaN: true }), {
            minLength: 1,
            maxLength: 10,
          }), // ズーム操作のシーケンス
          zoomSequence => {
            const manager = new MindMapStateManager();
            let previousZoom = manager.getViewport().zoom;

            zoomSequence.forEach(zoomValue => {
              manager.setZoom(zoomValue);
              const currentZoom = manager.getViewport().zoom;

              // ズーム値が制約内であることを確認
              expect(currentZoom).toBeGreaterThanOrEqual(0.1); // デフォルト最小値
              expect(currentZoom).toBeLessThanOrEqual(5.0); // デフォルト最大値

              previousZoom = currentZoom;
            });

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('プロパティベーステスト - パン機能の堅牢性', () => {
    it('任意の座標でパン操作が正常に動作する', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -10000, max: 10000, noNaN: true }), // X座標
          fc.double({ min: -10000, max: 10000, noNaN: true }), // Y座標
          (x, y) => {
            const manager = new MindMapStateManager();
            const targetPoint: Point2D = { x, y };

            manager.setPan(targetPoint);
            const viewport = manager.getViewport();

            // 設定した座標と取得した座標が一致することを検証
            return (
              Math.abs(viewport.center.x - x) < 0.001 &&
              Math.abs(viewport.center.y - y) < 0.001
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('相対パン操作の結果が数学的に正しい', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: 1000, noNaN: true }), // 初期X
          fc.double({ min: -1000, max: 1000, noNaN: true }), // 初期Y
          fc.double({ min: -500, max: 500, noNaN: true }), // デルタX
          fc.double({ min: -500, max: 500, noNaN: true }), // デルタY
          (initX, initY, deltaX, deltaY) => {
            const manager = new MindMapStateManager();

            // 初期位置を設定
            manager.setPan({ x: initX, y: initY });

            // 相対移動を実行
            manager.panBy(deltaX, deltaY);

            const viewport = manager.getViewport();
            const expectedX = initX + deltaX;
            const expectedY = initY + deltaY;

            // 計算結果が期待値と一致することを検証
            return (
              Math.abs(viewport.center.x - expectedX) < 0.001 &&
              Math.abs(viewport.center.y - expectedY) < 0.001
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('プロパティベーステスト - ビューポート統合テスト', () => {
    it('ズームとパンの組み合わせ操作で状態の整合性が保たれる', () => {
      fc.assert(
        fc.property(
          fc.record({
            zoom: fc.double({ min: 0.2, max: 4.0, noNaN: true }),
            centerX: fc.double({ min: -2000, max: 2000, noNaN: true }),
            centerY: fc.double({ min: -2000, max: 2000, noNaN: true }),
            sizeWidth: fc.integer({ min: 100, max: 2000 }),
            sizeHeight: fc.integer({ min: 100, max: 1500 }),
          }),
          viewportData => {
            const manager = new MindMapStateManager();

            // ビューポートを一括設定
            manager.setViewport({
              zoom: viewportData.zoom,
              center: { x: viewportData.centerX, y: viewportData.centerY },
              size: {
                width: viewportData.sizeWidth,
                height: viewportData.sizeHeight,
              },
            });

            const viewport = manager.getViewport();

            // すべての値が正しく設定されていることを検証
            const isZoomValid = viewport.zoom >= 0.1 && viewport.zoom <= 5.0;
            const isCenterValid =
              Math.abs(viewport.center.x - viewportData.centerX) < 0.001 &&
              Math.abs(viewport.center.y - viewportData.centerY) < 0.001;
            const isSizeValid =
              viewport.size.width === viewportData.sizeWidth &&
              viewport.size.height === viewportData.sizeHeight;

            return isZoomValid && isCenterValid && isSizeValid;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('表示オプションの変更が副作用を起こさない', () => {
      fc.assert(
        fc.property(
          fc.record({
            showGrid: fc.boolean(),
            showMinimap: fc.boolean(),
            animationsEnabled: fc.boolean(),
          }),
          options => {
            const manager = new MindMapStateManager();
            const initialViewport = manager.getViewport();

            // 表示オプションを変更
            manager.setShowGrid(options.showGrid);
            manager.setShowMinimap(options.showMinimap);
            manager.setAnimationsEnabled(options.animationsEnabled);

            const canvasState = manager.getCanvasState();
            const finalViewport = manager.getViewport();

            // 表示オプションが正しく設定されている
            const optionsCorrect =
              canvasState.showGrid === options.showGrid &&
              canvasState.showMinimap === options.showMinimap &&
              canvasState.animationsEnabled === options.animationsEnabled;

            // ビューポートが変更されていない
            const viewportUnchanged =
              finalViewport.zoom === initialViewport.zoom &&
              finalViewport.center.x === initialViewport.center.x &&
              finalViewport.center.y === initialViewport.center.y;

            return optionsCorrect && viewportUnchanged;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
