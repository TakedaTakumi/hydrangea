/**
 * ノード関連型定義
 * マインドマップのノード（要素）に関する型定義を提供
 */

import type {
  NodeId,
  Color,
  Point2D,
  Size,
  BaseEntity,
  Positioned,
  Sized,
  Visibility,
  Selectable,
} from './index';
import { NodeShape, FontSize } from './index';

// ============================================================================
// ノードの基本インターフェース
// ============================================================================

/** ノードのスタイル設定 */
export interface NodeStyle {
  /** 背景色 */
  backgroundColor: Color;
  /** 境界線の色 */
  borderColor: Color;
  /** テキストの色 */
  textColor: Color;
  /** ノードの形状 */
  shape: NodeShape;
  /** フォントサイズ */
  fontSize: FontSize;
  /** 境界線の太さ */
  borderWidth: number;
  /** 角丸の半径（適用可能な形状の場合） */
  borderRadius: number;
  /** 影の設定 */
  shadow: boolean;
  /** 透明度 (0-1) */
  opacity: number;
}

/** ノードのレイアウト情報 */
export interface NodeLayout extends Positioned, Sized {
  /** Z-index（描画順序） */
  zIndex: number;
  /** 回転角度（度） */
  rotation: number;
  /** 最小サイズ */
  minSize: Size;
  /** 最大サイズ */
  maxSize: Size;
  /** 自動サイズ調整の有効/無効 */
  autoResize: boolean;
}

/** ノードの状態 */
export interface NodeState extends Visibility, Selectable {
  /** 編集中かどうか */
  editing: boolean;
  /** ホバー状態 */
  hovered: boolean;
  /** フォーカス状態 */
  focused: boolean;
  /** 折りたたみ状態 */
  collapsed: boolean;
  /** ロック状態（編集不可） */
  locked: boolean;
  /** ハイライト状態 */
  highlighted: boolean;
}

/** ノードのメタデータ */
export interface NodeMetadata {
  /** ノードのタグ */
  tags: string[];
  /** ノードのメモ・説明 */
  description?: string;
  /** カスタムプロパティ */
  customProperties: Record<string, any>;
  /** ノードの重要度 (1-5) */
  priority: number;
  /** ノードの進捗状況 (0-100) */
  progress: number;
}

// ============================================================================
// メインのノードインターフェース
// ============================================================================

/** マインドマップノードの基本インターフェース */
export interface MindMapNode extends BaseEntity {
  /** ノードのテキスト内容 */
  text: string;
  /** 親ノードのID（ルートノードの場合はnull） */
  parentId: NodeId | null;
  /** 子ノードのIDリスト */
  childrenIds: NodeId[];
  /** ノードのスタイル設定 */
  style: NodeStyle;
  /** ノードのレイアウト情報 */
  layout: NodeLayout;
  /** ノードの状態 */
  state: NodeState;
  /** ノードのメタデータ */
  metadata: NodeMetadata;
}

// ============================================================================
// ノード作成・更新用の型
// ============================================================================

/** 新しいノードを作成する際の必須プロパティ */
export interface CreateNodeData {
  /** ノードのテキスト内容 */
  text: string;
  /** 親ノードのID（ルートノードの場合はnull） */
  parentId: NodeId | null;
  /** 初期位置（オプション） */
  position?: Point2D;
  /** 初期スタイル（オプション） */
  style?: Partial<NodeStyle>;
}

/** ノードを更新する際のデータ */
export interface UpdateNodeData {
  /** ノードのテキスト内容 */
  text?: string;
  /** スタイルの部分更新 */
  style?: Partial<NodeStyle>;
  /** レイアウトの部分更新 */
  layout?: Partial<NodeLayout>;
  /** 状態の部分更新 */
  state?: Partial<NodeState>;
  /** メタデータの部分更新 */
  metadata?: Partial<NodeMetadata>;
}

// ============================================================================
// ノード操作関連の型
// ============================================================================

/** ノードの移動情報 */
export interface NodeMoveData {
  /** 移動するノードのID */
  nodeId: NodeId;
  /** 新しい親ノードのID */
  newParentId: NodeId | null;
  /** 新しい位置（兄弟ノード間での順序） */
  newIndex?: number;
}

/** ノードの複製情報 */
export interface NodeCloneData {
  /** 複製元ノードのID */
  sourceNodeId: NodeId;
  /** 複製先の親ノードID */
  targetParentId: NodeId | null;
  /** 子ノードも含めて複製するか */
  includeChildren: boolean;
}

/** ノードの削除情報 */
export interface NodeDeleteData {
  /** 削除するノードのID */
  nodeId: NodeId;
  /** 子ノードも含めて削除するか */
  includeChildren: boolean;
  /** 削除の代わりに非表示にするか */
  softDelete: boolean;
}

// ============================================================================
// ノード検索・フィルタリング用の型
// ============================================================================

/** ノード検索の条件 */
export interface NodeSearchCriteria {
  /** テキスト検索 */
  text?: string;
  /** タグ検索 */
  tags?: string[];
  /** 特定の親ノード配下のみ検索 */
  parentId?: NodeId;
  /** 深度レベル */
  depth?: number;
  /** スタイルによる検索 */
  style?: Partial<NodeStyle>;
  /** 状態による検索 */
  state?: Partial<NodeState>;
}

