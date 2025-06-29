/**
 * マインドマップデータモデルの実装
 * ノードとツリー構造の管理、データの整合性保証を行う
 */

import type {
  NodeId,
  MindMapNode,
  MindMapSettings,
  MindMapViewport,
  MindMap,
  CreateNodeData,
  UpdateNodeData,
  NodeMoveData,
  NodeCloneData,
  ValidationResult,
} from '../types';
import {
  DEFAULT_NODE_STYLE,
  DEFAULT_NODE_LAYOUT,
  DEFAULT_NODE_STATE,
  DEFAULT_NODE_METADATA,
  NodeEventType,
  MindMapEventType,
} from '../types';
import { EventEmitter } from './event-emitter';
import { IdGenerator } from '../utils/helpers';

// ============================================================================
// ノードファクトリー
// ============================================================================

/**
 * ノード作成のためのファクトリークラス
 * デフォルト値の適用と一意ID生成を担当
 */
export class NodeFactory {
  /**
   * 一意なノードIDを生成（UUIDv7ベース）
   * @returns 一意のノードID
   */
  static generateId(): NodeId {
    return IdGenerator.generateUuidV7Id('node');
  }

  /**
   * 新しいノードを作成
   * @param data - ノード作成データ
   * @param parentId - 親ノードID
   * @returns 作成されたノード
   */
  static createNode(
    data: CreateNodeData,
    parentId: NodeId | null = null
  ): MindMapNode {
    const now = new Date();
    const nodeId = this.generateId();

    return {
      id: nodeId,
      createdAt: now,
      updatedAt: now,
      text: data.text || 'New Node',
      parentId: data.parentId || parentId,
      childrenIds: [],
      style: { ...DEFAULT_NODE_STYLE, ...data.style },
      layout: {
        ...DEFAULT_NODE_LAYOUT,
        position: data.position || DEFAULT_NODE_LAYOUT.position,
      },
      state: { ...DEFAULT_NODE_STATE },
      metadata: { ...DEFAULT_NODE_METADATA },
    };
  }

  /**
   * ルートノードを作成
   * @param title - ルートノードのタイトル
   * @returns 作成されたルートノード
   */
  static createRootNode(title: string = 'Root Node'): MindMapNode {
    return this.createNode({
      text: title,
      parentId: null,
      position: { x: 0, y: 0 },
    });
  }
}

// ============================================================================
// ツリー構造管理クラス
// ============================================================================

/**
 * マインドマップのツリー構造を管理するクラス
 * ノードの親子関係、整合性チェック、操作の安全性を保証
 */
export class TreeStructureManager {
  /** ノードマップ */
  private nodes: Map<NodeId, MindMapNode> = new Map();

  /** ルートノードID */
  private rootNodeId: NodeId | null = null;

  /** イベントエミッター */
  private emitter: EventEmitter;

  /**
   * コンストラクタ
   * @param emitter - イベントエミッター（オプション）
   */
  constructor(emitter?: EventEmitter) {
    this.emitter = emitter || new EventEmitter();
  }

  // ============================================================================
  // ノード管理
  // ============================================================================

  /**
   * ノードを追加
   * @param node - 追加するノード
   */
  addNode(node: MindMapNode): void {
    // 重複チェック
    if (this.nodes.has(node.id)) {
      throw new Error(`Node with ID ${node.id} already exists`);
    }

    // 親ノードの存在チェック
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (!parent) {
        throw new Error(`Parent node ${node.parentId} not found`);
      }

      // 親ノードの子リストに追加
      if (!parent.childrenIds.includes(node.id)) {
        parent.childrenIds.push(node.id);
        parent.updatedAt = new Date();
      }
    } else {
      // ルートノードの設定
      if (this.rootNodeId && this.rootNodeId !== node.id) {
        throw new Error('Root node already exists');
      }
      this.rootNodeId = node.id;
    }

