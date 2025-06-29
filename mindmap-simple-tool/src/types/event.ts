/**
 * イベント関連型定義
 * アプリケーション内のイベントシステム、状態変更通知、ユーザーインタラクションに関する型定義を提供
 */

import type { NodeId, Point2D, Size, BaseEntity } from './index';
import type { MindMapNode } from './node';
import type { MindMapSettings, MindMapViewport } from './mindmap';

// ============================================================================
// 基本イベント型
// ============================================================================

/** イベントハンドラー関数の型 */
export type EventHandler<T = any> = (data: T) => void | Promise<void>;

/** イベントリスナーの設定 */
export interface EventListener<T = any> {
  /** ハンドラー関数 */
  handler: EventHandler<T>;
  /** 一度だけ実行するか */
  once: boolean;
  /** 優先度（数値が大きいほど優先） */
  priority: number;
  /** 有効/無効 */
  enabled: boolean;
}

/** イベント購読解除関数 */
export type UnsubscribeFunction = () => void;

/** イベントの基本情報 */
export interface BaseEvent extends BaseEntity {
  /** イベントタイプ */
  type: string;
  /** イベント発生元 */
  source?: string;
  /** イベントデータ */
  data?: any;
  /** タイムスタンプ */
  timestamp: number;
  /** 伝播を停止するかどうか */
  propagationStopped: boolean;
  /** デフォルト動作を防ぐかどうか */
  defaultPrevented: boolean;
}

/** カスタムイベント */
export interface CustomEvent<T = any> extends BaseEvent {
  /** カスタムデータ */
  detail: T;
  /** イベントのバブリング */
  bubbles: boolean;
  /** キャンセル可能かどうか */
  cancelable: boolean;
}

// ============================================================================
// ノード関連イベント
// ============================================================================

/** ノードイベントの種類 */
export enum NodeEventType {
  // ライフサイクルイベント
  NODE_CREATED = 'node:created',
  NODE_UPDATED = 'node:updated',
  NODE_DELETED = 'node:deleted',
  NODE_MOVED = 'node:moved',

  // 選択・フォーカスイベント
  NODE_SELECTED = 'node:selected',
  NODE_DESELECTED = 'node:deselected',
  NODE_FOCUSED = 'node:focused',
  NODE_BLURRED = 'node:blurred',

  // 編集イベント
  NODE_EDIT_START = 'node:edit:start',
  NODE_EDIT_END = 'node:edit:end',
  NODE_TEXT_CHANGED = 'node:text:changed',
  NODE_STYLE_CHANGED = 'node:style:changed',

  // 階層操作イベント
  NODE_EXPANDED = 'node:expanded',
  NODE_COLLAPSED = 'node:collapsed',
  NODE_PARENT_CHANGED = 'node:parent:changed',
  NODE_CHILDREN_CHANGED = 'node:children:changed',

  // インタラクションイベント
  NODE_CLICKED = 'node:clicked',
  NODE_DOUBLE_CLICKED = 'node:double:clicked',
  NODE_RIGHT_CLICKED = 'node:right:clicked',
  NODE_HOVERED = 'node:hovered',
  NODE_UNHOVERED = 'node:unhovered',

  // ドラッグ&ドロップイベント
  NODE_DRAG_START = 'node:drag:start',
  NODE_DRAG = 'node:drag',
  NODE_DRAG_END = 'node:drag:end',
  NODE_DROP = 'node:drop',
}

/** ノードイベントデータ */
export interface NodeEventData {
  /** イベント対象のノード */
  node: MindMapNode;
  /** 前の値（更新イベントの場合） */
  previousValue?: any;
  /** 新しい値（更新イベントの場合） */
  newValue?: any;
  /** 変更されたフィールド名 */
  changedFields?: string[];
  /** イベント発生時のマウス位置 */
  mousePosition?: Point2D;
  /** 修飾キーの状態 */
  modifierKeys?: ModifierKeyState;
}

/** ノードイベント */
export interface NodeEvent extends CustomEvent<NodeEventData> {
  type: NodeEventType;
}

// ============================================================================
// マインドマップ関連イベント
// ============================================================================

/** マインドマップイベントの種類 */
export enum MindMapEventType {
  // データイベント
  MINDMAP_CREATED = 'mindmap:created',
  MINDMAP_LOADED = 'mindmap:loaded',
  MINDMAP_SAVED = 'mindmap:saved',
  MINDMAP_CLEARED = 'mindmap:cleared',
  MINDMAP_IMPORTED = 'mindmap:imported',
  MINDMAP_EXPORTED = 'mindmap:exported',

