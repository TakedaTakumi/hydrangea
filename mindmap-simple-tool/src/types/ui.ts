/**
 * UI関連型定義
 * ユーザーインターフェース、インタラクション、コンポーネントに関する型定義を提供
 */

import type {
  NodeId,
  Point2D,
  Size,
  Rectangle,
  BaseEntity,
  ValidationResult,
} from './index';

// ============================================================================
// 基本的なUI要素
// ============================================================================

/** UI要素の基本プロパティ */
export interface UIElement extends BaseEntity {
  /** 表示/非表示 */
  visible: boolean;
  /** 有効/無効 */
  enabled: boolean;
  /** CSSクラス名 */
  className?: string;
  /** インラインスタイル */
  style?: Record<string, string>;
  /** ARIA属性 */
  ariaAttributes?: Record<string, string>;
}

/** レイアウトプロパティ */
export interface LayoutProps {
  /** 位置 */
  position: Point2D;
  /** サイズ */
  size: Size;
  /** z-index */
  zIndex: number;
  /** 境界矩形 */
  bounds: Rectangle;
  /** マージン */
  margin?: { top: number; right: number; bottom: number; left: number };
  /** パディング */
  padding?: { top: number; right: number; bottom: number; left: number };
}

/** アニメーションプロパティ */
export interface AnimationProps {
  /** アニメーション時間（ミリ秒） */
  duration: number;
  /** イージング関数 */
  easing: string;
  /** 遅延時間（ミリ秒） */
  delay?: number;
  /** 繰り返し回数 */
  iterations?: number;
}

// ============================================================================
// ボタン・コントロール要素
// ============================================================================

/** ボタンの種類 */
export enum ButtonType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
  INFO = 'info',
  GHOST = 'ghost',
  LINK = 'link',
}

/** ボタンのサイズ */
export enum ButtonSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

/** ボタンコンポーネント */
export interface Button extends UIElement {
  /** ボタンの種類 */
  type: ButtonType;
  /** サイズ */
  size: ButtonSize;
  /** テキスト */
  text: string;
  /** アイコン */
  icon?: string;
  /** アイコンの位置 */
  iconPosition?: 'left' | 'right';
  /** ローディング状態 */
  loading: boolean;
  /** クリックハンドラー */
  onClick?: () => void;
  /** ツールチップ */
  tooltip?: string;
  /** キーボードショートカット */
  shortcut?: string;
}

/** 入力フィールド */
export interface InputField extends UIElement {
  /** 入力タイプ */
  type: 'text' | 'number' | 'email' | 'password' | 'search' | 'url';
  /** 値 */
  value: string;
  /** プレースホルダー */
  placeholder?: string;
  /** 必須フィールド */
  required: boolean;
  /** 読み取り専用 */
  readonly: boolean;
  /** バリデーションエラー */
  error?: string;
  /** 変更ハンドラー */
  onChange?: (value: string) => void;
  /** バリデーション関数 */
  validator?: (value: string) => ValidationResult;
}

/** チェックボックス */
export interface Checkbox extends UIElement {
  /** チェック状態 */
  checked: boolean;
  /** ラベル */
  label: string;
  /** 中間状態 */
  indeterminate: boolean;
  /** 変更ハンドラー */
  onChange?: (checked: boolean) => void;
}

/** セレクトボックス */
export interface SelectBox extends UIElement {
  /** 選択可能な選択肢 */
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  /** 選択された値 */
  value: string | string[];
  /** 複数選択可能 */
  multiple: boolean;
  /** プレースホルダー */
  placeholder?: string;
  /** 変更ハンドラー */
  onChange?: (value: string | string[]) => void;
}

// ============================================================================
// モーダル・ダイアログ
// ============================================================================

/** モーダルの種類 */
export enum ModalType {
  DIALOG = 'dialog',
  ALERT = 'alert',
  CONFIRM = 'confirm',
  PROMPT = 'prompt',
  FULLSCREEN = 'fullscreen',
}

/** モーダルのサイズ */
export enum ModalSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large',
}

