/**
 * 状態管理クラスの実装
 * 型安全でリアクティブな状態管理システムを提供
 */

import { EventEmitter } from './event-emitter';
import type {
  NodeId,
  MindMapNode,
  MindMapSettings,
  MindMapViewport,
  EventHandler,
  UnsubscribeFunction,
} from '../types';
import { NodeEventType, MindMapEventType } from '../types';

// ============================================================================
// 状態管理の基本インターフェース
// ============================================================================

/** 状態の変更タイプ */
export enum StateChangeType {
  SET = 'set',
  UPDATE = 'update',
  DELETE = 'delete',
  RESET = 'reset',
  BULK_UPDATE = 'bulk_update',
}

/** 状態変更の詳細情報 */
export interface StateChange<T = any> {
  /** 変更タイプ */
  type: StateChangeType;
  /** 変更されたキー */
  key: string;
  /** 前の値 */
  previousValue?: T;
  /** 新しい値 */
  newValue?: T;
  /** タイムスタンプ */
  timestamp: number;
  /** 変更の説明 */
  description?: string;
  /** 追加のメタデータ */
  metadata?: Record<string, any>;
}

/** 状態ストアのインターフェース */
export interface StateStore<T = any> {
  /** 状態を取得 */
  get(): T;
  /** 状態を設定 */
  set(value: T): void;
  /** 状態を更新 */
  update(updater: (current: T) => T): void;
  /** 状態をリセット */
  reset(): void;
  /** 変更を購読 */
  subscribe(handler: EventHandler<StateChange<T>>): UnsubscribeFunction;
}

// ============================================================================
// 汎用的な状態管理クラス
// ============================================================================

/**
 * リアクティブな状態ストア
 * 単一の値の状態管理を行う
 */
export class ReactiveStore<T = any> implements StateStore<T> {
  /** 現在の状態 */
  private currentState: T;

  /** 初期状態 */
  private initialState: T;

  /** イベントエミッター */
  private emitter: EventEmitter;

  /** ストア名 */
  private name: string;

  /** バリデーション関数 */
  private validator: ((value: T) => boolean) | undefined;

  /** 変更履歴 */
  private history: StateChange<T>[] = [];

  /** 最大履歴数 */
  private maxHistorySize: number = 100;

  /**
   * コンストラクタ
   * @param initialState - 初期状態
   * @param name - ストア名
   * @param options - オプション
   */
  constructor(
    initialState: T,
    name: string = 'unnamed',
    options: {
      validator?: (value: T) => boolean;
      maxHistorySize?: number;
    } = {}
  ) {
    this.currentState = initialState;
    this.initialState = initialState;
    this.name = name;
    this.validator = options.validator;
    this.maxHistorySize = options.maxHistorySize ?? 100;
    this.emitter = new EventEmitter();
  }

  /**
   * 現在の状態を取得
   * @returns 現在の状態
   */
  get(): T {
    return this.currentState;
  }

  /**
   * 状態を設定
   * @param value - 新しい値
   */
  set(value: T): void {
    if (this.validator && !this.validator(value)) {
      throw new Error(`Invalid value for store ${this.name}`);
    }

    const previousValue = this.currentState;
    this.currentState = value;

    const change: StateChange<T> = {
      type: StateChangeType.SET,
      key: this.name,
      previousValue,
      newValue: value,
      timestamp: Date.now(),
    };

    this.addToHistory(change);
    this.emitter.emit('change', change);
  }

  /**
   * 状態を更新
   * @param updater - 更新関数
   */
  update(updater: (current: T) => T): void {
    const newValue = updater(this.currentState);
    this.set(newValue);
  }

  /**
   * 状態をリセット
   */
  reset(): void {
    const previousValue = this.currentState;
    this.currentState = this.initialState;

    const change: StateChange<T> = {
      type: StateChangeType.RESET,
      key: this.name,
      previousValue,
      newValue: this.initialState,
      timestamp: Date.now(),
    };

    this.addToHistory(change);
    this.emitter.emit('change', change);
  }

  /**
   * 変更を購読
   * @param handler - 変更ハンドラー
   * @returns 購読解除関数
   */
  subscribe(handler: EventHandler<StateChange<T>>): UnsubscribeFunction {
    return this.emitter.on('change', handler);
  }

