/**
 * マインドマップ関連型定義
 * マインドマップ全体の構造と管理に関する型定義を提供
 */

import type {
  NodeId,
  Point2D,
  Size,
  Rectangle,
  BaseEntity,
  ValidationResult,
} from './index';
import type { NodeCollection, NodeTreeStats, NodeEventData } from './node';
import { LayoutType, ZoomMode, Theme, FileFormat } from './index';

// ============================================================================
// マインドマップの基本構造
// ============================================================================

/** マインドマップのメタデータ */
export interface MindMapMetadata {
  /** タイトル */
  title: string;
  /** 説明 */
  description?: string;
  /** 作者 */
  author?: string;
  /** バージョン */
  version: string;
  /** タグ */
  tags: string[];
  /** カテゴリ */
  category?: string;
  /** 言語 */
  language: string;
  /** カスタムプロパティ */
  customProperties: Record<string, any>;
}

/** マインドマップの設定 */
export interface MindMapSettings {
  /** レイアウトの種類 */
  layoutType: LayoutType;
  /** テーマ */
  theme: Theme;
  /** 自動保存の有効/無効 */
  autoSave: boolean;
  /** 自動保存の間隔（秒） */
  autoSaveInterval: number;
  /** グリッドの表示 */
  showGrid: boolean;
  /** ミニマップの表示 */
  showMinimap: boolean;
  /** アニメーションの有効/無効 */
  enableAnimations: boolean;
  /** アニメーションの継続時間（ミリ秒） */
  animationDuration: number;
}

/** マインドマップのビューポート設定 */
export interface MindMapViewport {
  /** ズームレベル */
  zoom: number;
  /** 最小ズームレベル */
  minZoom: number;
  /** 最大ズームレベル */
  maxZoom: number;
  /** ビューポートの中心座標 */
  center: Point2D;
  /** ビューポートのサイズ */
  size: Size;
  /** ズームモード */
  zoomMode: ZoomMode;
}

// ============================================================================
// メインのマインドマップインターフェース
// ============================================================================

/** マインドマップの基本インターフェース */
export interface MindMap extends BaseEntity {
  /** メタデータ */
  metadata: MindMapMetadata;
  /** 設定 */
  settings: MindMapSettings;
  /** ビューポート設定 */
  viewport: MindMapViewport;
  /** ノードコレクション */
  nodes: NodeCollection;
  /** 統計情報 */
  stats: NodeTreeStats;
}

// ============================================================================
// マインドマップの操作関連
// ============================================================================

/** マインドマップの作成データ */
export interface CreateMindMapData {
  /** タイトル */
  title: string;
  /** 説明（オプション） */
  description?: string;
  /** 作者（オプション） */
  author?: string;
  /** 初期設定（オプション） */
  settings?: Partial<MindMapSettings>;
  /** 初期ビューポート（オプション） */
  viewport?: Partial<MindMapViewport>;
}

/** マインドマップの更新データ */
export interface UpdateMindMapData {
  /** メタデータの部分更新 */
  metadata?: Partial<MindMapMetadata>;
  /** 設定の部分更新 */
  settings?: Partial<MindMapSettings>;
  /** ビューポートの部分更新 */
  viewport?: Partial<MindMapViewport>;
}

// ============================================================================
// レイアウト関連
// ============================================================================

/** レイアウト設定 */
export interface LayoutSettings {
  /** レイアウトの種類 */
  type: LayoutType;
  /** ノード間の間隔 */
  nodeSpacing: number;
  /** レベル間の間隔 */
  levelSpacing: number;
  /** レイアウトの方向 */
  direction: LayoutDirection;
  /** 自動調整の有効/無効 */
  autoLayout: boolean;
  /** アニメーション付きレイアウト */
  animated: boolean;
}

/** レイアウトの方向 */
export enum LayoutDirection {
  TOP_TO_BOTTOM = 'top-to-bottom',
  BOTTOM_TO_TOP = 'bottom-to-top',
  LEFT_TO_RIGHT = 'left-to-right',
  RIGHT_TO_LEFT = 'right-to-left',
  RADIAL_OUT = 'radial-out',
  RADIAL_IN = 'radial-in',
}