  // 構造変更イベント
  MINDMAP_STRUCTURE_CHANGED = 'mindmap:structure:changed',
  MINDMAP_SETTINGS_CHANGED = 'mindmap:settings:changed',
  MINDMAP_METADATA_CHANGED = 'mindmap:metadata:changed',

  // 表示状態イベント
  VIEWPORT_CHANGED = 'viewport:changed',
  ZOOM_CHANGED = 'zoom:changed',
  PAN_CHANGED = 'pan:changed',

  // レイアウトイベント
  LAYOUT_CHANGED = 'layout:changed',
  LAYOUT_RECALCULATED = 'layout:recalculated',

  // 選択状態イベント
  SELECTION_CHANGED = 'selection:changed',
  SELECTION_CLEARED = 'selection:cleared',

  // アンドゥ・リドゥイベント
  UNDO_PERFORMED = 'undo:performed',
  REDO_PERFORMED = 'redo:performed',
  HISTORY_CHANGED = 'history:changed',
}

/** マインドマップイベントデータ */
export interface MindMapEventData {
  /** マインドマップデータ */
  mindmapData?: any; // MindMapの実際のデータ型に応じて調整
  /** 設定データ */
  settings?: MindMapSettings;
  /** ビューポート状態 */
  viewport?: MindMapViewport;
  /** 選択されたノードID */
  selectedNodeIds?: NodeId[];
  /** 変更されたフィールド */
  changedFields?: string[];
  /** 前の値 */
  previousValue?: any;
  /** 新しい値 */
  newValue?: any;
}

/** マインドマップイベント */
export interface MindMapEvent extends CustomEvent<MindMapEventData> {
  type: MindMapEventType;
}

// ============================================================================
// UI関連イベント
// ============================================================================

/** UIイベントの種類 */
export enum UIEventType {
  // ウィンドウ・ビューポートイベント
  WINDOW_RESIZED = 'window:resized',
  VIEWPORT_RESIZED = 'viewport:resized',
  PANEL_RESIZED = 'panel:resized',

  // モーダル・ダイアログイベント
  MODAL_OPENED = 'modal:opened',
  MODAL_CLOSED = 'modal:closed',
  DIALOG_CONFIRMED = 'dialog:confirmed',
  DIALOG_CANCELLED = 'dialog:cancelled',

  // メニュー・ツールバーイベント
  MENU_OPENED = 'menu:opened',
  MENU_CLOSED = 'menu:closed',
  MENU_ITEM_CLICKED = 'menu:item:clicked',
  TOOLBAR_BUTTON_CLICKED = 'toolbar:button:clicked',

  // フォーム・入力イベント
  FORM_SUBMITTED = 'form:submitted',
  FORM_RESET = 'form:reset',
  FORM_VALIDATED = 'form:validated',
  INPUT_CHANGED = 'input:changed',
  INPUT_FOCUSED = 'input:focused',
  INPUT_BLURRED = 'input:blurred',

  // 通知・フィードバックイベント
  NOTIFICATION_SHOWN = 'notification:shown',
  NOTIFICATION_HIDDEN = 'notification:hidden',
  TOAST_SHOWN = 'toast:shown',
  TOAST_HIDDEN = 'toast:hidden',

  // テーマ・設定イベント
  THEME_CHANGED = 'theme:changed',
  SETTINGS_CHANGED = 'settings:changed',
  LANGUAGE_CHANGED = 'language:changed',
}

/** UIイベントデータ */
export interface UIEventData {
  /** UI要素のID */
  elementId?: string;
  /** UI要素のタイプ */
  elementType?: string;
  /** イベント固有のデータ */
  data?: any;
  /** 前の値 */
  previousValue?: any;
  /** 新しい値 */
  newValue?: any;
  /** サイズ情報 */
  size?: Size;
  /** 位置情報 */
  position?: Point2D;
}

/** UIイベント */
export interface UIEvent extends CustomEvent<UIEventData> {
  type: UIEventType;
}

// ============================================================================
// ファイル操作関連イベント
// ============================================================================

