/**
 * バリデーション機能とTypeScript型ガード実装
 *
 * 実行時型安全性を確保するための包括的なバリデーション機能。
 * TypeScript の strict モードに準拠し、型ガードパターンを活用。
 */

import type {
  MindMapNode,
  NodeId,
  Point2D,
  Size,
  NodeStyle,
  Rectangle,
  MindMapViewport,
  MindMap,
} from '../types';
import { IdGenerator } from './helpers';

// バリデーター専用の型エイリアス
type Position = Point2D;
type Point = Point2D;
type ViewportState = MindMapViewport;
type MindMapData = MindMap;

// TreeNode 型の独自定義（簡略化版）
interface TreeNode {
  node: MindMapNode;
  children: TreeNode[];
  parent: TreeNode | null;
}

// =============================================================================
// 基本型ガード
// =============================================================================

/**
 * 値が定義されているかチェック（null, undefined を除外）
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * 値が文字列かチェック
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * 値が数値かチェック（NaN を除外）
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * 値が正の数値かチェック
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * 値が非負の数値かチェック
 */
export function isNonNegativeNumber(value: unknown): value is number {
  return isNumber(value) && value >= 0;
}

/**
 * 値がブール値かチェック
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * 値がオブジェクトかチェック（null, array を除外）
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * 値が配列かチェック
 */
export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

/**
 * 値が空でない文字列かチェック
 */
export function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

/**
 * 値が有効なUUID v7かチェック
 */
export function isValidUuidV7(value: unknown): value is string {
  if (!isString(value)) return false;
  return IdGenerator.isUuidV7Format(value);
}

/**
 * 値が有効なUUIDかチェック（レガシー対応）
 */