/** レイアウト計算結果 */
export interface LayoutResult {
  /** ノードの位置情報 */
  nodePositions: Map<NodeId, Point2D>;
  /** 全体のバウンディングボックス */
  boundingBox: Rectangle;
  /** レイアウト計算にかかった時間 */
  computationTime: number;
  /** エラー情報 */
  errors: string[];
}

// ============================================================================
// エクスポート・インポート関連
// ============================================================================

/** エクスポート設定 */
export interface ExportSettings {
  /** ファイル形式 */
  format: FileFormat;
  /** 画像の解像度（画像エクスポートの場合） */
  resolution?: number;
  /** 背景色を含めるか */
  includeBackground: boolean;
  /** 選択されたノードのみエクスポート */
  selectedOnly: boolean;
  /** 圧縮設定 */
  compression?: CompressionSettings;
}

/** 圧縮設定 */
export interface CompressionSettings {
  /** 圧縮の有効/無効 */
  enabled: boolean;
  /** 圧縮レベル (0-9) */
  level: number;
  /** 品質 (0-100, JPEG形式の場合) */
  quality?: number;
}

/** インポート設定 */
export interface ImportSettings {
  /** 既存データとのマージ方法 */
  mergeMode: MergeMode;
  /** IDの競合解決方法 */
  idConflictResolution: IdConflictResolution;
  /** バリデーションの実行 */
  validateData: boolean;
  /** エラー時の動作 */
  errorHandling: ErrorHandlingMode;
}

/** マージモード */
export enum MergeMode {
  REPLACE = 'replace',
  MERGE = 'merge',
  APPEND = 'append',
}

/** ID競合解決方法 */
export enum IdConflictResolution {
  GENERATE_NEW = 'generate-new',
  SKIP = 'skip',
  OVERWRITE = 'overwrite',
}

/** エラーハンドリングモード */
export enum ErrorHandlingMode {
  STRICT = 'strict',
  LENIENT = 'lenient',
  SKIP_ERRORS = 'skip-errors',
}

// ============================================================================
// 検索・フィルタリング関連
// ============================================================================

/** マインドマップ検索条件 */
export interface MindMapSearchCriteria {
  /** テキスト検索 */
  text?: string;
  /** 作者で検索 */
  author?: string;
  /** タグで検索 */
  tags?: string[];
  /** 作成日時の範囲 */
  createdDateRange?: DateRange;
  /** 更新日時の範囲 */
  updatedDateRange?: DateRange;
  /** ノード数の範囲 */
  nodeCountRange?: NumberRange;
}

/** 日時範囲 */
export interface DateRange {
  /** 開始日時 */
  start: Date;
  /** 終了日時 */
  end: Date;
}

/** 数値範囲 */
export interface NumberRange {
  /** 最小値 */
  min: number;
  /** 最大値 */
  max: number;
}

// ============================================================================
// イベント関連
// ============================================================================

/** マインドマップイベントの種類 */
export enum MindMapEventType {
  CREATED = 'mindmap:created',
  UPDATED = 'mindmap:updated',
  DELETED = 'mindmap:deleted',
  SAVED = 'mindmap:saved',
  LOADED = 'mindmap:loaded',
  EXPORTED = 'mindmap:exported',
  IMPORTED = 'mindmap:imported',
  LAYOUT_CHANGED = 'mindmap:layout:changed',
  VIEWPORT_CHANGED = 'mindmap:viewport:changed',
  SETTINGS_CHANGED = 'mindmap:settings:changed',
  NODE_ADDED = 'mindmap:node:added',
  NODE_REMOVED = 'mindmap:node:removed',
  SELECTION_CHANGED = 'mindmap:selection:changed',
}

/** マインドマップイベントデータ */
export interface MindMapEventData {
  /** イベントの種類 */
  type: MindMapEventType;
  /** マインドマップID */
  mindmapId: string;
  /** イベント発生時刻 */
  timestamp: Date;
  /** 変更前の値 */
  previousValue?: any;
  /** 変更後の値 */
  currentValue?: any;
  /** 関連するノードイベント */
  nodeEvents?: NodeEventData[];
  /** 追加のメタデータ */
  metadata?: Record<string, any>;
}

// ============================================================================
// 履歴・アンドゥ/リドゥ関連
// ============================================================================