/** モーダルコンポーネント */
export interface Modal extends UIElement {
  /** モーダルの種類 */
  type: ModalType;
  /** サイズ */
  size: ModalSize;
  /** タイトル */
  title: string;
  /** コンテンツ */
  content: string | HTMLElement;
  /** 開いているかどうか */
  isOpen: boolean;
  /** 背景クリックで閉じる */
  closeOnBackdropClick: boolean;
  /** ESCキーで閉じる */
  closeOnEscape: boolean;
  /** 閉じるボタンの表示 */
  showCloseButton: boolean;
  /** アクションボタン */
  actions?: Button[];
  /** 開くハンドラー */
  onOpen?: () => void;
  /** 閉じるハンドラー */
  onClose?: () => void;
}

/** アラートダイアログ */
export interface AlertDialog extends Modal {
  /** アラートの種類 */
  alertType: 'info' | 'success' | 'warning' | 'error';
  /** メッセージ */
  message: string;
  /** 確認ハンドラー */
  onConfirm?: () => void;
}

/** 確認ダイアログ */
export interface ConfirmDialog extends Modal {
  /** メッセージ */
  message: string;
  /** 確認ボタンのテキスト */
  confirmText?: string;
  /** キャンセルボタンのテキスト */
  cancelText?: string;
  /** 確認ハンドラー */
  onConfirm?: () => void;
  /** キャンセルハンドラー */
  onCancel?: () => void;
}

// ============================================================================
// メニュー・ナビゲーション
// ============================================================================

/** メニューアイテム */
export interface MenuItem extends UIElement {
  /** ラベル */
  label: string;
  /** アイコン */
  icon?: string;
  /** キーボードショートカット */
  shortcut?: string;
  /** 子メニュー */
  children?: MenuItem[];
  /** 区切り線 */
  separator: boolean;
  /** クリックハンドラー */
  onClick?: () => void;
  /** サブメニューの展開状態 */
  expanded?: boolean;
}

/** コンテキストメニュー */
export interface ContextMenu extends UIElement {
  /** メニューアイテム */
  items: MenuItem[];
  /** 表示位置 */
  position: Point2D;
  /** ターゲット要素 */
  target?: HTMLElement | NodeId;
  /** 表示ハンドラー */
  onShow?: () => void;
  /** 非表示ハンドラー */
  onHide?: () => void;
}

/** ツールバー */
export interface Toolbar extends UIElement {
  /** ツールバーの位置 */
  position: 'top' | 'bottom' | 'left' | 'right' | 'floating';
  /** ツールグループ */
  toolGroups: ToolGroup[];
  /** 折りたたみ可能 */
  collapsible: boolean;
  /** 折りたたまれた状態 */
  collapsed: boolean;
}

/** ツールグループ */
export interface ToolGroup extends UIElement {
  /** グループ名 */
  name: string;
  /** ツール */
  tools: Tool[];
  /** 区切り線 */
  separator: boolean;
}

/** ツール */
export interface Tool extends UIElement {
  /** ツール名 */
  name: string;
  /** ラベル */
  label: string;
  /** アイコン */
  icon: string;
  /** ツールチップ */
  tooltip: string;
  /** アクティブ状態 */
  active: boolean;
  /** キーボードショートカット */
  shortcut?: string;
  /** クリックハンドラー */
  onClick?: () => void;
}

// ============================================================================
// パネル・サイドバー
// ============================================================================

/** パネルの位置 */
export enum PanelPosition {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom',
}

/** パネル */
export interface Panel extends UIElement {
  /** パネルの位置 */
  position: PanelPosition;
  /** タイトル */
  title: string;
  /** コンテンツ */
  content: string | HTMLElement;
  /** 折りたたみ可能 */
  collapsible: boolean;
  /** 折りたたまれた状態 */
  collapsed: boolean;
  /** リサイズ可能 */
  resizable: boolean;
  /** 最小幅/高さ */
  minSize: number;
  /** 最大幅/高さ */
  maxSize: number;
  /** 現在のサイズ */
  currentSize: number;
  /** リサイズハンドラー */
  onResize?: (size: number) => void;
}