  /**
   * 変更履歴を取得
   * @returns 変更履歴
   */
  getHistory(): StateChange<T>[] {
    return [...this.history];
  }

  /**
   * 履歴をクリア
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 履歴に追加
   * @param change - 状態変更
   */
  private addToHistory(change: StateChange<T>): void {
    this.history.push(change);

    // 履歴サイズを制限
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }
}

// ============================================================================
// マインドマップ専用の状態管理
// ============================================================================

/** マインドマップアプリケーションの状態 */
export interface AppState {
  /** ノードのマップ */
  nodes: Map<NodeId, MindMapNode>;
  /** 選択されたノード */
  selectedNodeIds: Set<NodeId>;
  /** フォーカスされたノード */
  focusedNodeId: NodeId | null;
  /** ルートノード */
  rootNodeId: NodeId | null;
  /** マインドマップの設定 */
  settings: MindMapSettings;
  /** ビューポート状態 */
  viewport: MindMapViewport;
  /** 編集中のノード */
  editingNodeId: NodeId | null;
  /** 折りたたまれたノード */
  collapsedNodeIds: Set<NodeId>;
  /** 表示モード */
  viewMode: 'edit' | 'view' | 'presentation';
  /** UI状態 */
  ui: {
    leftPanelOpen: boolean;
    rightPanelOpen: boolean;
    toolbarVisible: boolean;
    loading: boolean;
    error: string | null;
  };
}

/**
 * マインドマップ状態管理クラス
 * アプリケーション全体の状態を管理
 */
export class MindMapStateManager {
  /** メインの状態ストア */
  private store: ReactiveStore<AppState>;

  /** 個別のストア */
  private nodeStore: ReactiveStore<Map<NodeId, MindMapNode>>;
  private selectionStore: ReactiveStore<Set<NodeId>>;
  private settingsStore: ReactiveStore<MindMapSettings>;
  private viewportStore: ReactiveStore<MindMapViewport>;

  /** アンドゥ・リドゥ用の履歴 */
  private undoStack: AppState[] = [];
  private redoStack: AppState[] = [];
  private maxUndoSize: number = 50;

  /** イベントエミッター */
  private emitter: EventEmitter;

  /**
   * コンストラクタ
   * @param initialSettings - 初期設定
   */
  constructor(initialSettings?: Partial<MindMapSettings>) {
    // 初期状態を作成
    const initialState: AppState = {
      nodes: new Map(),
      selectedNodeIds: new Set(),
      focusedNodeId: null,
      rootNodeId: null,
      settings: {
        layoutType: 'tree',
        theme: 'light',
        autoSave: true,
        autoSaveInterval: 30,
        ...initialSettings,
      } as MindMapSettings,
      viewport: {
        zoom: 1,
        minZoom: 0.1,
        maxZoom: 5.0,
        center: { x: 0, y: 0 },
        size: { width: 800, height: 600 },
        zoomMode: 'fit',
      } as MindMapViewport,
      editingNodeId: null,
      collapsedNodeIds: new Set(),
      viewMode: 'edit',
      ui: {
        leftPanelOpen: true,
        rightPanelOpen: true,
        toolbarVisible: true,
        loading: false,
        error: null,
      },
    };

    // メインストアを作成
    this.store = new ReactiveStore(initialState, 'appState');

    // 個別ストアを作成
    this.nodeStore = new ReactiveStore(initialState.nodes, 'nodes');
    this.selectionStore = new ReactiveStore(
      initialState.selectedNodeIds,
      'selection'
    );
    this.settingsStore = new ReactiveStore(initialState.settings, 'settings');
    this.viewportStore = new ReactiveStore(initialState.viewport, 'viewport');

    this.emitter = new EventEmitter();

    // ストア間の同期を設定
    this.setupStoreSynchronization();
  }

  // ============================================================================
  // 状態アクセスメソッド
  // ============================================================================

  /**
   * 現在の状態を取得
   * @returns 現在の状態
   */
  getState(): AppState {
    return this.store.get();
  }

  /**
   * ノードを取得
   * @param nodeId - ノードID
   * @returns ノード
   */
  getNode(nodeId: NodeId): MindMapNode | undefined {
    return this.nodeStore.get().get(nodeId);
  }

  /**
   * 全ノードを取得
   * @returns ノードマップ
   */
  getNodes(): Map<NodeId, MindMapNode> {
    return new Map(this.nodeStore.get());
  }

