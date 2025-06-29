/**
 * マインドマップ専用状態管理クラス
 * ノード情報、選択状態、キャンバス状態等を一元管理
 */

import { ReactiveStore } from './state-manager';
import { EventEmitter } from './event-emitter';
import { MindMapEventType } from '../types/event';
import type {
  NodeId,
  Point2D,
  Size,
  Rectangle,
  Color,
  MindMapViewport,
  ZoomMode,
  NodeEventType,
  EventHandler,
  UnsubscribeFunction,
} from '../types';

// ============================================================================
// ノード情報の状態管理
// ============================================================================

/** ノード情報の管理状態 */
export interface NodeInfoState {
  /** ノードのテキスト内容 */
  text: string;
  /** ノードの色 */
  color: Color;
  /** ノードの位置 */
  position: Point2D;
  /** 親ノードのID（ルートノードの場合はnull） */
  parentId: NodeId | null;
  /** 子ノードのIDリスト */
  childrenIds: NodeId[];
  /** ノードが折りたたまれているかどうか */
  isCollapsed: boolean;
  /** ノードが選択されているかどうか */
  isSelected: boolean;
  /** 最終更新タイムスタンプ */
  lastUpdated: number;
}

/** ノード情報の変更イベント */
export interface NodeInfoChangeEvent {
  /** 変更されたノードのID */
  nodeId: NodeId;
  /** 変更の種類 */
  changeType:
    | 'text'
    | 'color'
    | 'position'
    | 'parent'
    | 'children'
    | 'collapsed'
    | 'selected';
  /** 変更前の値 */
  previousValue: any;
  /** 変更後の値 */
  newValue: any;
  /** タイムスタンプ */
  timestamp: number;
}

// ============================================================================
// 選択状態の管理
// ============================================================================

/** 選択状態の管理 */
export interface SelectionState {
  /** 現在選択されているノードのIDリスト */
  selectedNodeIds: Set<NodeId>;
  /** プライマリ選択ノード（最後に選択されたノード） */
  primaryNodeId: NodeId | null;
  /** 選択モード（単一選択 or 複数選択） */
  selectionMode: 'single' | 'multiple';
  /** 最終選択時刻 */
  lastSelectionTime: number;
}

// ============================================================================
// キャンバス表示状態の管理
// ============================================================================

/** キャンバス表示状態 */
export interface CanvasState {
  /** ビューポート情報 */
  viewport: MindMapViewport;
  /** グリッド表示の有無 */
  showGrid: boolean;
  /** ミニマップ表示の有無 */
  showMinimap: boolean;
  /** アニメーション有効化 */
  animationsEnabled: boolean;
}

// ============================================================================
// マインドマップ状態管理クラス
// ============================================================================

/**
 * マインドマップ専用の状態管理クラス
 * ノード情報、選択状態、キャンバス状態を一元管理
 */
export class MindMapStateManager {
  /** ノード情報のストア */
  private nodeInfoStore: Map<NodeId, ReactiveStore<NodeInfoState>>;

  /** 選択状態のストア */
  private selectionStore: ReactiveStore<SelectionState>;

  /** キャンバス状態のストア */
  private canvasStore: ReactiveStore<CanvasState>;

  /** イベントエミッター */
  private eventEmitter: EventEmitter;

  /**
   * コンストラクタ
   */
  constructor() {
    this.nodeInfoStore = new Map();
    this.eventEmitter = new EventEmitter();

    // 選択状態の初期化
    this.selectionStore = new ReactiveStore<SelectionState>(
      {
        selectedNodeIds: new Set(),
        primaryNodeId: null,
        selectionMode: 'single',
        lastSelectionTime: 0,
      },
      'selection'
    );

    // キャンバス状態の初期化
    this.canvasStore = new ReactiveStore<CanvasState>(
      {
        viewport: {
          zoom: 1,
          minZoom: 0.1,
          maxZoom: 5,
          center: { x: 0, y: 0 },
          size: { width: 800, height: 600 },
          zoomMode: 'fit' as any, // ZoomModeの実際の値を使用
        },
        showGrid: true,
        showMinimap: false,
        animationsEnabled: true,
      },
      'canvas'
    );

    this.setupEventHandlers();
  }

  // ============================================================================
  // ノード情報の管理
  // ============================================================================