/** ファイルイベントの種類 */
export enum FileEventType {
  // ファイル読み込みイベント
  FILE_LOADING_START = 'file:loading:start',
  FILE_LOADING_PROGRESS = 'file:loading:progress',
  FILE_LOADING_SUCCESS = 'file:loading:success',
  FILE_LOADING_ERROR = 'file:loading:error',

  // ファイル保存イベント
  FILE_SAVING_START = 'file:saving:start',
  FILE_SAVING_PROGRESS = 'file:saving:progress',
  FILE_SAVING_SUCCESS = 'file:saving:success',
  FILE_SAVING_ERROR = 'file:saving:error',

  // ドラッグ&ドロップイベント
  FILE_DRAG_ENTER = 'file:drag:enter',
  FILE_DRAG_LEAVE = 'file:drag:leave',
  FILE_DRAG_OVER = 'file:drag:over',
  FILE_DROPPED = 'file:dropped',

  // ファイル形式イベント
  FILE_FORMAT_DETECTED = 'file:format:detected',
  FILE_FORMAT_CHANGED = 'file:format:changed',

  // エクスポートイベント
  EXPORT_START = 'export:start',
  EXPORT_PROGRESS = 'export:progress',
  EXPORT_SUCCESS = 'export:success',
  EXPORT_ERROR = 'export:error',
}

/** ファイルイベントデータ */
export interface FileEventData {
  /** ファイル名 */
  fileName?: string;
  /** ファイルサイズ */
  fileSize?: number;
  /** ファイル形式 */
  fileFormat?: string;
  /** ファイルコンテンツ */
  fileContent?: string | ArrayBuffer;
  /** 進捗情報 */
  progress?: {
    loaded: number;
    total: number;
    percentage: number;
  };
  /** エラー情報 */
  error?: Error;
  /** ファイルリスト */
  files?: File[];
}

/** ファイルイベント */
export interface FileEvent extends CustomEvent<FileEventData> {
  type: FileEventType;
}

// ============================================================================
// キーボード・マウス関連イベント
// ============================================================================

/** 修飾キーの状態 */
export interface ModifierKeyState {
  /** Ctrlキー */
  ctrl: boolean;
  /** Altキー */
  alt: boolean;
  /** Shiftキー */
  shift: boolean;
  /** Metaキー（Command/Windows） */
  meta: boolean;
}

/** キーボードイベントの種類 */
export enum KeyboardEventType {
  KEY_DOWN = 'keyboard:keydown',
  KEY_UP = 'keyboard:keyup',
  KEY_PRESS = 'keyboard:keypress',
  SHORTCUT_TRIGGERED = 'keyboard:shortcut:triggered',
}

/** キーボードイベントデータ */
export interface KeyboardEventData {
  /** キーコード */
  keyCode: number;
  /** キー名 */
  key: string;
  /** 文字コード */
  charCode?: number;
  /** 修飾キーの状態 */
  modifierKeys: ModifierKeyState;
  /** ショートカット名（ショートカットイベントの場合） */
  shortcutName?: string;
  /** リピートイベントかどうか */
  repeat: boolean;
}

/** キーボードイベント */
export interface KeyboardEvent extends CustomEvent<KeyboardEventData> {
  type: KeyboardEventType;
}

/** マウスイベントの種類 */
export enum MouseEventType {
  MOUSE_DOWN = 'mouse:down',
  MOUSE_UP = 'mouse:up',
  MOUSE_CLICK = 'mouse:click',
  MOUSE_DOUBLE_CLICK = 'mouse:dblclick',
  MOUSE_RIGHT_CLICK = 'mouse:rightclick',
  MOUSE_MOVE = 'mouse:move',
  MOUSE_ENTER = 'mouse:enter',
  MOUSE_LEAVE = 'mouse:leave',
  MOUSE_WHEEL = 'mouse:wheel',
}

/** マウスイベントデータ */
export interface MouseEventData {
  /** マウス位置 */
  position: Point2D;
  /** クリックされたボタン */
  button: number;
  /** 修飾キーの状態 */
  modifierKeys: ModifierKeyState;
  /** ホイールの移動量 */
  wheelDelta?: number;
  /** ホイールの方向 */
  wheelDirection?: 'up' | 'down' | 'left' | 'right';
  /** ターゲット要素 */
  target?: HTMLElement | NodeId;
}

/** マウスイベント */
export interface MouseEvent extends CustomEvent<MouseEventData> {
  type: MouseEventType;
}

// ============================================================================
// ドラッグ&ドロップ関連イベント
// ============================================================================

