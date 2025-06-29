/**
 * 汎用ユーティリティ関数
 * ノードID生成、文字列操作、数値計算等の共通機能を提供
 */

import { v7 as uuidv7 } from 'uuid';
import type {
  NodeId,
  Point2D,
  Size,
  Color,
  HexColor,
  RGBAColor,
} from '../types';

// ============================================================================
// ID生成機能
// ============================================================================

/**
 * ノードID生成器
 * UUIDv7ベースの一意ID生成（時系列順序性を保持）
 */
export class IdGenerator {
  /** プレフィックス */
  private static prefix = 'node';

  /**
   * UUIDv7ベースのIDを生成（推奨）
   * 時系列順序性を保ちながら一意性を確保
   * @param prefix - プレフィックス（デフォルト: 'node'）
   * @returns 一意ID
   */
  static generateUuidV7Id(prefix: string = 'node'): NodeId {
    const uuid = uuidv7();
    return `${prefix}_${uuid}`;
  }

  /**
   * 短縮版UUIDv7（最初の8文字のみ使用）
   * 短いIDが必要な場合に使用
   * @param prefix - プレフィックス（デフォルト: 'node'）
   * @returns 短縮版一意ID
   */
  static generateShortUuidV7Id(prefix: string = 'node'): NodeId {
    const uuid = uuidv7();
    const shortUuid = uuid.substring(0, 8);
    return `${prefix}_${shortUuid}`;
  }

  /**
   * プレフィックスなしのピュアUUIDv7
   * 外部システムとの互換性が必要な場合に使用
   * @returns ピュアUUIDv7
   */
  static generatePureUuidV7(): NodeId {
    return uuidv7();
  }