  /**
   * ノードを追加
   * @param nodeId - ノードID
   * @param initialState - 初期状態
   */
  addNode(nodeId: NodeId, initialState: Partial<NodeInfoState>): void {
    if (this.nodeInfoStore.has(nodeId)) {
      throw new Error(`Node ${nodeId} already exists`);
    }

    const defaultState: NodeInfoState = {
      text: '',
      color: '#3B82F6',
      position: { x: 0, y: 0 },
      parentId: null,
      childrenIds: [],
      isCollapsed: false,
      isSelected: false,
      lastUpdated: Date.now(),
      ...initialState,
    };

    const nodeStore = new ReactiveStore<NodeInfoState>(
      defaultState,
      `node_${nodeId}`
    );

    // ノード変更の監視
    nodeStore.subscribe(change => {
      this.handleNodeChange(nodeId, change);
    });

    this.nodeInfoStore.set(nodeId, nodeStore);

    this.eventEmitter.emit('nodeAdded', {
      nodeId,
      state: defaultState,
      timestamp: Date.now(),
    });
  }

  /**
   * ノードを削除
   * @param nodeId - ノードID
   */
  removeNode(nodeId: NodeId): void {
    const nodeStore = this.nodeInfoStore.get(nodeId);
    if (!nodeStore) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const nodeState = nodeStore.get();

    // 親ノードから子リストを削除
    if (nodeState.parentId) {
      this.removeChildFromParent(nodeState.parentId, nodeId);
    }

    // 子ノードの親を削除
    nodeState.childrenIds.forEach(childId => {
      this.setNodeParent(childId, null);
    });

    // 選択状態から削除
    this.deselectNode(nodeId);

    this.nodeInfoStore.delete(nodeId);

    this.eventEmitter.emit('nodeRemoved', {
      nodeId,
      timestamp: Date.now(),
    });
  }

  /**
   * ノードのテキストを更新
   * @param nodeId - ノードID
   * @param text - 新しいテキスト
   */
  setNodeText(nodeId: NodeId, text: string): void {
    const nodeStore = this.getNodeStore(nodeId);
    nodeStore.update(state => ({
      ...state,
      text,
      lastUpdated: Date.now(),
    }));
  }

  /**
   * ノードの色を更新
   * @param nodeId - ノードID
   * @param color - 新しい色
   */
  setNodeColor(nodeId: NodeId, color: Color): void {
    const nodeStore = this.getNodeStore(nodeId);
    nodeStore.update(state => ({
      ...state,
      color,
      lastUpdated: Date.now(),
    }));
  }

  /**
   * ノードの位置を更新
   * @param nodeId - ノードID
   * @param position - 新しい位置
   */
  setNodePosition(nodeId: NodeId, position: Point2D): void {
    const nodeStore = this.getNodeStore(nodeId);
    nodeStore.update(state => ({
      ...state,
      position,
      lastUpdated: Date.now(),
    }));
  }

  /**
   * ノードの親子関係を設定
   * @param nodeId - 子ノードID
   * @param parentId - 親ノードID（nullの場合はルートノード）
   */
  setNodeParent(nodeId: NodeId, parentId: NodeId | null): void {
    const nodeStore = this.getNodeStore(nodeId);
    const currentState = nodeStore.get();

    // 既存の親から削除
    if (currentState.parentId) {
      this.removeChildFromParent(currentState.parentId, nodeId);
    }

    // 新しい親に追加
    if (parentId) {
      this.addChildToParent(parentId, nodeId);
    }

    // ノードの親IDを更新
    nodeStore.update(state => ({
      ...state,
      parentId,
      lastUpdated: Date.now(),
    }));
  }

  /**
   * ノードの折りたたみ状態を切り替え
   * @param nodeId - ノードID
   * @param isCollapsed - 折りたたみ状態
   */
  setNodeCollapsed(nodeId: NodeId, isCollapsed: boolean): void {
    const nodeStore = this.getNodeStore(nodeId);
    nodeStore.update(state => ({
      ...state,
      isCollapsed,
      lastUpdated: Date.now(),
    }));
  }

  /**
   * ノード情報を取得
   * @param nodeId - ノードID
   * @returns ノード情報
   */
  getNodeInfo(nodeId: NodeId): NodeInfoState {
    const nodeStore = this.getNodeStore(nodeId);
    return nodeStore.get();
  }

  /**
   * 全ノードのIDリストを取得
   * @returns ノードIDのリスト
   */
  getAllNodeIds(): NodeId[] {
    return Array.from(this.nodeInfoStore.keys());
  }

