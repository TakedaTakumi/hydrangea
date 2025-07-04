# マインドマップ Web ツール開発タスクリスト（アジャイル・TDD 指向版）

## 概要

このドキュメントは、ネイティブ HTML+TypeScript+CSS+d3.js で開発するマインドマップ Web ツールのタスクを、アジャイル開発および t-wada 氏の提唱する TDD（Test-Driven Development）に則って再構成したものです。

---

## 進め方の原則

- **イテレーション（スプリント）単位で小さく価値を積み上げる**
- **最小限の動くソフトウェア（MVP）を早期に作る**
- **Red-Green-Refactor サイクルを徹底する**
- **テストファーストで仕様を明確化し、リファクタリングで設計を洗練する**
- **ユーザーストーリー・受け入れ基準を明文化する**

---

## Definition of Done（完了の定義）

各イテレーションの完了基準：

- [ ] すべてのテスト（ユニット・統合・E2E）が通る
- [ ] TypeScript のコンパイルエラーが 0 件
- [ ] ESLint/Prettier によるコード品質チェックが通る
- [ ] 受け入れ基準が満たされている
- [ ] コードレビューが完了している
- [ ] ドキュメント（README、API 仕様等）が更新されている
- [ ] 本番環境での動作確認が完了している
- [ ] パフォーマンス要件を満たしている（描画速度、メモリ使用量）

---

## イテレーション例

### イテレーション 0: プロジェクト基盤構築

**見積もり**: 1-2 日  
**優先度**: 高

- [ ] プロジェクトディレクトリ構造の作成
- [ ] package.json, tsconfig.json, vite.config.ts の設定
- [ ] TypeScript + d3.js の型定義セットアップ
- [ ] Vitest + jsdom によるテスト環境構築
- [ ] Biome の設定
- [ ] 最初の E2E テスト（Playwright）
- [ ] 基本的な HTML テンプレート（index.html）の作成
- [ ] 受け入れ基準：ローカル開発サーバーで index.html が表示される

**技術スタック詳細**:

```
- Node.js 22+
- TypeScript 5.x
- Vite (ビルドツール)
- d3.js v7+
- Vitest (テストフレームワーク)
- Playwright (E2Eテスト)
- Biome 
```

### イテレーション 1: マインドマップの最小表示

**見積もり**: 2-3 日  
**優先度**: 高

- [ ] SVG 要素と d3.js の基本セットアップ
- [ ] 1 ノードだけを描画するテストを書く（Red）
- [ ] Node クラス・インターフェースの定義
- [ ] 1 ノードを描画する最小実装（Green）
- [ ] d3.js selection の基本パターン実装
- [ ] コードのリファクタリング（Refactor）
- [ ] 受け入れ基準：index.html で 1 つのノードが表示される

**技術詳細**:

```typescript
interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
}

class MindMapRenderer {
  render(nodes: Node[]): void;
}
```

### イテレーション 2: ノード追加機能

**見積もり**: 3-4 日  
**優先度**: 高

- [ ] ノード追加のユースケーステストを書く
- [ ] HTML ボタン要素の追加
- [ ] イベントハンドラーの実装（addEventListener）
- [ ] ノード追加の UI/ロジック実装
- [ ] d3.js data join パターンの実装
- [ ] ノード ID 生成ロジックの実装
- [ ] コードのリファクタリング
- [ ] 受け入れ基準：ノード追加ボタンで新しいノードが追加される

**技術詳細**:

```typescript
class NodeManager {
  private nodes: Node[] = [];

  addNode(text: string, position: { x: number; y: number }): Node;
  getNodes(): Node[];
}
```

### イテレーション 3: ノード削除・選択

**見積もり**: 2-3 日  
**優先度**: 中

- [ ] ノード削除・選択のテストを書く
- [ ] ノード選択状態の管理実装
- [ ] 削除ボタン/キーボードショートカット実装
- [ ] 削除・選択機能の実装
- [ ] CSS によるノード選択状態の視覚化
- [ ] コードのリファクタリング
- [ ] 受け入れ基準：ノードを選択・削除できる

**技術詳細**:

```typescript
interface NodeState {
  selected: boolean;
  highlighted: boolean;
}

class SelectionManager {
  selectNode(nodeId: string): void;
  deleteSelectedNodes(): void;
}
```

### イテレーション 4: ノード編集・階層構造

**見積もり**: 4-5 日  
**優先度**: 中

- [ ] ノード編集・階層構造のテストを書く
- [ ] インライン編集機能の実装（contentEditable）
- [ ] 親子関係データ構造の実装
- [ ] d3.js による線（エッジ）の描画
- [ ] ドラッグ＆ドロップによる階層変更
- [ ] 編集・階層構造の実装
- [ ] コードのリファクタリング
- [ ] 受け入れ基準：ノードのテキスト編集・親子関係の追加

**技術詳細**:

```typescript
interface NodeWithChildren extends Node {
  children: string[]; // child node IDs
  parentId?: string;
}

class HierarchyManager {
  addChild(parentId: string, childId: string): void;
  removeChild(parentId: string, childId: string): void;
  getTreeStructure(): NodeWithChildren[];
}
```

### イテレーション 5: ファイル入出力

**見積もり**: 3-4 日  
**優先度**: 低

- [ ] YAML インポート/エクスポートのテストを書く
- [ ] js-yaml ライブラリの追加
- [ ] ファイル選択・保存 UI の実装
- [ ] YAML シリアライゼーション/デシリアライゼーション
- [ ] File API を使用したファイル操作
- [ ] ファイル操作機能の実装
- [ ] コードのリファクタリング
- [ ] 受け入れ基準：YAML でマインドマップを保存・読み込みできる

**技術詳細**:

```typescript
interface MindMapData {
  version: string;
  nodes: NodeWithChildren[];
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

class FileManager {
  exportToYAML(data: MindMapData): string;
  importFromYAML(yaml: string): MindMapData;
  saveToFile(data: MindMapData, filename: string): void;
}
```

---

## 各イテレーションの進め方（TDD サイクル）

1. **Red**: まず失敗するテストを書く（仕様・受け入れ基準を明文化）
2. **Green**: テストを通す最小限の実装を書く
3. **Refactor**: テストが通ったら設計・実装を整理
4. **リピート**: 新たな機能・ストーリーごとに繰り返す

---

## ユーザーストーリー例

- 「ユーザーとして、ノードを追加できることで、思考を広げたい」
- 「ユーザーとして、ノードを削除できることで、不要な情報を整理したい」
- 「ユーザーとして、マインドマップを YAML で保存・読み込みしたい」

---

## テストの種類

- **ユニットテスト**: ロジック単位のテスト（例：ノード追加関数）
- **統合テスト**: 複数モジュールの連携テスト（例：ノード追加 → 描画）
- **E2E テスト**: UI 操作を含む受け入れテスト（例：実際にノードを追加して画面に反映される）

---

## タスク分解例（TDD/アジャイル指向）

- [ ] 受け入れテストを書く（E2E/統合）
- [ ] ユニットテストを書く
- [ ] 実装（最小限）
- [ ] リファクタリング
- [ ] ドキュメント・設計のアップデート
- [ ] 次のストーリーへ

---

## 参考：TDD の三つの視点（t-wada 氏）

- **外部からの振る舞い（振る舞い駆動）**
- **内部の設計（設計駆動）**
- **リファクタリング（進化駆動）**

---

## 補足

- 1 イテレーションごとに動くソフトウェア・テスト・ドキュメントを必ず残す
- 受け入れ基準は常に明文化し、関係者と合意する
- テストコードは設計の一部として扱う

---