export function isValidUUID(value: unknown): value is string {
  if (!isString(value)) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * 値が有効なnanoIDかチェック
 */
export function isValidNanoId(value: unknown): value is string {
  if (!isString(value)) return false;
  // nanoID の一般的なフォーマット: 21文字、URL-safeな文字
  const nanoIdRegex = /^[A-Za-z0-9_-]{21}$/;
  return nanoIdRegex.test(value);
}

/**
 * 値が有効なNodeIDかチェック（UUIDv7ベース）
 */
export function isValidNodeId(value: unknown): value is NodeId {
  return isValidUuidV7(value);
}

// =============================================================================
// 位置・サイズ関連型ガード
// =============================================================================

/**
 * 値がPosition型かチェック
 */
export function isPosition(value: unknown): value is Position {
  return (
    isObject(value) &&
    'x' in value &&
    'y' in value &&
    isNumber(value.x) &&
    isNumber(value.y)
  );
}

/**
 * 値がSize型かチェック
 */
export function isSize(value: unknown): value is Size {
  return (
    isObject(value) &&
    'width' in value &&
    'height' in value &&
    isNonNegativeNumber(value.width) &&
    isNonNegativeNumber(value.height)
  );
}

/**
 * 値がPoint型かチェック
 */
export function isPoint(value: unknown): value is Point {
  return isPosition(value); // Point は Position のエイリアス
}

/**
 * 値がRectangle型かチェック
 */
export function isRectangle(value: unknown): value is Rectangle {
  return (
    isObject(value) &&
    'x' in value &&
    'y' in value &&
    'width' in value &&
    'height' in value &&
    isNumber(value.x) &&
    isNumber(value.y) &&
    isNonNegativeNumber(value.width) &&
    isNonNegativeNumber(value.height)
  );
}

// =============================================================================
// ノード関連型ガード
// =============================================================================

/**
 * 値がNodeStyle型かチェック
 */
export function isNodeStyle(value: unknown): value is NodeStyle {
  if (!isObject(value)) return false;

  const style = value as Record<string, unknown>;

  // 必須プロパティのチェック
  if (!('backgroundColor' in style) || !isString(style.backgroundColor))
    return false;
  if (!('textColor' in style) || !isString(style.textColor)) return false;
  if (!('fontSize' in style) || !isPositiveNumber(style.fontSize)) return false;

  // オプショナルプロパティのチェック
  if ('borderColor' in style && !isString(style.borderColor)) return false;
  if ('borderWidth' in style && !isNonNegativeNumber(style.borderWidth))
    return false;
  if ('borderRadius' in style && !isNonNegativeNumber(style.borderRadius))
    return false;
  if ('fontFamily' in style && !isString(style.fontFamily)) return false;
  if ('fontWeight' in style && !isString(style.fontWeight)) return false;
  if (
    'opacity' in style &&
    !(isNumber(style.opacity) && style.opacity >= 0 && style.opacity <= 1)
  )
    return false;

  return true;
}

/**
 * 値がMindMapNode型かチェック
 */
export function isMindMapNode(value: unknown): value is MindMapNode {
  if (!isObject(value)) return false;

  const node = value as Record<string, unknown>;

  // 必須プロパティのチェック
  if (!('id' in node) || !isValidNodeId(node.id)) return false;
  if (!('text' in node) || !isString(node.text)) return false;
  if (!('childrenIds' in node) || !isArray<NodeId>(node.childrenIds))
    return false;
  if (!('createdAt' in node) || !(node.createdAt instanceof Date)) return false;
  if (!('updatedAt' in node) || !(node.updatedAt instanceof Date)) return false;
  if (!('style' in node) || !isNodeStyle(node.style)) return false;
  if (!('layout' in node) || !isObject(node.layout)) return false;
  if (!('state' in node) || !isObject(node.state)) return false;
  if (!('metadata' in node) || !isObject(node.metadata)) return false;

  // オプショナルプロパティのチェック
  if (
    'parentId' in node &&
    node.parentId !== null &&
    !isValidNodeId(node.parentId)
  )
    return false;

  // childrenIds配列の要素が全てNodeIdかチェック
  const childrenIds = node.childrenIds as unknown[];
  if (!childrenIds.every(child => isValidNodeId(child))) return false;

  return true;
}

/**
 * 値がTreeNode型かチェック
 */
export function isTreeNode(value: unknown): value is TreeNode {
  if (!isObject(value)) return false;

  const treeNode = value as Record<string, unknown>;

  // 必須プロパティのチェック
  if (!('node' in treeNode) || !isMindMapNode(treeNode.node)) return false;
  if (!('children' in treeNode) || !isArray<TreeNode>(treeNode.children))
    return false;

  // オプショナルプロパティのチェック
  if (
    'parent' in treeNode &&
    treeNode.parent !== null &&
    !isTreeNode(treeNode.parent)
  )
    return false;

  // children配列の要素が全てTreeNodeかチェック
  const children = treeNode.children as unknown[];
  if (!children.every(child => isTreeNode(child))) return false;

  return true;
}

// =============================================================================
// マインドマップデータ型ガード
// =============================================================================

/**
 * 値がViewportState型かチェック
 */
export function isViewportState(value: unknown): value is ViewportState {
  if (!isObject(value)) return false;

  const viewport = value as Record<string, unknown>;

  // 必須プロパティのチェック
  if (!('zoom' in viewport) || !isPositiveNumber(viewport.zoom)) return false;
  if (!('centerX' in viewport) || !isNumber(viewport.centerX)) return false;
  if (!('centerY' in viewport) || !isNumber(viewport.centerY)) return false;

  return true;
}

/**
 * 値がMindMapData型かチェック
 */
export function isMindMapData(value: unknown): value is MindMapData {
  if (!isObject(value)) return false;

  const data = value as Record<string, unknown>;

  // 必須プロパティのチェック
  if (!('nodes' in data) || !isObject(data.nodes)) return false;
  if (!('rootNodeId' in data) || !isValidNodeId(data.rootNodeId)) return false;
  if (!('title' in data) || !isString(data.title)) return false;
  if (!('createdAt' in data) || !(data.createdAt instanceof Date)) return false;
  if (!('updatedAt' in data) || !(data.updatedAt instanceof Date)) return false;

  // オプショナルプロパティのチェック
  if (
    'description' in data &&
    data.description !== null &&
    !isString(data.description)
  )
    return false;
  if (
    'viewport' in data &&
    data.viewport !== null &&
    !isViewportState(data.viewport)
  )
    return false;

  // nodes オブジェクトの各プロパティがMindMapNodeかチェック
  const nodes = data.nodes as Record<string, unknown>;
  for (const [nodeId, node] of Object.entries(nodes)) {
    if (!isValidNodeId(nodeId) || !isMindMapNode(node)) return false;
  }

  // rootNodeId が nodes に存在するかチェック
  if (!(data.rootNodeId in nodes)) return false;

  return true;
}

// =============================================================================
// カスタムバリデーション関数
// =============================================================================

/**
 * ノードの階層構造が正しいかチェック
 */
export function validateNodeHierarchy(
  nodes: Record<NodeId, MindMapNode>,
  rootNodeId: NodeId
): boolean {
  if (!(rootNodeId in nodes)) return false;

  const visited = new Set<NodeId>();
  const stack: NodeId[] = [rootNodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;

    if (visited.has(currentId)) {
      // 循環参照を検出
      return false;
    }

    visited.add(currentId);
    const currentNode = nodes[currentId];

    if (!currentNode) return false;

    // 子ノードの存在チェック
    for (const childId of currentNode.childrenIds) {
      if (!(childId in nodes)) return false;

      const childNode = nodes[childId];
      if (!childNode || childNode.parentId !== currentId) return false;

      stack.push(childId);
    }
  }

  return true;
}

/**
 * ノードの位置が妥当な範囲内かチェック
 */
export function validateNodePosition(
  position: Position,
  bounds?: Rectangle
): boolean {
  if (!isPosition(position)) return false;

  if (bounds) {
    return (
      position.x >= bounds.x &&
      position.y >= bounds.y &&
      position.x <= bounds.x + bounds.width &&
      position.y <= bounds.y + bounds.height
    );
  }

  // 基本的な範囲チェック（-10000 〜 10000の範囲）
  return (
    position.x >= -10000 &&
    position.x <= 10000 &&
    position.y >= -10000 &&
    position.y <= 10000
  );
}

/**
 * 色の値が有効かチェック（hex, rgb, rgba, css名前付き色）
 */
export function validateColor(color: string): boolean {
  if (!isString(color)) return false;

  // Hex形式
  const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  if (hexRegex.test(color)) return true;

  // RGB形式
  const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
  const rgbMatch = color.match(rgbRegex);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return [r, g, b].every(val => {
      if (!val) return false;
      const num = parseInt(val, 10);
      return num >= 0 && num <= 255;
    });
  }

  // RGBA形式
  const rgbaRegex =
    /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
  const rgbaMatch = color.match(rgbaRegex);
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch;
    return (
      [r, g, b].every(val => {
        if (!val) return false;
        const num = parseInt(val, 10);
        return num >= 0 && num <= 255;
      }) &&
      a !== undefined &&
      parseFloat(a) >= 0 &&
      parseFloat(a) <= 1
    );
  }

  // CSS名前付き色（一部）
  const namedColors = [
    'transparent',
    'black',
    'white',
    'red',
    'green',
    'blue',
    'yellow',
    'cyan',
    'magenta',
    'gray',
    'grey',
    'darkgray',
    'darkgrey',
    'lightgray',
    'lightgrey',
    'orange',
    'purple',
    'brown',
    'pink',
    'lime',
    'navy',
    'teal',
    'aqua',
    'fuchsia',
    'silver',
    'maroon',
    'olive',
  ];

  return namedColors.includes(color.toLowerCase());
}