  // ============================================================================
  // 選択状態の管理
  // ============================================================================

  /**
   * ノードを選択
   * @param nodeId - ノードID
   * @param addToSelection - 既存選択に追加するかどうか
   */
  selectNode(nodeId: NodeId, addToSelection: boolean = false): void {
    if (!this.nodeInfoStore.has(nodeId)) {
      throw new Error(`Node ${nodeId} not found`);
    }

    this.selectionStore.update(state => {
      const newSelectedIds = addToSelection
        ? new Set(state.selectedNodeIds)
        : new Set<NodeId>();

      newSelectedIds.add(nodeId);

      return {
        ...state,
        selectedNodeIds: newSelectedIds,
        primaryNodeId: nodeId,
        selectionMode: addToSelection ? 'multiple' : 'single',
        lastSelectionTime: Date.now(),
      };
    });

    // ノードの選択状態を更新
    this.updateNodeSelectionState();
  }

  /**
   * ノードの選択を解除
   * @param nodeId - ノードID
   */
  deselectNode(nodeId: NodeId): void {
    this.selectionStore.update(state => {
      const newSelectedIds = new Set(state.selectedNodeIds);
      newSelectedIds.delete(nodeId);

      const newPrimaryId: NodeId | null =
        state.primaryNodeId === nodeId
          ? newSelectedIds.size > 0
            ? (Array.from(newSelectedIds)[0] ?? null)
            : null
          : (state.primaryNodeId ?? null);

      return {
        ...state,
        selectedNodeIds: newSelectedIds,
        primaryNodeId: newPrimaryId,
        lastSelectionTime: Date.now(),
      };
    });

    this.updateNodeSelectionState();
  }

  /**
   * 全ノードの選択を解除
   */
  clearSelection(): void {
    this.selectionStore.update(state => ({
      ...state,
      selectedNodeIds: new Set(),
      primaryNodeId: null,
      lastSelectionTime: Date.now(),
    }));

    this.updateNodeSelectionState();
  }

  /**
   * 選択状態を取得
   * @returns 選択状態
   */
  getSelectionState(): SelectionState {
    return this.selectionStore.get();
  }

  // ============================================================================
  // キャンバス表示状態の管理（ズーム、位置）
  // ============================================================================

  /**
   * ビューポートを更新
   * @param viewport - 新しいビューポート
   */
  setViewport(viewport: Partial<MindMapViewport>): void {
    this.canvasStore.update(state => {
      const newViewport = { ...state.viewport, ...viewport };

      // ズーム制約の適用
      if (newViewport.zoom !== undefined) {
        newViewport.zoom = this.clampZoom(
          newViewport.zoom,
          newViewport.minZoom,
          newViewport.maxZoom
        );
      }

      return {
        ...state,
        viewport: newViewport,
      };
    });

    // ビューポート変更イベントを発行
    this.eventEmitter.emit(MindMapEventType.VIEWPORT_CHANGED, {
      viewport: this.canvasStore.get().viewport,
      timestamp: Date.now(),
    });
  }

  /**
   * ズームレベルを設定
   * @param zoom - ズームレベル
   * @param center - ズーム中心点（省略時は現在の中心点）
   */
  setZoom(zoom: number, center?: Point2D): void {
    this.canvasStore.update(state => {
      const clampedZoom = this.clampZoom(
        zoom,
        state.viewport.minZoom,
        state.viewport.maxZoom
      );
      const newViewport = { ...state.viewport, zoom: clampedZoom };

      // ズーム中心点が指定された場合は、その点を基準にズーム
      if (center) {
        newViewport.center = center;
      }

      return {
        ...state,
        viewport: newViewport,
      };
    });

    this.eventEmitter.emit(MindMapEventType.VIEWPORT_CHANGED, {
      viewport: this.canvasStore.get().viewport,
      timestamp: Date.now(),
    });
  }

  /**
   * ズームイン（段階的ズーム）
   * @param factor - ズーム係数（デフォルト: 1.2）
   * @param center - ズーム中心点
   */
  zoomIn(factor: number = 1.2, center?: Point2D): void {
    const currentZoom = this.canvasStore.get().viewport.zoom;
    this.setZoom(currentZoom * factor, center);
  }

