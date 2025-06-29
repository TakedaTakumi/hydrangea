/**
 * 基本型定義
 * マインドマップWebツールで使用される基本的な型定義を提供
 */

// ============================================================================
// 基本的なプリミティブ型
// ============================================================================

/** 一意識別子の型 */
export type NodeId = string;

/** RGBA色の型 */
export type RGBAColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

/** HEX色の型 */
export type HexColor = string;

/** 色の型（HEXまたはRGBA） */
export type Color = HexColor | RGBAColor;

/** 2D座標の型 */
export type Point2D = {
  x: number;
  y: number;
};

/** サイズの型 */
export type Size = {
  width: number;
  height: number;
};

/** 矩形の型 */
export type Rectangle = Point2D & Size;

// ============================================================================
// 列挙型
// ============================================================================

/** ノードの形状 */
export enum NodeShape {
  RECTANGLE = 'rect',
  CIRCLE = 'circle',
  ROUNDED_RECTANGLE = 'rounded',
  ELLIPSE = 'ellipse',
}

/** フォントサイズ */
export enum FontSize {
  EXTRA_SMALL = 'xs',
  SMALL = 'sm',
  BASE = 'base',
  LARGE = 'lg',
  EXTRA_LARGE = 'xl',
}

/** テーマの種類 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto',
}

/** ズームモード */
export enum ZoomMode {
  FIT_TO_VIEW = 'fit',
  ACTUAL_SIZE = 'actual',
  CUSTOM = 'custom',
}

/** レイアウトの種類 */
export enum LayoutType {
  TREE = 'tree',
  RADIAL = 'radial',
  FORCE = 'force',
  MANUAL = 'manual',
}

// ============================================================================
// ユーティリティ型
// ============================================================================

/** 部分的に必須のプロパティを持つ型 */
export type PartialRequired<T, K extends keyof T> = Partial<T> &
  Required<Pick<T, K>>;

/** オプショナルプロパティを除く型 */
export type RequiredOnly<T> = {
  [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};

/** プロパティを読み取り専用にする型 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ============================================================================
// 汎用インターフェース
// ============================================================================

/** 基本エンティティインターフェース */
export interface BaseEntity {
  /** 一意識別子 */
  readonly id: NodeId;
  /** 作成日時 */
  readonly createdAt: Date;
  /** 更新日時 */
  updatedAt: Date;
}

/** タイムスタンプ管理インターフェース */
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

/** 位置情報インターフェース */
export interface Positioned {
  position: Point2D;
}

/** サイズ情報インターフェース */
export interface Sized {
  size: Size;
}

/** 可視性制御インターフェース */
export interface Visibility {
  visible: boolean;
}

/** 選択状態インターフェース */
export interface Selectable {
  selected: boolean;
}

// ============================================================================
// イベント関連型
// ============================================================================

/** イベントハンドラーの型 */
export type EventHandler<T = any> = (data: T) => void;

/** イベントリスナーの型 */
export type EventListener<T = any> = {
  handler: EventHandler<T>;
  once?: boolean;
};

/** イベント購読解除関数の型 */
export type UnsubscribeFunction = () => void;

// ============================================================================
// バリデーション関連型
// ============================================================================

/** バリデーション結果の型 */
export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/** 型ガード関数の型 */
export type TypeGuard<T> = (value: unknown) => value is T;

// ============================================================================
// ファイル操作関連型
// ============================================================================

/** サポートされるファイル形式 */
export enum FileFormat {
  YAML = 'yaml',
  JSON = 'json',
  SVG = 'svg',
  PNG = 'png',
}

/** ファイル操作の結果 */
export type FileOperationResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};