/** ドラッグ&ドロップイベントの種類 */
export enum DragDropEventType {
  DRAG_START = 'dragdrop:start',
  DRAG = 'dragdrop:drag',
  DRAG_END = 'dragdrop:end',
  DRAG_ENTER = 'dragdrop:enter',
  DRAG_LEAVE = 'dragdrop:leave',
  DRAG_OVER = 'dragdrop:over',
  DROP = 'dragdrop:drop',
}

/** ドラッグ&ドロップイベントデータ */
export interface DragDropEventData {
  /** ドラッグされている要素 */
  draggedElement?: HTMLElement | NodeId;
  /** ドロップターゲット */
  dropTarget?: HTMLElement | NodeId;
  /** ドラッグ開始位置 */
  startPosition: Point2D;
  /** 現在位置 */
  currentPosition: Point2D;
  /** ドラッグデータ */
  dragData?: any;
  /** データ転送 */
  dataTransfer?: DataTransfer;
  /** 修飾キーの状態 */
  modifierKeys: ModifierKeyState;
  /** ドロップ効果 */
  dropEffect?: 'none' | 'copy' | 'move' | 'link';
}

/** ドラッグ&ドロップイベント */
export interface DragDropEvent extends CustomEvent<DragDropEventData> {
  type: DragDropEventType;
}

// ============================================================================
// アニメーション関連イベント
// ============================================================================

/** アニメーションイベントの種類 */
export enum AnimationEventType {
  ANIMATION_START = 'animation:start',
  ANIMATION_END = 'animation:end',
  ANIMATION_ITERATION = 'animation:iteration',
  ANIMATION_CANCEL = 'animation:cancel',
  TRANSITION_START = 'transition:start',
  TRANSITION_END = 'transition:end',
  TRANSITION_CANCEL = 'transition:cancel',
}

/** アニメーションイベントデータ */
export interface AnimationEventData {
  /** アニメーション名 */
  animationName: string;
  /** アニメーション時間 */
  elapsedTime: number;
  /** 擬似要素 */
  pseudoElement?: string;
  /** ターゲット要素 */
  target: HTMLElement | NodeId;
  /** アニメーションの種類 */
  animationType: 'css' | 'd3' | 'custom';
}

/** アニメーションイベント */
export interface AnimationEvent extends CustomEvent<AnimationEventData> {
  type: AnimationEventType;
}

// ============================================================================
// エラー・デバッグ関連イベント
// ============================================================================

/** エラーイベントの種類 */
export enum ErrorEventType {
  ERROR_OCCURRED = 'error:occurred',
  WARNING_OCCURRED = 'warning:occurred',
  VALIDATION_ERROR = 'validation:error',
  NETWORK_ERROR = 'network:error',
  PARSE_ERROR = 'parse:error',
  RENDER_ERROR = 'render:error',
}

/** エラーイベントデータ */
export interface ErrorEventData {
  /** エラーオブジェクト */
  error: Error;
  /** エラーコード */
  errorCode?: string;
  /** エラーメッセージ */
  message: string;
  /** スタックトレース */
  stack?: string;
  /** エラー発生源 */
  source?: string;
  /** エラーの重要度 */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 復旧可能かどうか */
  recoverable: boolean;
  /** 追加情報 */
  metadata?: Record<string, any>;
}

/** エラーイベント */
export interface ErrorEvent extends CustomEvent<ErrorEventData> {
  type: ErrorEventType;
}

// ============================================================================
// パフォーマンス関連イベント
// ============================================================================

/** パフォーマンスイベントの種類 */
export enum PerformanceEventType {
  PERFORMANCE_MEASURED = 'performance:measured',
  MEMORY_WARNING = 'memory:warning',
  RENDER_SLOW = 'render:slow',
  OPERATION_TIMEOUT = 'operation:timeout',
}

/** パフォーマンスイベントデータ */
export interface PerformanceEventData {
  /** メトリクス名 */
  metricName: string;
  /** 測定値 */
  value: number;
  /** 単位 */
  unit: string;
  /** 閾値 */
  threshold?: number;
  /** 測定開始時刻 */
  startTime: number;
  /** 測定終了時刻 */
  endTime: number;
  /** 追加情報 */
  metadata?: Record<string, any>;
}

/** パフォーマンスイベント */
export interface PerformanceEvent extends CustomEvent<PerformanceEventData> {
  type: PerformanceEventType;
}