  /**
   * 選択されたノードを取得
   * @returns 選択されたノードIDのセット
   */
  getSelectedNodeIds(): Set<NodeId> {
    return new Set(this.selectionStore.get());
  }

  /**
   * 選択されたノードオブジェクトを取得
   * @returns 選択されたノードの配列
   */
  getSelectedNodes(): MindMapNode[] {
    const nodes = this.nodeStore.get();
    const selectedIds = this.selectionStore.get();
    return Array.from(selectedIds)
      .map(id => nodes.get(id))
      .filter((node): node is MindMapNode => node !== undefined);
  }

  /**
   * 設定を取得
   * @returns 設定
   */
  getSettings(): MindMapSettings {
    return this.settingsStore.get();
  }

  /**
   * ビューポート状態を取得
   * @returns ビューポート状態
   */
  getViewport(): MindMapViewport {
    return this.viewportStore.get();
  }

  // ============================================================================
  // ノード操作メソッド
  // ============================================================================

  /**
   * ノードを追加
   * @param node - 追加するノード
   */
  addNode(node: MindMapNode): void {
    this.withUndo(() => {
      const nodes = new Map(this.nodeStore.get());
      nodes.set(node.id, node);
      this.nodeStore.set(nodes);

      // ルートノードが未設定の場合は設定
      if (!this.getState().rootNodeId && !node.parentId) {
        this.updateState(state => ({ ...state, rootNodeId: node.id }));
      }

      this.emitEvent(NodeEventType.NODE_CREATED, { node });
    });
  }

  /**
   * ノードを更新
   * @param nodeId - ノードID
   * @param updates - 更新内容
   */
  updateNode(nodeId: NodeId, updates: Partial<MindMapNode>): void {
    this.withUndo(() => {
      const nodes = new Map(this.nodeStore.get());
      const currentNode = nodes.get(nodeId);

      if (!currentNode) {
        throw new Error(`Node ${nodeId} not found`);
      }

      const updatedNode = { ...currentNode, ...updates, updatedAt: new Date() };
      nodes.set(nodeId, updatedNode);
      this.nodeStore.set(nodes);

      this.emitEvent(NodeEventType.NODE_UPDATED, {
        node: updatedNode,
        previousValue: currentNode,
        newValue: updatedNode,
      });
    });
  }