  /**
   * 連番ベースのIDを生成（レガシー・デバッグ用）
   * @param prefix - プレフィックス（デフォルト: 'node'）
   * @returns 一意ID
   */
  static generateSequentialId(prefix: string = 'node'): NodeId {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_seq_${timestamp}_${random}`;
  }

  /**
   * デフォルトプレフィックスを設定
   * @param prefix - 新しいプレフィックス
   */
  static setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  /**
   * デフォルト設定でIDを生成（UUIDv7使用）
   * @returns 一意ID
   */
  static generate(): NodeId {
    return this.generateUuidV7Id(this.prefix);
  }

  /**
   * UUIDv7かどうかを判定
   * @param id - 検証対象のID
   * @returns UUIDv7形式かどうか
   */
  static isUuidV7Format(id: string): boolean {
    // UUIDv7の基本形式チェック
    const uuidV7Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    // プレフィックス付きかピュアかをチェック
    if (uuidV7Regex.test(id)) {
      return true; // ピュアUUIDv7
    }

    // プレフィックス付きの場合
    const parts = id.split('_');
    if (parts.length >= 2) {
      const uuidPart = parts[parts.length - 1];
      return uuidPart ? uuidV7Regex.test(uuidPart) : false;
    }

    return false;
  }

  /**
   * IDからタイムスタンプを抽出（UUIDv7の場合）
   * @param id - 対象ID
   * @returns タイムスタンプ（ミリ秒）またはnull
   */
  static extractTimestamp(id: string): number | null {
    if (!this.isUuidV7Format(id)) {
      return null;
    }

    let uuidPart = id;
    if (id.includes('_')) {
      const parts = id.split('_');
      const lastPart = parts[parts.length - 1];
      if (!lastPart) return null;
      uuidPart = lastPart;
    }

    try {
      // UUIDv7の最初の48ビットがタイムスタンプ
      const timestampHex = uuidPart.substring(0, 8) + uuidPart.substring(9, 13);
      const timestamp = parseInt(timestampHex, 16);
      return timestamp;
    } catch {
      return null;
    }
  }
}

// ============================================================================
// 文字列操作ユーティリティ
// ============================================================================

/**
 * 文字列をトランケート（切り詰め）
 * @param text - 対象文字列
 * @param maxLength - 最大長
 * @param suffix - 切り詰め時の接尾辞
 * @returns 切り詰め後の文字列
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * 文字列をサニタイズ（HTMLエスケープ）
 * @param text - 対象文字列
 * @returns エスケープ後の文字列
 */
export function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 文字列から安全なCSSクラス名を生成
 * @param text - 対象文字列
 * @returns CSS クラス名
 */
export function textToCssClass(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * 文字列をキャメルケースに変換
 * @param text - 対象文字列
 * @returns キャメルケース文字列
 */
export function toCamelCase(text: string): string {
  return text.replace(/[-_\s]+(.)?/g, (_, char) =>
    char ? char.toUpperCase() : ''
  );
}

/**
 * 文字列をケバブケースに変換
 * @param text - 対象文字列
 * @returns ケバブケース文字列
 */
export function toKebabCase(text: string): string {
  return text
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// ============================================================================
// 数値・座標計算ユーティリティ
// ============================================================================

/**
 * 2つの点の距離を計算
 * @param point1 - 点1
 * @param point2 - 点2
 * @returns 距離
 */
export function calculateDistance(point1: Point2D, point2: Point2D): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 角度（ラジアン）を度に変換
 * @param radians - ラジアン
 * @returns 度
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * 角度（度）をラジアンに変換
 * @param degrees - 度
 * @returns ラジアン
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 2つの点の中点を計算
 * @param point1 - 点1
 * @param point2 - 点2
 * @returns 中点
 */
export function calculateMidpoint(point1: Point2D, point2: Point2D): Point2D {
  return {
    x: (point1.x + point2.x) / 2,
    y: (point1.y + point2.y) / 2,
  };
}

/**
 * 点を回転
 * @param point - 対象点
 * @param center - 回転中心
 * @param angle - 回転角度（ラジアン）
 * @returns 回転後の点
 */
export function rotatePoint(
  point: Point2D,
  center: Point2D,
  angle: number
): Point2D {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/**
 * 値を指定範囲内にクランプ
 * @param value - 対象値
 * @param min - 最小値
 * @param max - 最大値
 * @returns クランプ後の値
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * 線形補間
 * @param start - 開始値
 * @param end - 終了値
 * @param t - 補間係数（0-1）
 * @returns 補間値
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * 値を指定範囲から別の範囲にマップ
 * @param value - 対象値
 * @param fromMin - 元の範囲の最小値
 * @param fromMax - 元の範囲の最大値
 * @param toMin - 新しい範囲の最小値
 * @param toMax - 新しい範囲の最大値
 * @returns マップ後の値
 */
export function mapRange(
  value: number,
  fromMin: number,
  fromMax: number,
  toMin: number,
  toMax: number
): number {
  const normalized = (value - fromMin) / (fromMax - fromMin);
  return toMin + normalized * (toMax - toMin);
}

// ============================================================================
// 色操作ユーティリティ
// ============================================================================

/**
 * HEX色をRGBA色に変換
 * @param hex - HEX色文字列
 * @param alpha - 透明度（デフォルト: 1）
 * @returns RGBA色
 */
export function hexToRgba(hex: HexColor, alpha: number = 1): RGBAColor {
  // #を除去
  const cleanHex = hex.replace('#', '');

  // 3桁の場合は6桁に展開
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split('')
          .map(char => char + char)
          .join('')
      : cleanHex;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  return { r, g, b, a: clamp(alpha, 0, 1) };
}

/**
 * RGBA色をHEX色に変換
 * @param rgba - RGBA色
 * @returns HEX色文字列
 */
export function rgbaToHex(rgba: RGBAColor): HexColor {
  const toHex = (value: number) => {
    const hex = Math.round(clamp(value, 0, 255)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;
}

/**
 * 色を明るくする
 * @param color - 元の色（HEXまたはRGBA）
 * @param amount - 明度変更量（0-1）
 * @returns 明るくした色
 */
export function lightenColor(color: Color, amount: number): Color {
  if (typeof color === 'string') {
    const rgba = hexToRgba(color);
    const lightened = {
      r: Math.min(255, rgba.r + amount * 255),
      g: Math.min(255, rgba.g + amount * 255),
      b: Math.min(255, rgba.b + amount * 255),
      a: rgba.a,
    };
    return rgbaToHex(lightened);
  } else {
    return {
      r: Math.min(255, color.r + amount * 255),
      g: Math.min(255, color.g + amount * 255),
      b: Math.min(255, color.b + amount * 255),
      a: color.a,
    };
  }
}

/**
 * 色を暗くする
 * @param color - 元の色（HEXまたはRGBA）
 * @param amount - 暗度変更量（0-1）
 * @returns 暗くした色
 */
export function darkenColor(color: Color, amount: number): Color {
  if (typeof color === 'string') {
    const rgba = hexToRgba(color);
    const darkened = {
      r: Math.max(0, rgba.r - amount * 255),
      g: Math.max(0, rgba.g - amount * 255),
      b: Math.max(0, rgba.b - amount * 255),
      a: rgba.a,
    };
    return rgbaToHex(darkened);
  } else {
    return {
      r: Math.max(0, color.r - amount * 255),
      g: Math.max(0, color.g - amount * 255),
      b: Math.max(0, color.b - amount * 255),
      a: color.a,
    };
  }
}

/**
 * ランダムな色を生成
 * @param alpha - 透明度（デフォルト: 1）
 * @returns ランダムなHEX色
 */
export function generateRandomColor(alpha: number = 1): HexColor {
  const rgba: RGBAColor = {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
    a: alpha,
  };
  return rgbaToHex(rgba);
}

// ============================================================================
// 配列操作ユーティリティ
// ============================================================================

/**
 * 配列をシャッフル（Fisher-Yates アルゴリズム）
 * @param array - 対象配列
 * @returns シャッフル後の新しい配列
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 配列から重複を除去
 * @param array - 対象配列
 * @param keyFn - 比較キー関数（オプション）
 * @returns 重複除去後の配列
 */
export function uniqueArray<T>(array: T[], keyFn?: (item: T) => any): T[] {
  if (!keyFn) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * 配列をチャンクに分割
 * @param array - 対象配列
 * @param size - チャンクサイズ
 * @returns チャンク配列
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// オブジェクト操作ユーティリティ
// ============================================================================

/**
 * オブジェクトの深いコピー（JSONシリアライゼーション方式）
 * @param obj - 対象オブジェクト
 * @returns 深いコピー
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * オブジェクトの特定パスの値を取得
 * @param obj - 対象オブジェクト
 * @param path - パス（ドット記法）
 * @param defaultValue - デフォルト値
 * @returns 値
 */
export function getNestedValue(
  obj: any,
  path: string,
  defaultValue?: any
): any {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return defaultValue;
    }
  }

  return current;
}

/**
 * オブジェクトの特定パスに値を設定
 * @param obj - 対象オブジェクト
 * @param path - パス（ドット記法）
 * @param value - 設定値
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[keys[keys.length - 1]] = value;
}

// ============================================================================
// デバウンス・スロットリング
// ============================================================================

/**
 * デバウンス関数
 * @param func - 対象関数
 * @param delay - 遅延時間（ミリ秒）
 * @returns デバウンス化された関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * スロットリング関数
 * @param func - 対象関数
 * @param limit - 制限時間（ミリ秒）
 * @returns スロットリング化された関数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// ブラウザ・DOM関連ユーティリティ
// ============================================================================

/**
 * 要素がビューポート内にあるかチェック
 * @param element - 対象要素
 * @returns ビューポート内かどうか
 */
export function isElementInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * ファイルサイズを人間が読みやすい形式に変換
 * @param bytes - バイト数
 * @param decimals - 小数点以下桁数
 * @returns フォーマット済み文字列
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * ローカルストレージのサポートチェック
 * @returns ローカルストレージが利用可能かどうか
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// 型ガード関数
// ============================================================================

/**
 * オブジェクトかどうかをチェック
 * @param value - チェック対象
 * @returns オブジェクトかどうか
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * 空のオブジェクトかどうかをチェック
 * @param obj - チェック対象
 * @returns 空のオブジェクトかどうか
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (isObject(obj)) return Object.keys(obj).length === 0;
  return false;
}

/**
 * 有効なPoint2Dかどうかをチェック
 * @param value - チェック対象
 * @returns Point2Dかどうか
 */
export function isValidPoint2D(value: any): value is Point2D {
  return (
    isObject(value) &&
    typeof value.x === 'number' &&
    typeof value.y === 'number' &&
    !isNaN(value.x) &&
    !isNaN(value.y)
  );
}

/**
 * 有効なSizeかどうかをチェック
 * @param value - チェック対象
 * @returns Sizeかどうか
 */
export function isValidSize(value: any): value is Size {
  return (
    isObject(value) &&
    typeof value.width === 'number' &&
    typeof value.height === 'number' &&
    !isNaN(value.width) &&
    !isNaN(value.height) &&
    value.width >= 0 &&
    value.height >= 0
  );
}

/**
 * 有効なHEX色かどうかをチェック
 * @param value - チェック対象
 * @returns HEX色かどうか
 */
export function isValidHexColor(value: any): value is HexColor {
  return (
    typeof value === 'string' &&
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
  );
}

// ============================================================================
// 便利な定数とデフォルト値
// ============================================================================

/** よく使用される色のパレット */
export const COLOR_PALETTE = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4',
  LIGHT: '#F8FAFC',
  DARK: '#1F2937',
} as const;

/** デフォルトのポイント */
export const DEFAULT_POINT: Point2D = { x: 0, y: 0 };

/** デフォルトのサイズ */
export const DEFAULT_SIZE: Size = { width: 100, height: 50 };

/** アニメーション関連の定数 */
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
} as const;