  /**
   * ズームアウト（段階的ズーム）
   * @param factor - ズーム係数（デフォルト: 0.8）
   * @param center - ズーム中心点
   */
  zoomOut(factor: number = 0.8, center?: Point2D): void {
    const currentZoom = this.canvasStore.get().viewport.zoom;
    this.setZoom(currentZoom * factor, center);
  }

  /**
   * ズームをリセット（1倍に戻す）
   */
  resetZoom(): void {
    this.setZoom(1);
  }

  /**
   * コンテンツに合わせてズーム調整
   * @param padding - パディング（ピクセル）
   */
  fitToContent(padding: number = 50): void {
    const allNodes = this.getAllNodeIds();
    if (allNodes.length === 0) return;

    // 全ノードの境界ボックスを計算
    const bounds = this.calculateContentBounds();
    if (!bounds) return;

    const viewport = this.canvasStore.get().viewport;
    const availableWidth = viewport.size.width - padding * 2;
    const availableHeight = viewport.size.height - padding * 2;

    // コンテンツがビューポートに収まるズームレベルを計算
    const scaleX = availableWidth / bounds.width;
    const scaleY = availableHeight / bounds.height;
    const scale = Math.min(scaleX, scaleY, viewport.maxZoom);

    // コンテンツの中心をビューポートの中心に合わせる
    const contentCenter: Point2D = {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };

    this.setViewport({
      zoom: Math.max(scale, viewport.minZoom),
      center: contentCenter,
    });
  }

  /**
   * パン（移動）を設定
   * @param center - 新しい中心座標
   */
  setPan(center: Point2D): void {
    this.canvasStore.update(state => ({
      ...state,
      viewport: { ...state.viewport, center },
    }));

    this.eventEmitter.emit(MindMapEventType.VIEWPORT_CHANGED, {
      viewport: this.canvasStore.get().viewport,
      timestamp: Date.now(),
    });
  }

  /**
   * 相対的なパン（移動）
   * @param deltaX - X軸の移動量
   * @param deltaY - Y軸の移動量
   */
  panBy(deltaX: number, deltaY: number): void {
    const currentCenter = this.canvasStore.get().viewport.center;
    this.setPan({
      x: currentCenter.x + deltaX,
      y: currentCenter.y + deltaY,
    });
  }

  /**
   * 指定した点を中心にビューポートを移動
   * @param point - 中心にしたい点
   */
  panTo(point: Point2D): void {
    this.setPan(point);
  }

  /**
   * ビューポートのサイズを更新
   * @param size - 新しいサイズ
   */
  setViewportSize(size: Size): void {
    this.setViewport({ size });
  }

  /**
   * ズーム制約を設定
   * @param minZoom - 最小ズーム
   * @param maxZoom - 最大ズーム
   */
  setZoomConstraints(minZoom: number, maxZoom: number): void {
    if (minZoom >= maxZoom) {
      throw new Error('minZoom must be less than maxZoom');
    }

    this.canvasStore.update(state => {
      const currentZoom = this.clampZoom(state.viewport.zoom, minZoom, maxZoom);
      return {
        ...state,
        viewport: {
          ...state.viewport,
          minZoom,
          maxZoom,
          zoom: currentZoom,
        },
      };
    });
  }

  /**
   * ズームモードを設定
   * @param zoomMode - ズームモード
   */
  setZoomMode(zoomMode: ZoomMode): void {
    this.setViewport({ zoomMode });
  }

  /**
   * キャンバス状態を取得
   * @returns キャンバス状態
   */
  getCanvasState(): CanvasState {
    return this.canvasStore.get();
  }

  /**
   * ビューポート情報を取得
   * @returns ビューポート情報
   */
  getViewport(): MindMapViewport {
    return this.canvasStore.get().viewport;
  }

  // ============================================================================
  // キャンバス表示オプション
  // ============================================================================

  /**
   * グリッド表示の切り替え
   * @param show - 表示するかどうか
   */
  setShowGrid(show: boolean): void {
    this.canvasStore.update(state => ({
      ...state,
      showGrid: show,
    }));
  }

  /**
   * ミニマップ表示の切り替え
   * @param show - 表示するかどうか
   */
  setShowMinimap(show: boolean): void {
    this.canvasStore.update(state => ({
      ...state,
      showMinimap: show,
    }));
  }

  /**
   * アニメーションの有効/無効を切り替え
   * @param enabled - アニメーションを有効にするかどうか
   */
  setAnimationsEnabled(enabled: boolean): void {
    this.canvasStore.update(state => ({
      ...state,
      animationsEnabled: enabled,
    }));
  }