  /**
   * ノードを削除
   * @param nodeId - ノードID
   * @param deleteChildren - 子ノードも削除するか
   */
  deleteNode(nodeId: NodeId, deleteChildren: boolean = true): void {
    this.withUndo(() => {
      const nodes = new Map(this.nodeStore.get());
      const node = nodes.get(nodeId);

      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }

      // 子ノードの処理
      if (deleteChildren) {
        // 子ノードも再帰的に削除
        const children = this.getChildNodes(nodeId);
        children.forEach(child => this.deleteNode(child.id, true));
      } else {
        // 子ノードの親を変更
        const children = this.getChildNodes(nodeId);
        children.forEach(child => {
          this.updateNode(child.id, { parentId: node.parentId });
        });
      }

      // ノードを削除
      nodes.delete(nodeId);
      this.nodeStore.set(nodes);

      // 選択から除外
      this.deselectNode(nodeId);

      // フォーカスを解除
      if (this.getState().focusedNodeId === nodeId) {
        this.updateState(state => ({ ...state, focusedNodeId: null }));
      }

      this.emitEvent(NodeEventType.NODE_DELETED, { node });
    });
  }

  /**
   * 子ノードを取得
   * @param nodeId - 親ノードID
   * @returns 子ノードの配列
   */
  getChildNodes(nodeId: NodeId): MindMapNode[] {
    const nodes = this.nodeStore.get();
    return Array.from(nodes.values()).filter(node => node.parentId === nodeId);
  }

  /**
   * 親ノードを取得
   * @param nodeId - 子ノードID
   * @returns 親ノード
   */
  getParentNode(nodeId: NodeId): MindMapNode | undefined {
    const node = this.getNode(nodeId);
    return node?.parentId ? this.getNode(node.parentId) : undefined;
  }

  // ============================================================================
  // 選択状態管理
  // ============================================================================

  /**
   * ノードを選択
   * @param nodeId - ノードID
   * @param multiSelect - 複数選択か
   */
  selectNode(nodeId: NodeId, multiSelect: boolean = false): void {
    const selectedIds = new Set(this.selectionStore.get());

    if (!multiSelect) {
      selectedIds.clear();
    }

    selectedIds.add(nodeId);
    this.selectionStore.set(selectedIds);

    this.emitEvent(NodeEventType.NODE_SELECTED, {
      node: this.getNode(nodeId)!,
      selectedNodeIds: Array.from(selectedIds),
    });
  }

  /**
   * ノードの選択を解除
   * @param nodeId - ノードID
   */
  deselectNode(nodeId: NodeId): void {
    const selectedIds = new Set(this.selectionStore.get());
    selectedIds.delete(nodeId);
    this.selectionStore.set(selectedIds);

    this.emitEvent(NodeEventType.NODE_DESELECTED, {
      node: this.getNode(nodeId)!,
      selectedNodeIds: Array.from(selectedIds),
    });
  }

  /**
   * 全選択を解除
   */
  clearSelection(): void {
    const selectedIds = this.selectionStore.get();
    if (selectedIds.size > 0) {
      this.selectionStore.set(new Set());
      this.emitEvent(MindMapEventType.SELECTION_CLEARED, {});
    }
  }

  /**
   * ノードにフォーカス
   * @param nodeId - ノードID
   */
  focusNode(nodeId: NodeId | null): void {
    const previousFocusId = this.getState().focusedNodeId;
    this.updateState(state => ({ ...state, focusedNodeId: nodeId }));

    if (previousFocusId) {
      this.emitEvent(NodeEventType.NODE_BLURRED, {
        node: this.getNode(previousFocusId)!,
      });
    }

    if (nodeId) {
      this.emitEvent(NodeEventType.NODE_FOCUSED, {
        node: this.getNode(nodeId)!,
      });
    }
  }

  // ============================================================================
  // 設定管理
  // ============================================================================

  /**
   * 設定を更新
   * @param updates - 更新内容
   */
  updateSettings(updates: Partial<MindMapSettings>): void {
    const currentSettings = this.settingsStore.get();
    const newSettings = { ...currentSettings, ...updates };
    this.settingsStore.set(newSettings);

    this.emitEvent(MindMapEventType.MINDMAP_SETTINGS_CHANGED, {
      settings: newSettings,
      previousValue: currentSettings,
      newValue: newSettings,
    });
  }

  // ============================================================================
  // ビューポート管理
  // ============================================================================

  /**
   * ビューポートを更新
   * @param updates - 更新内容
   */
  updateViewport(updates: Partial<MindMapViewport>): void {
    const currentViewport = this.viewportStore.get();
    const newViewport = { ...currentViewport, ...updates };
    this.viewportStore.set(newViewport);

    this.emitEvent(MindMapEventType.VIEWPORT_CHANGED, {
      viewport: newViewport,
      previousValue: currentViewport,
      newValue: newViewport,
    });
  }

  // ============================================================================
  // アンドゥ・リドゥ
  // ============================================================================

  /**
   * アンドゥ可能か
   * @returns アンドゥ可能かどうか
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * リドゥ可能か
   * @returns リドゥ可能かどうか
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * アンドゥ実行
   */
  undo(): void {
    if (!this.canUndo()) return;

    const currentState = this.store.get();
    const previousState = this.undoStack.pop()!;

    this.redoStack.push(currentState);
    this.restoreState(previousState);

    this.emitEvent(MindMapEventType.UNDO_PERFORMED, {});
  }

  /**
   * リドゥ実行
   */
  redo(): void {
    if (!this.canRedo()) return;

    const currentState = this.store.get();
    const nextState = this.redoStack.pop()!;

    this.undoStack.push(currentState);
    this.restoreState(nextState);

    this.emitEvent(MindMapEventType.REDO_PERFORMED, {});
  }

  // ============================================================================
  // ユーティリティメソッド
  // ============================================================================

  /**
   * 状態を購読
   * @param handler - 変更ハンドラー
   * @returns 購読解除関数
   */
  subscribe(handler: EventHandler<StateChange<AppState>>): UnsubscribeFunction {
    return this.store.subscribe(handler);
  }

  /**
   * イベントを購読
   * @param eventType - イベントタイプ
   * @param handler - イベントハンドラー
   * @returns 購読解除関数
   */
  on(eventType: string, handler: EventHandler): UnsubscribeFunction {
    return this.emitter.on(eventType, handler);
  }

  /**
   * 状態をリセット
   */
  reset(): void {
    this.store.reset();
    this.nodeStore.reset();
    this.selectionStore.reset();
    this.settingsStore.reset();
    this.viewportStore.reset();
    this.undoStack = [];
    this.redoStack = [];
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  /**
   * アンドゥ履歴付きで操作を実行
   * @param operation - 操作関数
   */
  private withUndo(operation: () => void): void {
    const currentState = this.store.get();
    this.undoStack.push(this.deepCloneState(currentState));

    // 履歴サイズを制限
    if (this.undoStack.length > this.maxUndoSize) {
      this.undoStack.shift();
    }

    // リドゥスタックをクリア
    this.redoStack = [];

    operation();
  }

  /**
   * 状態を更新
   * @param updater - 更新関数
   */
  private updateState(updater: (state: AppState) => AppState): void {
    this.store.update(updater);
  }

  /**
   * 状態を復元
   * @param state - 復元する状態
   */
  private restoreState(state: AppState): void {
    this.store.set(state);
    this.nodeStore.set(state.nodes);
    this.selectionStore.set(state.selectedNodeIds);
    this.settingsStore.set(state.settings);
    this.viewportStore.set(state.viewport);
  }

  /**
   * 状態のディープクローンを作成
   * @param state - クローンする状態
   * @returns クローンされた状態
   */
  private deepCloneState(state: AppState): AppState {
    return {
      ...state,
      nodes: new Map(state.nodes),
      selectedNodeIds: new Set(state.selectedNodeIds),
      collapsedNodeIds: new Set(state.collapsedNodeIds),
      settings: { ...state.settings },
      viewport: { ...state.viewport },
      ui: { ...state.ui },
    };
  }

  /**
   * ストア間の同期を設定
   */
  private setupStoreSynchronization(): void {
    // ノードストアの変更をメインストアに反映
    this.nodeStore.subscribe(change => {
      this.updateState(state => ({ ...state, nodes: change.newValue! }));
    });

    // 選択ストアの変更をメインストアに反映
    this.selectionStore.subscribe(change => {
      this.updateState(state => ({
        ...state,
        selectedNodeIds: change.newValue!,
      }));
    });

    // 設定ストアの変更をメインストアに反映
    this.settingsStore.subscribe(change => {
      this.updateState(state => ({ ...state, settings: change.newValue! }));
    });

    // ビューポートストアの変更をメインストアに反映
    this.viewportStore.subscribe(change => {
      this.updateState(state => ({ ...state, viewport: change.newValue! }));
    });
  }

  /**
   * イベントを発行
   * @param eventType - イベントタイプ
   * @param data - イベントデータ
   */
  private emitEvent(eventType: string, data: any): void {
    this.emitter.emit(eventType, data);
  }
}