    this.nodes.set(node.id, node);
    this.emitter.emit(NodeEventType.NODE_CREATED, { node });
  }

  /**
   * ノードを取得
   * @param nodeId - ノードID
   * @returns ノード（存在しない場合はundefined）
   */
  getNode(nodeId: NodeId): MindMapNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * ノードを更新
   * @param nodeId - ノードID
   * @param updates - 更新データ
   */
  updateNode(nodeId: NodeId, updates: UpdateNodeData): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const previousNode = { ...node };
    const updatedNode: MindMapNode = {
      ...node,
      updatedAt: new Date(),
      text: updates.text !== undefined ? updates.text : node.text,
      style: updates.style ? { ...node.style, ...updates.style } : node.style,
      layout: updates.layout
        ? { ...node.layout, ...updates.layout }
        : node.layout,
      state: updates.state ? { ...node.state, ...updates.state } : node.state,
      metadata: updates.metadata
        ? { ...node.metadata, ...updates.metadata }
        : node.metadata,
    };

    this.nodes.set(nodeId, updatedNode);
    this.emitter.emit(NodeEventType.NODE_UPDATED, {
      node: updatedNode,
      previousValue: previousNode,
      newValue: updatedNode,
    });
  }

  /**
   * ノードを削除
   * @param nodeId - 削除するノードID
   * @param deleteChildren - 子ノードも削除するか
   */
  deleteNode(nodeId: NodeId, deleteChildren: boolean = true): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // ルートノードの削除チェック
    if (nodeId === this.rootNodeId) {
      throw new Error('Cannot delete root node');
    }

    // 子ノードの処理
    if (deleteChildren) {
      // 子ノードを再帰的に削除
      for (const childId of node.childrenIds) {
        this.deleteNode(childId, true);
      }
    } else {
      // 子ノードを親の兄弟として移動
      const parent = node.parentId ? this.nodes.get(node.parentId) : null;
      if (parent) {
        for (const childId of node.childrenIds) {
          const child = this.nodes.get(childId);
          if (child) {
            child.parentId = parent.id;
            parent.childrenIds.push(childId);
          }
        }
      }
    }

    // 親ノードの子リストから削除
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent) {
        const index = parent.childrenIds.indexOf(nodeId);
        if (index !== -1) {
          parent.childrenIds.splice(index, 1);
          parent.updatedAt = new Date();
        }
      }
    }

    this.nodes.delete(nodeId);
    this.emitter.emit(NodeEventType.NODE_DELETED, { node });
  }

  // ============================================================================
  // ツリー構造操作
  // ============================================================================

  /**
   * ノードを移動
   * @param moveData - 移動データ
   */
  moveNode(moveData: NodeMoveData): void {
    const { nodeId, newParentId, newIndex } = moveData;
    const node = this.nodes.get(nodeId);

    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // 循環参照チェック
    if (newParentId && this.wouldCreateCycle(nodeId, newParentId)) {
      throw new Error('Move would create a cycle');
    }

    // 現在の親から削除
    if (node.parentId) {
      const currentParent = this.nodes.get(node.parentId);
      if (currentParent) {
        const index = currentParent.childrenIds.indexOf(nodeId);
        if (index !== -1) {
          currentParent.childrenIds.splice(index, 1);
          currentParent.updatedAt = new Date();
        }
      }
    }

    // 新しい親に追加
    node.parentId = newParentId;
    if (newParentId) {
      const newParent = this.nodes.get(newParentId);
      if (!newParent) {
        throw new Error(`New parent ${newParentId} not found`);
      }

      if (typeof newIndex === 'number') {
        newParent.childrenIds.splice(newIndex, 0, nodeId);
      } else {
        newParent.childrenIds.push(nodeId);
      }
      newParent.updatedAt = new Date();
    }

    node.updatedAt = new Date();
    this.emitter.emit(NodeEventType.NODE_MOVED, moveData);
  }

  /**
   * ノードをクローン
   * @param cloneData - クローンデータ
   * @returns クローンされたノード
   */
  cloneNode(cloneData: NodeCloneData): MindMapNode {
    const { sourceNodeId, targetParentId, includeChildren = true } = cloneData;
    const sourceNode = this.nodes.get(sourceNodeId);

    if (!sourceNode) {
      throw new Error(`Source node ${sourceNodeId} not found`);
    }

    // ノードをクローン
    const clonedNode = this.cloneNodeRecursive(
      sourceNode,
      targetParentId,
      includeChildren
    );

    this.emitter.emit(NodeEventType.NODE_CREATED, {
      node: clonedNode,
    });

    return clonedNode;
  }

  // ============================================================================
  // ツリー情報取得
  // ============================================================================

  /**
   * ルートノードを取得
   * @returns ルートノード
   */
  getRootNode(): MindMapNode | undefined {
    return this.rootNodeId ? this.nodes.get(this.rootNodeId) : undefined;
  }

  /**
   * 子ノードを取得
   * @param parentId - 親ノードID
   * @returns 子ノードの配列
   */
  getChildren(parentId: NodeId): MindMapNode[] {
    const parent = this.nodes.get(parentId);
    if (!parent) return [];

    return parent.childrenIds
      .map(id => this.nodes.get(id))
      .filter((node): node is MindMapNode => node !== undefined);
  }

  /**
   * 親ノードを取得
   * @param nodeId - ノードID
   * @returns 親ノード
   */
  getParent(nodeId: NodeId): MindMapNode | undefined {
    const node = this.nodes.get(nodeId);
    return node?.parentId ? this.nodes.get(node.parentId) : undefined;
  }

  /**
   * 兄弟ノードを取得
   * @param nodeId - ノードID
   * @returns 兄弟ノードの配列
   */
  getSiblings(nodeId: NodeId): MindMapNode[] {
    const node = this.nodes.get(nodeId);
    if (!node?.parentId) return [];

    return this.getChildren(node.parentId).filter(
      sibling => sibling.id !== nodeId
    );
  }

  /**
   * ノードのパスを取得（ルートから指定ノードまで）
   * @param nodeId - ノードID
   * @returns ノードのパス
   */
  getNodePath(nodeId: NodeId): MindMapNode[] {
    const path: MindMapNode[] = [];
    let currentNode = this.nodes.get(nodeId);

    while (currentNode) {
      path.unshift(currentNode);
      currentNode = currentNode.parentId
        ? this.nodes.get(currentNode.parentId)
        : undefined;
    }

    return path;
  }

  /**
   * 全ノードを取得
   * @returns 全ノードの配列
   */
  getAllNodes(): MindMapNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * ノード数を取得
   * @returns ノード数
   */
  getNodeCount(): number {
    return this.nodes.size;
  }

  // ============================================================================
  // バリデーション
  // ============================================================================

  /**
   * ツリー構造の整合性をチェック
   * @returns バリデーション結果
   */
  validateTreeStructure(): ValidationResult {
    const errors: string[] = [];

    // ルートノードの存在チェック
    if (!this.rootNodeId || !this.nodes.has(this.rootNodeId)) {
      errors.push('Root node not found');
    }

    // 各ノードの整合性チェック
    for (const node of this.nodes.values()) {
      // 親ノードの存在チェック
      if (node.parentId && !this.nodes.has(node.parentId)) {
        errors.push(
          `Parent node ${node.parentId} not found for node ${node.id}`
        );
      }

      // 子ノードの存在チェック
      for (const childId of node.childrenIds) {
        if (!this.nodes.has(childId)) {
          errors.push(`Child node ${childId} not found for node ${node.id}`);
        } else {
          // 子ノードの親参照チェック
          const child = this.nodes.get(childId);
          if (child && child.parentId !== node.id) {
            errors.push(`Child node ${childId} has incorrect parent reference`);
          }
        }
      }

      // 循環参照チェック
      if (this.hasCircularReference(node.id)) {
        errors.push(`Circular reference detected for node ${node.id}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  /**
   * 循環参照をチェック
   * @param nodeId - チェックするノードID
   * @param visited - 訪問済みノードID
   * @returns 循環参照が存在するか
   */
  private hasCircularReference(
    nodeId: NodeId,
    visited: Set<NodeId> = new Set()
  ): boolean {
    if (visited.has(nodeId)) {
      return true;
    }

    visited.add(nodeId);
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    for (const childId of node.childrenIds) {
      if (this.hasCircularReference(childId, new Set(visited))) {
        return true;
      }
    }

    return false;
  }

  /**
   * 移動が循環参照を引き起こすかチェック
   * @param nodeId - 移動するノードID
   * @param newParentId - 新しい親ノードID
   * @returns 循環参照を引き起こすか
   */
  private wouldCreateCycle(nodeId: NodeId, newParentId: NodeId): boolean {
    // 自分自身を親にしようとした場合
    if (nodeId === newParentId) {
      return true;
    }

    // 新しい親が自分の子孫かチェック
    const descendants = this.getDescendants(nodeId);
    return descendants.some(descendant => descendant.id === newParentId);
  }

  /**
   * ノードの子孫を取得
   * @param nodeId - ノードID
   * @returns 子孫ノードの配列
   */
  private getDescendants(nodeId: NodeId): MindMapNode[] {
    const descendants: MindMapNode[] = [];
    const children = this.getChildren(nodeId);

    for (const child of children) {
      descendants.push(child);
      descendants.push(...this.getDescendants(child.id));
    }

    return descendants;
  }

  /**
   * ノードを再帰的にクローン
   * @param sourceNode - ソースノード
   * @param newParentId - 新しい親ノードID
   * @param includeChildren - 子ノードを含めるか
   * @returns クローンされたノード
   */
  private cloneNodeRecursive(
    sourceNode: MindMapNode,
    newParentId: NodeId | null,
    includeChildren: boolean
  ): MindMapNode {
    const clonedNode: MindMapNode = {
      ...sourceNode,
      id: NodeFactory.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      parentId: newParentId,
      childrenIds: [],
    };

    this.addNode(clonedNode);

    // 子ノードを再帰的にクローン
    if (includeChildren) {
      for (const childId of sourceNode.childrenIds) {
        const child = this.nodes.get(childId);
        if (child) {
          this.cloneNodeRecursive(child, clonedNode.id, true);
        }
      }
    }

    return clonedNode;
  }
}

// ============================================================================
// マインドマップデータモデル
// ============================================================================

/**
 * マインドマップ全体のデータモデル
 * ツリー構造、設定、ビューポートを統合管理
 */
export class MindMapDataModel {
  /** ツリー構造管理 */
  private treeManager: TreeStructureManager;

  /** マインドマップ設定 */
  private settings: MindMapSettings;

  /** ビューポート設定 */
  private viewport: MindMapViewport;

  /** イベントエミッター */
  private emitter: EventEmitter;

  /** データモデルの名前 */
  private name: string;

  /** 作成日時 */
  private createdAt: Date;

  /** 更新日時 */
  private updatedAt: Date;

  /**
   * コンストラクタ
   * @param name - データモデル名
   * @param emitter - イベントエミッター（オプション）
   */
  constructor(name: string = 'Untitled MindMap', emitter?: EventEmitter) {
    this.name = name;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.emitter = emitter || new EventEmitter();
    this.treeManager = new TreeStructureManager(this.emitter);

    // デフォルト設定を初期化
    this.settings = {
      layoutType: 'tree',
      theme: 'light',
      autoSave: true,
      autoSaveInterval: 30,
      showGrid: true,
      showMinimap: true,
      enableAnimations: true,
      animationDuration: 300,
    } as MindMapSettings;

    this.viewport = {
      zoom: 1.0,
      minZoom: 0.1,
      maxZoom: 5.0,
      center: { x: 0, y: 0 },
      size: { width: 800, height: 600 },
      zoomMode: 'fit',
    } as MindMapViewport;
  }

  // ============================================================================
  // 公開API
  // ============================================================================

  /**
   * ツリー管理インスタンスを取得
   * @returns ツリー管理インスタンス
   */
  getTreeManager(): TreeStructureManager {
    return this.treeManager;
  }

  /**
   * 設定を取得
   * @returns マインドマップ設定
   */
  getSettings(): MindMapSettings {
    return { ...this.settings };
  }

  /**
   * 設定を更新
   * @param updates - 更新する設定
   */
  updateSettings(updates: Partial<MindMapSettings>): void {
    const previousSettings = { ...this.settings };
    this.settings = { ...this.settings, ...updates };
    this.updatedAt = new Date();

    this.emitter.emit(MindMapEventType.MINDMAP_SETTINGS_CHANGED, {
      previousValue: previousSettings,
      newValue: this.settings,
    });
  }

  /**
   * ビューポートを取得
   * @returns ビューポート設定
   */
  getViewport(): MindMapViewport {
    return { ...this.viewport };
  }

  /**
   * ビューポートを更新
   * @param updates - 更新するビューポート設定
   */
  updateViewport(updates: Partial<MindMapViewport>): void {
    const previousViewport = { ...this.viewport };
    this.viewport = { ...this.viewport, ...updates };
    this.updatedAt = new Date();

    this.emitter.emit(MindMapEventType.VIEWPORT_CHANGED, {
      previousValue: previousViewport,
      newValue: this.viewport,
    });
  }

  /**
   * マインドマップデータを取得
   * @returns 完全なマインドマップデータ
   */
  toMindMapData(): MindMap {
    const rootNode = this.treeManager.getRootNode();
    const allNodes = this.treeManager.getAllNodes();

    return {
      id: `mindmap_${Date.now()}`,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: {
        title: this.name,
        version: '1.0.0',
        tags: [],
        language: 'ja',
        customProperties: {},
      },
      settings: this.settings,
      viewport: this.viewport,
      nodes: {
        nodes: new Map(allNodes.map(node => [node.id, node])),
        rootNodeIds: rootNode ? [rootNode.id] : [],
        selectedNodeIds: [],
      },
      stats: {
        totalNodes: allNodes.length,
        rootNodes: rootNode ? 1 : 0,
        leafNodes: this.calculateLeafNodes(),
        maxDepth: this.calculateMaxDepth(),
        averageDepth: this.calculateAverageDepth(),
      },
    };
  }

  /**
   * マインドマップデータをロード
   * @param data - マインドマップデータ
   */
  fromMindMapData(data: MindMap): void {
    // データをクリア
    this.clear();

    // 基本情報を設定
    this.name = data.metadata.title;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.settings = data.settings;
    this.viewport = data.viewport;

    // ノードを追加
    const nodes = Array.from(data.nodes.nodes.values());

    // ルートノードから順番に追加
    const rootNodeIds = data.nodes.rootNodeIds;
    for (const rootNodeId of rootNodeIds) {
      const rootNode = nodes.find(node => node.id === rootNodeId);
      if (rootNode) {
        this.treeManager.addNode(rootNode);
        this.addNodesRecursively(rootNode, nodes);
      }
    }
  }

  /**
   * データモデルをクリア
   */
  clear(): void {
    this.treeManager = new TreeStructureManager(this.emitter);
    this.updatedAt = new Date();
  }

  /**
   * バリデーション実行
   * @returns バリデーション結果
   */
  validate(): ValidationResult {
    return this.treeManager.validateTreeStructure();
  }

  // ============================================================================
  // プライベートメソッド
  // ============================================================================

  /**
   * 最大深度を計算
   * @returns 最大深度
   */
  private calculateMaxDepth(): number {
    const rootNode = this.treeManager.getRootNode();
    if (!rootNode) return 0;

    return this.calculateDepthRecursive(rootNode.id, 0);
  }

  /**
   * 再帰的に深度を計算
   * @param nodeId - ノードID
   * @param currentDepth - 現在の深度
   * @returns 深度
   */
  private calculateDepthRecursive(
    nodeId: NodeId,
    currentDepth: number
  ): number {
    const children = this.treeManager.getChildren(nodeId);
    if (children.length === 0) {
      return currentDepth;
    }

    let maxChildDepth = currentDepth;
    for (const child of children) {
      const childDepth = this.calculateDepthRecursive(
        child.id,
        currentDepth + 1
      );
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }

    return maxChildDepth;
  }

  /**
   * リーフノード数を計算
   * @returns リーフノード数
   */
  private calculateLeafNodes(): number {
    const allNodes = this.treeManager.getAllNodes();
    return allNodes.filter(node => node.childrenIds.length === 0).length;
  }

  /**
   * 平均深度を計算
   * @returns 平均深度
   */
  private calculateAverageDepth(): number {
    const allNodes = this.treeManager.getAllNodes();
    if (allNodes.length === 0) return 0;

    let totalDepth = 0;
    for (const node of allNodes) {
      const path = this.treeManager.getNodePath(node.id);
      totalDepth += path.length - 1; // パスの長さ - 1が深度
    }

    return totalDepth / allNodes.length;
  }

  /**
   * ノードを再帰的に追加
   * @param parentNode - 親ノード
   * @param allNodes - 全ノードのリスト
   */
  private addNodesRecursively(
    parentNode: MindMapNode,
    allNodes: MindMapNode[]
  ): void {
    for (const childId of parentNode.childrenIds) {
      const childNode = allNodes.find(node => node.id === childId);
      if (childNode) {
        this.treeManager.addNode(childNode);
        this.addNodesRecursively(childNode, allNodes);
      }
    }
  }
}

// ============================================================================
// エクスポート（クラス定義でエクスポート済みのため重複を避ける）
// ============================================================================