/**
 * ファイル名が有効かチェック
 */
export function validateFileName(fileName: string): boolean {
  if (!isNonEmptyString(fileName)) return false;

  // 不正な文字のチェック
  const invalidCharsRegex = /[<>:"/\\|?*]/;
  if (invalidCharsRegex.test(fileName)) return false;

  // 予約語のチェック（Windows）
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];
  const splitResult = fileName.split('.');
  if (splitResult.length === 0) return false;
  const nameWithoutExt = splitResult[0]?.toUpperCase() ?? '';
  if (reservedNames.includes(nameWithoutExt)) return false;

  // 長さのチェック
  return fileName.length <= 255;
}

// =============================================================================
// エクスポート用バリデーション関数オブジェクト
// =============================================================================

/**
 * バリデーション関数を整理したオブジェクト
 */
export const validators = {
  // 基本型ガード
  isDefined,
  isString,
  isNumber,
  isPositiveNumber,
  isNonNegativeNumber,
  isBoolean,
  isObject,
  isArray,
  isNonEmptyString,
  isValidUuidV7,
  isValidUUID,
  isValidNanoId,
  isValidNodeId,

  // 位置・サイズ関連
  isPosition,
  isSize,
  isPoint,
  isRectangle,

  // ノード関連
  isNodeStyle,
  isMindMapNode,
  isTreeNode,

  // マインドマップデータ
  isViewportState,
  isMindMapData,

  // カスタムバリデーション
  validateNodeHierarchy,
  validateNodePosition,
  validateColor,
  validateFileName,
} as const;

/**
 * デフォルトエクスポート
 */
export default validators;