// ============================================================================
// 統合イベント型
// ============================================================================

/** 全てのアプリケーションイベントの型ユニオン */
export type AppEvent =
  | NodeEvent
  | MindMapEvent
  | UIEvent
  | FileEvent
  | KeyboardEvent
  | MouseEvent
  | DragDropEvent
  | AnimationEvent
  | ErrorEvent
  | PerformanceEvent;

/** 全てのイベントタイプの型ユニオン */
export type AppEventType =
  | NodeEventType
  | MindMapEventType
  | UIEventType
  | FileEventType
  | KeyboardEventType
  | MouseEventType
  | DragDropEventType
  | AnimationEventType
  | ErrorEventType
  | PerformanceEventType;

/** イベントエミッターの基本インターフェース */
export interface EventEmitter {
  /** イベントを発行 */
  emit<T = any>(eventType: string, data?: T): void;

  /** イベントリスナーを登録 */
  on<T = any>(
    eventType: string,
    handler: EventHandler<T>,
    options?: Partial<EventListener<T>>
  ): UnsubscribeFunction;

  /** 一度だけ実行されるイベントリスナーを登録 */
  once<T = any>(
    eventType: string,
    handler: EventHandler<T>
  ): UnsubscribeFunction;

  /** イベントリスナーを削除 */
  off(eventType: string, handler?: EventHandler): void;

  /** 全てのイベントリスナーを削除 */
  removeAllListeners(eventType?: string): void;

  /** 登録されているリスナー数を取得 */
  listenerCount(eventType: string): number;

  /** イベントタイプ一覧を取得 */
  eventNames(): string[];
}

/** イベントバスの設定 */
export interface EventBusConfig {
  /** 最大リスナー数 */
  maxListeners: number;
  /** デバッグモード */
  debug: boolean;
  /** エラーハンドリング */
  errorHandler?: (error: Error, eventType: string, data?: any) => void;
  /** ログ出力 */
  logger?: (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any
  ) => void;
}

/** イベント購読の設定オプション */
export interface SubscriptionOptions {
  /** 優先度 */
  priority?: number;
  /** 一度だけ実行 */
  once?: boolean;
  /** 非同期実行 */
  async?: boolean;
  /** フィルター関数 */
  filter?: (data: any) => boolean;
  /** スロットリング（ミリ秒） */
  throttle?: number;
  /** デバウンス（ミリ秒） */
  debounce?: number;
}

/** イベントミドルウェア */
export type EventMiddleware = (
  eventType: string,
  data: any,
  next: () => void
) => void;

/** イベント集約の設定 */
export interface EventAggregatorConfig {
  /** バッチ処理のサイズ */
  batchSize: number;
  /** バッチ処理の間隔（ミリ秒） */
  batchInterval: number;
  /** 優先度によるソート */
  sortByPriority: boolean;
}

// ============================================================================
// 型安全なイベント定義
// ============================================================================

/** 型安全なイベントマップ */
export interface TypedEventMap {
  [NodeEventType.NODE_CREATED]: NodeEventData;
  [NodeEventType.NODE_UPDATED]: NodeEventData;
  [NodeEventType.NODE_DELETED]: NodeEventData;
  [NodeEventType.NODE_SELECTED]: NodeEventData;
  [MindMapEventType.MINDMAP_LOADED]: MindMapEventData;
  [MindMapEventType.MINDMAP_SAVED]: MindMapEventData;
  [UIEventType.MODAL_OPENED]: UIEventData;
  [UIEventType.MODAL_CLOSED]: UIEventData;
  [FileEventType.FILE_LOADING_SUCCESS]: FileEventData;
  [ErrorEventType.ERROR_OCCURRED]: ErrorEventData;
  // 他のイベントタイプも必要に応じて追加
}

/** 型安全なイベントエミッター */
export interface TypedEventEmitter<TEventMap = TypedEventMap> {
  emit<K extends keyof TEventMap>(eventType: K, data: TEventMap[K]): void;
  on<K extends keyof TEventMap>(
    eventType: K,
    handler: EventHandler<TEventMap[K]>
  ): UnsubscribeFunction;
  once<K extends keyof TEventMap>(
    eventType: K,
    handler: EventHandler<TEventMap[K]>
  ): UnsubscribeFunction;
  off<K extends keyof TEventMap>(
    eventType: K,
    handler?: EventHandler<TEventMap[K]>
  ): void;
}