/** ノードフィルターの種類 */
export enum NodeFilterType {
  ALL = 'all',
  VISIBLE_ONLY = 'visible',
  SELECTED_ONLY = 'selected',
  COLLAPSED_ONLY = 'collapsed',
  LEAF_NODES = 'leaf',
  ROOT_NODES = 'root',
  BY_DEPTH = 'depth',
  BY_TAG = 'tag',
}

/** ノードフィルター設定 */
export interface NodeFilter {
  /** フィルターの種類 */
  type: NodeFilterType;
  /** フィルターのパラメータ */
  params?: Record<string, any>;
}

// ============================================================================
// ノードコレクション関連の型
// ============================================================================

/** ノードのコレクション */
export interface NodeCollection {
  /** ノードマップ（ID -> ノード） */
  nodes: Map<NodeId, MindMapNode>;
  /** ルートノードのIDリスト */
  rootNodeIds: NodeId[];
  /** 選択中のノードIDリスト */
  selectedNodeIds: NodeId[];
}

/** ノードツリーの統計情報 */
export interface NodeTreeStats {
  /** 総ノード数 */
  totalNodes: number;
  /** ルートノード数 */
  rootNodes: number;
  /** リーフノード数 */
  leafNodes: number;
  /** 最大深度 */
  maxDepth: number;
  /** 平均深度 */
  averageDepth: number;
}

// ============================================================================
// ノードイベント関連の型
// ============================================================================

/** ノード関連イベントの種類 */
export enum NodeEventType {
  CREATED = 'node:created',
  UPDATED = 'node:updated',
  DELETED = 'node:deleted',
  MOVED = 'node:moved',
  SELECTED = 'node:selected',
  DESELECTED = 'node:deselected',
  FOCUSED = 'node:focused',
  BLURRED = 'node:blurred',
  HOVERED = 'node:hovered',
  UNHOVERED = 'node:unhovered',
  COLLAPSED = 'node:collapsed',
  EXPANDED = 'node:expanded',
  EDITING_STARTED = 'node:editing:started',
  EDITING_ENDED = 'node:editing:ended',
  STYLE_CHANGED = 'node:style:changed',
}

/** ノードイベントのデータ */
export interface NodeEventData {
  /** イベントの種類 */
  type: NodeEventType;
  /** 対象ノードのID */
  nodeId: NodeId;
  /** イベント発生時刻 */
  timestamp: Date;
  /** 変更前の値（更新イベントの場合） */
  previousValue?: any;
  /** 変更後の値（更新イベントの場合） */
  currentValue?: any;
  /** 追加のメタデータ */
  metadata?: Record<string, any>;
}

// ============================================================================
// ノードバリデーション関連の型
// ============================================================================

/** ノードバリデーションエラーの種類 */
export enum NodeValidationErrorType {
  EMPTY_TEXT = 'empty_text',
  INVALID_PARENT = 'invalid_parent',
  CIRCULAR_REFERENCE = 'circular_reference',
  INVALID_POSITION = 'invalid_position',
  INVALID_SIZE = 'invalid_size',
  INVALID_COLOR = 'invalid_color',
  INVALID_STYLE = 'invalid_style',
}

/** ノードバリデーションエラー */
export interface NodeValidationError {
  /** エラーの種類 */
  type: NodeValidationErrorType;
  /** エラーメッセージ */
  message: string;
  /** エラーが発生したフィールド */
  field?: string;
  /** エラーの詳細情報 */
  details?: Record<string, any>;
}

/** ノードバリデーション結果 */
export interface NodeValidationResult {
  /** バリデーション成功フラグ */
  valid: boolean;
  /** エラーリスト */
  errors: NodeValidationError[];
  /** 警告リスト */
  warnings: NodeValidationError[];
}

// ============================================================================
// デフォルト値と定数
// ============================================================================

/** デフォルトのノードスタイル */
export const DEFAULT_NODE_STYLE: NodeStyle = {
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  textColor: '#1f2937',
  shape: 'rounded' as NodeShape,
  fontSize: 'base' as FontSize,
  borderWidth: 1,
  borderRadius: 8,
  shadow: true,
  opacity: 1,
};

/** デフォルトのノードレイアウト */
export const DEFAULT_NODE_LAYOUT: NodeLayout = {
  position: { x: 0, y: 0 },
  size: { width: 120, height: 60 },
  zIndex: 1,
  rotation: 0,
  minSize: { width: 60, height: 30 },
  maxSize: { width: 400, height: 200 },
  autoResize: true,
};

/** デフォルトのノード状態 */
export const DEFAULT_NODE_STATE: NodeState = {
  visible: true,
  selected: false,
  editing: false,
  hovered: false,
  focused: false,
  collapsed: false,
  locked: false,
  highlighted: false,
};

/** デフォルトのノードメタデータ */
export const DEFAULT_NODE_METADATA: NodeMetadata = {
  tags: [],
  customProperties: {},
  priority: 3,
  progress: 0,
};