  // ============================================================================
  // イベントハンドリング
  // ============================================================================

  /**
   * イベントを購読
   * @param eventType - イベント型
   * @param handler - イベントハンドラー
   * @returns 購読解除関数
   */
  on<T extends NodeEventType | MindMapEventType>(
    eventType: T,
    handler: EventHandler<any>
  ): UnsubscribeFunction {
    return this.eventEmitter.on(eventType, handler);
  }

  /**
   * イベントの購読を解除
   * @param eventType - イベント型
   * @param handler - イベントハンドラー
   */
  off<T extends NodeEventType | MindMapEventType>(
    eventType: T,
    handler: EventHandler<any>
  ): void {
    this.eventEmitter.off(eventType, handler);
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  /**
   * ノードストアを取得（存在チェック付き）
   * @param nodeId - ノードID
   * @returns ノードストア
   */
  private getNodeStore(nodeId: NodeId): ReactiveStore<NodeInfoState> {
    const nodeStore = this.nodeInfoStore.get(nodeId);
    if (!nodeStore) {
      throw new Error(`Node ${nodeId} not found`);
    }
    return nodeStore;
  }

  /**
   * 親ノードに子を追加
   * @param parentId - 親ノードID
   * @param childId - 子ノードID
   */
  private addChildToParent(parentId: NodeId, childId: NodeId): void {
    const parentStore = this.getNodeStore(parentId);
    parentStore.update(state => ({
      ...state,
      childrenIds: [...state.childrenIds, childId],
      lastUpdated: Date.now(),
    }));
  }

  /**
   * 親ノードから子を削除
   * @param parentId - 親ノードID
   * @param childId - 子ノードID
   */
  private removeChildFromParent(parentId: NodeId, childId: NodeId): void {
    const parentStore = this.getNodeStore(parentId);
    parentStore.update(state => ({
      ...state,
      childrenIds: state.childrenIds.filter(id => id !== childId),
      lastUpdated: Date.now(),
    }));
  }

  /**
   * ノード変更の処理
   * @param nodeId - ノードID
   * @param change - 変更情報
   */
  private handleNodeChange(nodeId: NodeId, change: any): void {
    this.eventEmitter.emit('nodeChanged', {
      nodeId,
      changeType: this.detectChangeType(change),
      previousValue: change.previousValue,
      newValue: change.newValue,
      timestamp: change.timestamp,
    });
  }

  /**
   * 変更タイプを検出
   * @param _change - 変更情報（現在は未使用）
   * @returns 変更タイプ
   */
  private detectChangeType(_change: any): string {
    // 実際の実装では、変更された値を比較して適切なタイプを返す
    return 'unknown';
  }

  /**
   * ノードの選択状態を更新
   */
  private updateNodeSelectionState(): void {
    const selectionState = this.selectionStore.get();
    const selectedIds = selectionState.selectedNodeIds;

    // 全ノードの選択状態を更新
    this.nodeInfoStore.forEach((nodeStore, nodeId) => {
      const isSelected = selectedIds.has(nodeId);
      nodeStore.update(state => ({
        ...state,
        isSelected,
        lastUpdated: Date.now(),
      }));
    });
  }

  /**
   * イベントハンドラーの設定
   */
  private setupEventHandlers(): void {
    // 選択状態の変更を監視
    this.selectionStore.subscribe(change => {
      if (change.newValue) {
        this.eventEmitter.emit(MindMapEventType.SELECTION_CHANGED, {
          selectedNodeIds: change.newValue.selectedNodeIds,
          primaryNodeId: change.newValue.primaryNodeId,
          timestamp: change.timestamp,
        });
      }
    });

    // キャンバス状態の変更を監視
    this.canvasStore.subscribe(change => {
      if (change.newValue) {
        this.eventEmitter.emit(MindMapEventType.VIEWPORT_CHANGED, {
          viewport: change.newValue.viewport,
          timestamp: change.timestamp,
        });
      }
    });
  }

  // ============================================================================
  // 折りたたみ状態の管理
  // ============================================================================

  /**
   * ノードの折りたたみ状態を切り替え
   * @param nodeId - ノードID
   */
  toggleNodeCollapsed(nodeId: NodeId): void {
    const nodeInfo = this.getNodeInfo(nodeId);
    this.setNodeCollapsed(nodeId, !nodeInfo.isCollapsed);
  }

  /**
   * ノードの子ノードをすべて展開
   * @param nodeId - ノードID
   * @param recursive - 再帰的に子ノードも展開するか
   */
  expandNode(nodeId: NodeId, recursive: boolean = false): void {
    this.setNodeCollapsed(nodeId, false);

    if (recursive) {
      const nodeInfo = this.getNodeInfo(nodeId);
      nodeInfo.childrenIds.forEach(childId => {
        this.expandNode(childId, true);
      });
    }
  }

  /**
   * ノードの子ノードをすべて折りたたみ
   * @param nodeId - ノードID
   * @param recursive - 再帰的に子ノードも折りたたむか
   */
  collapseNode(nodeId: NodeId, recursive: boolean = false): void {
    this.setNodeCollapsed(nodeId, true);

    if (recursive) {
      const nodeInfo = this.getNodeInfo(nodeId);
      nodeInfo.childrenIds.forEach(childId => {
        this.collapseNode(childId, true);
      });
    }
  }

  /**
   * 指定ノードの可視状態を取得（親が折りたたまれていると非表示）
   * @param nodeId - ノードID
   * @returns ノードが可視状態かどうか
   */
  isNodeVisible(nodeId: NodeId): boolean {
    const nodeInfo = this.getNodeInfo(nodeId);

    // ルートノードは常に可視
    if (!nodeInfo.parentId) {
      return true;
    }

    // 親ノードが折りたたまれている場合は非表示
    const parentInfo = this.getNodeInfo(nodeInfo.parentId);
    if (parentInfo.isCollapsed) {
      return false;
    }

    // 再帰的に親の可視状態をチェック
    return this.isNodeVisible(nodeInfo.parentId);
  }

  /**
   * 可視状態のノードIDリストを取得
   * @returns 可視状態のノードIDリスト
   */
  getVisibleNodeIds(): NodeId[] {
    return this.getAllNodeIds().filter(nodeId => this.isNodeVisible(nodeId));
  }

  /**
   * 折りたたまれたノードの数を取得
   * @returns 折りたたまれたノードの数
   */
  getCollapsedNodeCount(): number {
    return this.getAllNodeIds().filter(nodeId => {
      const nodeInfo = this.getNodeInfo(nodeId);
      return nodeInfo.isCollapsed;
    }).length;
  }

  /**
   * 全ノードを展開
   */
  expandAllNodes(): void {
    this.getAllNodeIds().forEach(nodeId => {
      this.setNodeCollapsed(nodeId, false);
    });
  }

  /**
   * 全ノードを折りたたみ（ルートノード以外）
   */
  collapseAllNodes(): void {
    this.getAllNodeIds().forEach(nodeId => {
      const nodeInfo = this.getNodeInfo(nodeId);
      // ルートノード（親がnull）以外を折りたたみ
      if (nodeInfo.parentId !== null) {
        this.setNodeCollapsed(nodeId, true);
      }
    });
  }

  // ============================================================================
  // キャンバス関連のヘルパーメソッド
  // ============================================================================

  /**
   * ズーム値を制約範囲内にクランプ
   * @param zoom - ズーム値
   * @param minZoom - 最小ズーム
   * @param maxZoom - 最大ズーム
   * @returns クランプされたズーム値
   */
  private clampZoom(zoom: number, minZoom: number, maxZoom: number): number {
    return Math.max(minZoom, Math.min(maxZoom, zoom));
  }

  /**
   * コンテンツの境界ボックスを計算
   * @returns コンテンツの境界ボックス（ノードが存在しない場合はnull）
   */
  private calculateContentBounds(): Rectangle | null {
    const allNodeIds = this.getAllNodeIds();
    if (allNodeIds.length === 0) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // 全ノードの位置を調べて境界を計算
    allNodeIds.forEach(nodeId => {
      const nodeInfo = this.getNodeInfo(nodeId);
      const { x, y } = nodeInfo.position;

      // 仮のノードサイズ（実際の実装では、ノードの実際のサイズを使用）
      const nodeWidth = 120;
      const nodeHeight = 40;

      minX = Math.min(minX, x - nodeWidth / 2);
      minY = Math.min(minY, y - nodeHeight / 2);
      maxX = Math.max(maxX, x + nodeWidth / 2);
      maxY = Math.max(maxY, y + nodeHeight / 2);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }
}