/** タブパネル */
export interface TabPanel extends UIElement {
  /** タブ */
  tabs: Tab[];
  /** アクティブなタブのインデックス */
  activeTabIndex: number;
  /** タブの位置 */
  tabPosition: 'top' | 'bottom' | 'left' | 'right';
  /** タブ変更ハンドラー */
  onTabChange?: (index: number) => void;
}

/** タブ */
export interface Tab extends UIElement {
  /** ラベル */
  label: string;
  /** アイコン */
  icon?: string;
  /** コンテンツ */
  content: string | HTMLElement;
  /** 閉じることができる */
  closable: boolean;
  /** 閉じるハンドラー */
  onClose?: () => void;
}

// ============================================================================
// 通知・フィードバック
// ============================================================================

/** 通知の種類 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/** 通知 */
export interface Notification extends UIElement {
  /** 通知の種類 */
  type: NotificationType;
  /** タイトル */
  title: string;
  /** メッセージ */
  message: string;
  /** 自動で閉じる時間（ミリ秒） */
  autoCloseTime?: number;
  /** 閉じるボタンの表示 */
  showCloseButton: boolean;
  /** アクションボタン */
  actions?: Button[];
  /** 閉じるハンドラー */
  onClose?: () => void;
}

/** トースト通知システム */
export interface ToastSystem extends UIElement {
  /** 表示中の通知 */
  notifications: Notification[];
  /** 最大表示数 */
  maxNotifications: number;
  /** 表示位置 */
  position:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-center'
    | 'bottom-center';
  /** 通知を追加 */
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  /** 通知を削除 */
  removeNotification: (id: string) => void;
}

/** プログレスバー */
export interface ProgressBar extends UIElement {
  /** 進捗値（0-100） */
  value: number;
  /** 最大値 */
  max: number;
  /** 最小値 */
  min: number;
  /** 中間状態 */
  indeterminate: boolean;
  /** ラベル */
  label?: string;
  /** 進捗表示形式 */
  showPercentage: boolean;
  /** 色 */
  color?: string;
  /** ストライプ */
  striped: boolean;
  /** アニメーション */
  animated: boolean;
}

// ============================================================================
// ドラッグ&ドロップ
// ============================================================================

/** ドラッグ可能な要素 */
export interface Draggable extends UIElement {
  /** ドラッグデータ */
  dragData: any;
  /** ドラッグ中のスタイル */
  dragStyle?: Record<string, string>;
  /** ドラッグ開始ハンドラー */
  onDragStart?: (event: DragEvent) => void;
  /** ドラッグ中ハンドラー */
  onDrag?: (event: DragEvent) => void;
  /** ドラッグ終了ハンドラー */
  onDragEnd?: (event: DragEvent) => void;
}

/** ドロップ可能な要素 */
export interface Droppable extends UIElement {
  /** 受け入れ可能なデータタイプ */
  acceptedTypes: string[];
  /** ドラッグホバー中のスタイル */
  dragOverStyle?: Record<string, string>;
  /** ドラッグエンターハンドラー */
  onDragEnter?: (event: DragEvent) => void;
  /** ドラッグオーバーハンドラー */
  onDragOver?: (event: DragEvent) => void;
  /** ドラッグリーブハンドラー */
  onDragLeave?: (event: DragEvent) => void;
  /** ドロップハンドラー */
  onDrop?: (event: DragEvent, data: any) => void;
}

// ============================================================================
// フォーム・バリデーション
// ============================================================================

/** フォームフィールド */
export interface FormField extends UIElement {
  /** フィールド名 */
  name: string;
  /** ラベル */
  label: string;
  /** 値 */
  value: any;
  /** 必須フィールド */
  required: boolean;
  /** バリデーションルール */
  validationRules: ValidationRule[];
  /** エラーメッセージ */
  errorMessage?: string;
  /** ヘルプテキスト */
  helpText?: string;
  /** 変更ハンドラー */
  onChange?: (value: any) => void;
  /** ブラーハンドラー */
  onBlur?: () => void;
}

/** バリデーションルール */
export interface ValidationRule {
  /** ルール名 */
  name: string;
  /** バリデーション関数 */
  validator: (value: any) => boolean;
  /** エラーメッセージ */
  errorMessage: string;
}

