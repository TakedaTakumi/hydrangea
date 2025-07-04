# GitHub Copilot Instructions - マインドマップ Web ツール開発

## 基本方針

### アジャイル・TDD 開発原則

- **テストファースト**: 実装前に必ずテストを書く（Red-Green-Refactor サイクル）
- **小さなイテレーション**: 1-2 週間で価値を提供できる最小単位で開発
- **継続的リファクタリング**: 動作するテストがある状態で設計を改善
- **明確な受け入れ基準**: 各機能の完了条件を定義

### コード品質基準

- TypeScript の型安全性を最大活用
- Biome のルールを厳格に適用
- 80%以上のテストカバレッジを目指す
- 自己文書化コードを書く

## 技術実装指針

### TypeScript 設計パターン

```typescript
// インターフェース優先設計
interface Node {
  readonly id: string;
  text: string;
  position: Position;
  metadata?: NodeMetadata;
}

// 不変性を重視したデータ構造
interface Position {
  readonly x: number;
  readonly y: number;
}

// 関数型プログラミングの要素を活用
type NodeTransformer = (node: Node) => Node;
```

### d3.js 実装パターン

```typescript
// Selection patternを一貫して使用
const selection = d3
  .select(container)
  .selectAll(".node")
  .data(nodes, (d: Node) => d.id);

// Enter-Update-Exit patternを明確に分離
const enter = selection.enter().append("g").classed("node", true);

const update = selection.merge(enter);
const exit = selection.exit();
```

### テスト戦略

- **ユニットテスト**: 個別の関数・クラスの動作検証
- **統合テスト**: モジュール間の連携テスト
- **E2E テスト**: ユーザーの操作シナリオテスト
- **視覚的回帰テスト**: SVG 描画の変更検出

## アーキテクチャ設計

### レイヤー分離

```
Presentation Layer (UI Components)
├── View Layer (d3.js Rendering)
├── Application Layer (Use Cases)
├── Domain Layer (Business Logic)
└── Infrastructure Layer (Data Persistence)
```

### 依存性注入の活用

```typescript
interface MindMapRepository {
  save(data: MindMapData): Promise<void>;
  load(id: string): Promise<MindMapData>;
}

class MindMapService {
  constructor(private repository: MindMapRepository) {}
}
```

### イベント駆動アーキテクチャ

```typescript
interface MindMapEvents {
  nodeAdded: (node: Node) => void;
  nodeDeleted: (nodeId: string) => void;
  nodeUpdated: (node: Node) => void;
}
```

## パフォーマンス最適化

### 描画パフォーマンス

- 仮想化（Virtual Scrolling）でノード数の制限を回避
- Canvas/WebGL 併用で SVG の制約を補完
- requestAnimationFrame によるスムーズなアニメーション

### メモリ管理

- WeakMap によるメモリリークの防止
- イベントリスナーの適切な解除
- d3.js セレクションの適切な管理

## エラーハンドリング戦略

### 例外処理の階層化

```typescript
// Domain Layer
class DomainError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

// Application Layer
class ValidationError extends DomainError {
  constructor(field: string, value: any) {
    super(`Invalid ${field}: ${value}`, "VALIDATION_ERROR");
  }
}
```

### 復旧可能性の考慮

- 自動保存機能による作業内容の保護
- 部分的な描画失敗からの回復
- ネットワークエラーからの自動再試行

## セキュリティ対策

### XSS 対策

- DOMPurify による HTML サニタイゼーション
- CSP（Content Security Policy）の適用
- ユーザー入力の厳格なバリデーション

### データ保護

- ローカルストレージの暗号化
- 機密データの適切な処理
- YAML 解析時のインジェクション攻撃対策

## 国際化（i18n）対応

### 多言語対応の準備

```typescript
interface LocalizedText {
  ja: string;
  en: string;
  [key: string]: string;
}

const messages: Record<string, LocalizedText> = {
  "node.add": {
    ja: "ノードを追加",
    en: "Add Node",
  },
};
```

## アクセシビリティ（a11y）

### ARIA 対応

- role 属性の適切な設定
- aria-label/aria-describedby の活用
- キーボードナビゲーションの実装

### 視覚的配慮

- 色のみに依存しない情報表示
- 十分なコントラスト比の確保
- 拡大縮小への対応