// ============================================================================
// シングルトンインスタンス
// ============================================================================

/** グローバル状態管理インスタンス */
let globalStateManager: MindMapStateManager | null = null;

/**
 * グローバル状態管理インスタンスを取得
 * @param initialSettings - 初期設定（初回のみ）
 * @returns 状態管理インスタンス
 */
export function getStateManager(
  initialSettings?: Partial<MindMapSettings>
): MindMapStateManager {
  if (!globalStateManager) {
    globalStateManager = new MindMapStateManager(initialSettings);
  }
  return globalStateManager;
}

/**
 * グローバル状態管理インスタンスをリセット
 */
export function resetStateManager(): void {
  if (globalStateManager) {
    globalStateManager.reset();
  }
  globalStateManager = null;
}

// ============================================================================
// ユーティリティ関数
// ============================================================================

/**
 * 状態管理インスタンスを作成
 * @param initialSettings - 初期設定
 * @returns 状態管理インスタンス
 */
export function createStateManager(
  initialSettings?: Partial<MindMapSettings>
): MindMapStateManager {
  return new MindMapStateManager(initialSettings);
}

/**
 * リアクティブストアを作成
 * @param initialValue - 初期値
 * @param name - ストア名
 * @param options - オプション
 * @returns リアクティブストア
 */
export function createReactiveStore<T>(
  initialValue: T,
  name?: string,
  options?: {
    validator?: (value: T) => boolean;
    maxHistorySize?: number;
  }
): ReactiveStore<T> {
  return new ReactiveStore(initialValue, name, options);
}
