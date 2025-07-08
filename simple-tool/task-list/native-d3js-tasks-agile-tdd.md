# マインドマップ Web ツール開発タスクリスト（アジャイル・TDD 指向版）

## 概要

このドキュメントは、ネイティブ HTML+TypeScript+CSS+d3.js で開発するマインドマップ Web ツールのタスクを、アジャイル開発および t-wada 氏の提唱する TDD（Test-Driven Development）に則って再構成したものです。

---

## 進め方の原則

- 作業ディレクトリ：`simple-tool`
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
- [ ] **静的ファイルが正常に生成される（`npm run build`）**
- [ ] **生成された静的ファイルが Web サーバーで正常に動作する**
- [ ] **バンドルサイズが適切な範囲内（目安：初期ロード 1MB 以下）**

---

## イテレーション例

### イテレーション 0: プロジェクト基盤構築

**見積もり**: 1-2 日  
**優先度**: 高

- [x] プロジェクトディレクトリ構造の作成
- [x] package.json, tsconfig.json, vite.config.ts の設定
- [x] **Vite での静的ファイル生成設定（SSG 対応）**
- [x] **ビルド最適化設定（バンドルサイズ削減、コード分割）**
- [x] TypeScript + d3.js の型定義セットアップ
- [x] Vitest + jsdom によるテスト環境構築
- [x] Biome の設定
- [x] 最初の E2E テスト（Playwright）
- [x] 基本的な HTML テンプレート（index.html）の作成
- [x] **静的ファイル生成テスト（`npm run build`の動作確認）**
- [x] **デプロイ用ディレクトリ構造の確認**
- [x] 受け入れ基準：ローカル開発サーバーで index.html が表示される
- [x] **受け入れ基準：`npm run build`で静的ファイルが生成される**

**技術スタック詳細**:

```
- Bun
- TypeScript 5.x
- Vite (ビルドツール + SSG対応)
- d3.js v7+
- Vitest (テストフレームワーク)
- Playwright (E2Eテスト)
- Biome
```

**Vite 設定例**:

```typescript
// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["d3"],
        },
      },
    },
  },
  base: "./", // 相対パスでの静的ファイル生成
});
```

### イテレーション 1: マインドマップの最小表示

**見積もり**: 2-3 日  
**優先度**: 高

- [x] SVG 要素と d3.js の基本セットアップ
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

### イテレーション 6: 静的ファイルデプロイ対応

**見積もり**: 2-3 日  
**優先度**: 中

- [ ] **静的ファイルデプロイのテストを書く**
- [ ] **ビルド設定の最適化（バンドルサイズ削減）**
- [ ] **相対パス対応（任意のディレクトリでの動作確認）**
- [ ] **静的ホスティングサービス対応設定**
- [ ] **GitHub Pages / Netlify / Vercel 対応**
- [ ] **デプロイ用 CI/CD 設定**
- [ ] **本番環境での動作確認**
- [ ] コードのリファクタリング
- [ ] 受け入れ基準：静的ファイルが正常に生成される
- [ ] **受け入れ基準：生成された静的ファイルが任意の Web サーバーで動作する**

**技術詳細**:

```typescript
// package.json スクリプト例
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

**デプロイ用設定例**:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - uses: actions/deploy-pages@v1
        with:
          artifact_name: dist
```

---

## 静的ファイル生成の確認項目

### ビルド成果物チェックリスト

- [ ] **index.html が正常に生成される**
- [ ] **JavaScript バンドルが最適化されている**
- [ ] **CSS が適切にバンドルされている**
- [ ] **d3.js などの依存関係が正しく含まれている**
- [ ] **相対パスでリソースが参照されている**
- [ ] **ソースマップが生成されている（デバッグ用）**
- [ ] **gzip 圧縮時のファイルサイズが適切**

### デプロイ環境での動作確認

- [ ] **ローカルの HTTP サーバーで動作確認**
- [ ] **GitHub Pages での動作確認**
- [ ] **Netlify での動作確認**
- [ ] **Apache/Nginx での動作確認**
- [ ] **サブディレクトリでの動作確認**

**確認用コマンド例**:

```bash
# ローカル確認
npm run build
npx http-server dist

# サブディレクトリ確認
mkdir -p /tmp/webroot/subdir
cp -r dist/* /tmp/webroot/subdir/
npx http-server /tmp/webroot
# http://localhost:8080/subdir/ でアクセス確認
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
- **静的ファイル生成は各イテレーションで確認し、デプロイ可能性を保つ**
- **本番環境（静的ホスティング）での動作確認を定期的に実施する**

---

## 静的ファイル生成・デプロイのベストプラクティス

### Vite SSG 設定のポイント

1. **相対パス設定**: `base: './'` で任意のディレクトリに配置可能
2. **アセット最適化**: 画像・フォントの最適化とハッシュ化
3. **コード分割**: 必要な部分のみ読み込むチャンク設定
4. **Tree Shaking**: 未使用コードの除去
5. **圧縮**: Gzip/Brotli 圧縮対応

### デプロイ環境別の考慮事項

- **GitHub Pages**: `base` 設定とリポジトリ名の調整
- **Netlify**: `_redirects` ファイルでの SPA 対応
- **Vercel**: `vercel.json` でのルーティング設定
- **Apache/Nginx**: 静的ファイルの配信設定

### パフォーマンス最適化

- **初期ロード**: 1MB 以下を目標
- **d3.js バンドル**: 必要な機能のみ import
- **画像最適化**: WebP/AVIF 対応
- **キャッシュ戦略**: 適切な Cache-Control ヘッダー設定