## 開発ツールチェーン

### 必須ツール

- **Vite**: 高速なビルドシステム + SSG対応
- **Vitest**: TypeScript 対応テストフレームワーク
- **Playwright**: E2E テスト自動化
- **Biome**: 統合リンター/フォーマッター

### 推奨拡張

- **Storybook**: コンポーネント開発環境
- **Chromatic**: 視覚的回帰テスト
- **Bundlesize**: バンドルサイズ監視
- **Lighthouse CI**: パフォーマンス監視

### 静的サイト生成（SSG）対応

- **Vite Build**: 本番用静的ファイル生成
- **相対パス設定**: 任意のディレクトリでの動作保証
- **アセット最適化**: 画像・CSS・JSの最適化とハッシュ化
- **GitHub Pages/Netlify/Vercel**: 静的ホスティング対応

## コミット規約

### Conventional Commits

```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更
refactor: リファクタリング
test: テスト追加・修正
chore: その他のメンテナンス
```

### ブランチ戦略

- `main`: 本番環境デプロイ用
- `develop`: 開発統合ブランチ
- `feature/*`: 機能開発ブランチ
- `hotfix/*`: 緊急修正ブランチ

### コードレビュー観点

- **型安全性**: TypeScript 型定義の適切性
- **テストカバレッジ**: 新機能のテスト充実度
- **パフォーマンス**: 描画処理の効率性
- **セキュリティ**: XSS 対策やバリデーション
- **アクセシビリティ**: ARIA 属性とキーボード対応
- **静的ファイル生成**: ビルド設定とデプロイ可能性の確認

## 継続的改善

### メトリクス監視

- バンドルサイズの追跡
- 描画パフォーマンスの測定
- テストカバレッジの維持
- 技術的負債の可視化
- **静的ファイル生成時間とサイズの監視**
- **デプロイ成功率の追跡**

### 定期的な見直し

- 月次でのアーキテクチャレビュー
- 四半期での技術スタック評価
- 年次での設計方針の見直し

---

## 実装時の注意点

1. **段階的な実装**: 一度に多くの機能を実装せず、小さな単位で確実に
2. **テストの充実**: 実装コードよりもテストコードの品質を重視
3. **パフォーマンス**: 早期最適化は避けるが、設計時には考慮
4. **ユーザビリティ**: 技術的な実装よりもユーザー体験を優先
5. **保守性**: 将来の拡張・変更を考慮した設計

このガイドラインに従って、堅牢で保守性の高いマインドマップツールの開発を進めてください。

## GitHub Copilot 生成指示

### コード生成時の優先順位

1. **型安全性を最優先** - unknown や any の使用を避け、厳密な型定義を行う
2. **テスタビリティを考慮した設計** - 依存性注入とモックしやすい構造
3. **可読性と保守性のバランス** - 自己文書化コードと適切なコメント
4. **パフォーマンス最適化は後回し** - 動作する実装を優先

### 生成時の制約

- 外部ライブラリの安易な追加を避ける
- 設定可能な値はハードコーディングしない
- エラーハンドリングを必ず含める
- 各関数・クラスは単一責任の原則に従う

### 生成パターンの指針

```typescript
// 良い例：型安全で拡張可能
interface NodeConfig {
  readonly minSize: number;
  readonly maxSize: number;
  readonly defaultColor: string;
}

const createNode = (config: NodeConfig): Node => {
  // 実装
};

// 避けるべき例：型が不明確
const createNode = (options: any) => {
  // 実装
};
```

## マインドマップ特有の実装指針

### 描画最適化戦略

- **1000 ノード以上での仮想化実装** - 画面外ノードの描画を省略
- **クアッドツリーによる空間分割** - 効率的な衝突検出と範囲検索
- **LOD（Level of Detail）による描画制御** - ズームレベルに応じた詳細度調整
- **Canvas/WebGL 併用でのハイブリッド描画** - SVG の制約を補完

### ユーザー操作の実装方針

- **スムーズなズーム操作（0.1x ～ 10x）** - 段階的な拡大縮小
- **慣性付きパン操作** - 自然な操作感の実現
- **マルチタッチ対応** - ピンチズームとパン操作の同時処理
- **キーボードナビゲーション** - アクセシビリティ対応

### ノード配置アルゴリズム