/** フォーム */
export interface Form extends UIElement {
  /** フォームフィールド */
  fields: FormField[];
  /** バリデーション状態 */
  isValid: boolean;
  /** エラー */
  errors: Record<string, string>;
  /** 送信中 */
  isSubmitting: boolean;
  /** 送信ハンドラー */
  onSubmit?: (data: Record<string, any>) => void;
  /** リセットハンドラー */
  onReset?: () => void;
}

// ============================================================================
// テーマ・カスタマイゼーション
// ============================================================================

/** UIテーマ設定 */
export interface UITheme {
  /** テーマ名 */
  name: string;
  /** カラーパレット */
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    light: string;
    dark: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
  };
  /** フォント設定 */
  fonts: {
    primary: string;
    secondary: string;
    monospace: string;
    sizes: Record<string, string>;
    weights: Record<string, string>;
  };
  /** スペーシング */
  spacing: Record<string, string>;
  /** ブレークポイント */
  breakpoints: Record<string, string>;
  /** アニメーション */
  animations: Record<string, AnimationProps>;
  /** エレベーション（影） */
  elevation: Record<string, string>;
}

/** UI設定 */
export interface UISettings {
  /** テーマ */
  theme: UITheme;
  /** ダークモード */
  darkMode: boolean;
  /** 言語 */
  language: string;
  /** アニメーション有効/無効 */
  animationsEnabled: boolean;
  /** キーボードナビゲーション有効/無効 */
  keyboardNavigationEnabled: boolean;
  /** 高コントラストモード */
  highContrastMode: boolean;
  /** フォントサイズ倍率 */
  fontSizeScale: number;
  /** カスタムCSS */
  customCSS?: string;
}

// ============================================================================
// レスポンシブ・アクセシビリティ
// ============================================================================

/** ブレークポイント */
export enum Breakpoint {
  XS = 'xs', // < 640px
  SM = 'sm', // 640px - 768px
  MD = 'md', // 768px - 1024px
  LG = 'lg', // 1024px - 1280px
  XL = 'xl', // 1280px - 1536px
  XXL = '2xl', // >= 1536px
}

/** レスポンシブプロパティ */
export interface ResponsiveProps {
  /** 各ブレークポイントでの表示/非表示 */
  visibility: Partial<Record<Breakpoint, boolean>>;
  /** 各ブレークポイントでのサイズ */
  sizes: Partial<Record<Breakpoint, Size>>;
  /** 各ブレークポイントでのレイアウト */
  layouts: Partial<Record<Breakpoint, string>>;
}

/** アクセシビリティプロパティ */
export interface AccessibilityProps {
  /** ARIA ラベル */
  ariaLabel?: string;
  /** ARIA 説明 */
  ariaDescription?: string;
  /** ARIA ロール */
  role?: string;
  /** タブインデックス */
  tabIndex?: number;
  /** フォーカス可能 */
  focusable: boolean;
  /** キーボードナビゲーション対応 */
  keyboardNavigable: boolean;
  /** スクリーンリーダー対応 */
  screenReaderSupport: boolean;
  /** 高コントラスト対応 */
  highContrastSupport: boolean;
}

// ============================================================================
// エクスポート用の型ユニオン
// ============================================================================

/** UI コンポーネントの型ユニオン */
export type UIComponent =
  | Button
  | InputField
  | Checkbox
  | SelectBox
  | Modal
  | AlertDialog
  | ConfirmDialog
  | MenuItem
  | ContextMenu
  | Toolbar
  | Panel
  | TabPanel
  | Tab
  | Notification
  | ToastSystem
  | ProgressBar
  | Draggable
  | Droppable
  | FormField
  | Form;

/** UI イベントの型ユニオン */
export type UIEvent =
  | 'click'
  | 'hover'
  | 'focus'
  | 'blur'
  | 'change'
  | 'submit'
  | 'reset'
  | 'drag'
  | 'drop'
  | 'resize'
  | 'toggle'
  | 'open'
  | 'close';

/** UI状態の型ユニオン */
export type UIState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'disabled'
  | 'active'
  | 'inactive'
  | 'expanded'
  | 'collapsed';