/** 操作の種類 */
export enum OperationType {
  CREATE_NODE = 'create_node',
  UPDATE_NODE = 'update_node',
  DELETE_NODE = 'delete_node',
  MOVE_NODE = 'move_node',
  CREATE_MINDMAP = 'create_mindmap',
  UPDATE_MINDMAP = 'update_mindmap',
  CHANGE_LAYOUT = 'change_layout',
  CHANGE_SETTINGS = 'change_settings',
  BATCH_OPERATION = 'batch_operation',
}

/** 操作履歴のエントリ */
export interface HistoryEntry {
  /** 一意ID */
  id: string;
  /** 操作の種類 */
  type: OperationType;
  /** 実行時刻 */
  timestamp: Date;
  /** 操作の説明 */
  description: string;
  /** アンドゥ用のデータ */
  undoData: any;
  /** リドゥ用のデータ */
  redoData: any;
  /** 対象のマインドマップID */
  mindmapId: string;
  /** 操作者情報 */
  user?: string;
}

/** 履歴管理の設定 */
export interface HistorySettings {
  /** 履歴の最大保持数 */
  maxHistorySize: number;
  /** 自動クリーンアップの有効/無効 */
  autoCleanup: boolean;
  /** バッチ操作の記録 */
  recordBatchOperations: boolean;
  /** 履歴の永続化 */
  persistHistory: boolean;
}

// ============================================================================
// バリデーション関連
// ============================================================================

/** マインドマップバリデーション結果 */
export interface MindMapValidationResult extends ValidationResult {
  /** ノードレベルのエラー */
  nodeErrors: Map<NodeId, ValidationResult>;
  /** 構造レベルのエラー */
  structureErrors: string[];
  /** 設定レベルのエラー */
  settingsErrors: string[];
}

// ============================================================================
// パフォーマンス関連
// ============================================================================

/** パフォーマンス統計 */
export interface PerformanceStats {
  /** 描画時間（ミリ秒） */
  renderTime: number;
  /** レイアウト計算時間（ミリ秒） */
  layoutTime: number;
  /** メモリ使用量（バイト） */
  memoryUsage: number;
  /** FPS */
  fps: number;
  /** 最後の測定時刻 */
  lastMeasurement: Date;
}

// ============================================================================
// デフォルト値と定数
// ============================================================================

/** デフォルトのマインドマップメタデータ */
export const DEFAULT_MINDMAP_METADATA: MindMapMetadata = {
  title: '新しいマインドマップ',
  version: '1.0.0',
  tags: [],
  language: 'ja',
  customProperties: {},
};

/** デフォルトのマインドマップ設定 */
export const DEFAULT_MINDMAP_SETTINGS: MindMapSettings = {
  layoutType: 'tree' as LayoutType,
  theme: 'light' as Theme,
  autoSave: true,
  autoSaveInterval: 30,
  showGrid: true,
  showMinimap: true,
  enableAnimations: true,
  animationDuration: 300,
};

/** デフォルトのビューポート設定 */
export const DEFAULT_VIEWPORT: MindMapViewport = {
  zoom: 1.0,
  minZoom: 0.1,
  maxZoom: 5.0,
  center: { x: 0, y: 0 },
  size: { width: 800, height: 600 },
  zoomMode: 'fit' as ZoomMode,
};

/** デフォルトのレイアウト設定 */
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  type: 'tree' as LayoutType,
  nodeSpacing: 100,
  levelSpacing: 150,
  direction: LayoutDirection.TOP_TO_BOTTOM,
  autoLayout: true,
  animated: true,
};

/** デフォルトのエクスポート設定 */
export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  format: 'yaml' as FileFormat,
  includeBackground: false,
  selectedOnly: false,
};

/** デフォルトのインポート設定 */
export const DEFAULT_IMPORT_SETTINGS: ImportSettings = {
  mergeMode: MergeMode.REPLACE,
  idConflictResolution: IdConflictResolution.GENERATE_NEW,
  validateData: true,
  errorHandling: ErrorHandlingMode.STRICT,
};

/** デフォルトの履歴設定 */
export const DEFAULT_HISTORY_SETTINGS: HistorySettings = {
  maxHistorySize: 100,
  autoCleanup: true,
  recordBatchOperations: true,
  persistHistory: false,
};