```typescript
interface LayoutAlgorithm {
  calculatePositions(nodes: Node[]): Map<string, Position>;
  applyForces(nodes: Node[], connections: Connection[]): void;
  stabilize(): boolean;
}

// 力学的レイアウト（Force-directed）
class ForceDirectedLayout implements LayoutAlgorithm {
  private forceSimulation: d3.Simulation<Node, Connection>;

  calculatePositions(nodes: Node[]): Map<string, Position> {
    // 実装
  }
}
```

### 大規模データ処理

- **段階的データ読み込み** - 必要な部分のみを動的に読み込み
- **メモリ効率的なデータ構造** - 不要なデータの自動削除
- **背景でのプリフェッチ** - ユーザー操作を予測した先読み

## 開発段階別アプローチ

### プロトタイプ段階（イテレーション 0-1）

**目標**: 最小限の動作確認と概念実証

- **機能実装を最優先** - 完璧でなくても動作する実装
- **パフォーマンス最適化は後回し** - 機能の動作確認を優先
- **最小限のテストで動作確認** - 主要機能のスモークテスト
- **プロトタイプ品質のコード** - 技術的負債の蓄積は許容

```typescript
// プロトタイプ段階での実装例
class SimpleNodeRenderer {
  render(nodes: Node[]): void {
    // 最小限の実装
    nodes.forEach((node) => {
      // 単純な描画処理
    });
  }
}
```

### 本格実装段階（イテレーション 2-5）

**目標**: プロダクション品質の実装

- **包括的なテストカバレッジ** - 80%以上のカバレッジを目指す
- **パフォーマンス最適化の実装** - 測定可能な改善
- **プロダクション品質の達成** - 保守性・拡張性の確保
- **技術的負債の解消** - リファクタリングの実施

```typescript
// 本格実装段階での実装例
class ProductionNodeRenderer {
  private renderCache = new Map<string, RenderedNode>();
  private performanceMonitor = new PerformanceMonitor();

  async render(nodes: Node[]): Promise<void> {
    this.performanceMonitor.start("render");

    // 最適化された描画処理
    const visibleNodes = this.getVisibleNodes(nodes);
    await this.renderWithBatching(visibleNodes);

    this.performanceMonitor.end("render");
  }
}
```

### MVP（最小実行可能製品）の定義

1. **1 つのノードを表示** - 基本的な描画機能
2. **ノードの追加・削除** - 基本的な CRUD 操作
3. **簡単な移動・配置** - ドラッグ&ドロップ
4. **ファイル保存・読み込み** - データの永続化
5. **静的ファイル生成** - デプロイ可能な成果物の生成

---

## 静的サイト生成（SSG）実装指針

### Vite SSG 設定の重要ポイント

```typescript
// vite.config.ts の基本設定
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['d3']
        }
      }
    }
  },
  base: './', // 重要：相対パスでの静的ファイル生成
  publicDir: 'public' // 静的アセットのディレクトリ
})
```

### 静的ファイル生成の品質基準

- **相対パス対応**: 任意のディレクトリに配置可能
- **アセット最適化**: 画像・CSS・JSの最適化とハッシュ化
- **バンドルサイズ制限**: 初期ロード1MB以下
- **SEO対応**: 適切なmeta情報の埋め込み
- **プログレッシブエンハンスメント**: JavaScript無効時の基本動作

### デプロイ環境別設定

```typescript
// GitHub Pages用設定
const isGitHubPages = process.env.NODE_ENV === 'github-pages'

export default defineConfig({
  base: isGitHubPages ? '/repository-name/' : './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

### 静的ファイル生成のテスト戦略

- **ビルド成功テスト**: npm run build の正常実行
- **静的ファイル整合性テスト**: 生成ファイルの存在確認
- **相対パステスト**: サブディレクトリでの動作確認
- **パフォーマンステスト**: バンドルサイズとロード時間測定
- **デプロイテスト**: 実際のホスティング環境での動作確認

### CI/CD での静的ファイル生成

```yaml
# GitHub Actions でのビルド・デプロイ例
name: Build and Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - name: Install dependencies
        run: npm ci
      - name: Build static files
        run: npm run build
      - name: Test static files
        run: |
          npx http-server dist &
          sleep 5
          curl -f http://localhost:8080/
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---
