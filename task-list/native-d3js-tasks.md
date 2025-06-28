# マインドマップ Web ツール開発タスクリスト（Bun + HTML+TS+Tailwind CSS+d3.js 版）

## 概要

Bun をビルドツールとして使用し、HTML+TypeScript+Tailwind CSS+d3.js でマインドマップ Web ツールを開発する場合のタスクリスト。Tailwind CSS により UI 開発を効率化し、保守性の高い軽量な静的 Web アプリケーションを開発する。

## 想定するプロジェクト構成（Bun + Tailwind CSS 環境）

```
mindmap-simple-tool/
├── package.json                    # Bun パッケージ設定
├── bun.lockb                       # Bun ロックファイル
├── bunfig.toml                     # Bun 設定ファイル（オプション）
├── tsconfig.json                   # TypeScript 設定
├── tailwind.config.js              # Tailwind CSS 設定
├── postcss.config.js               # PostCSS 設定（オプション）
├── index.html                      # メイン HTML（開発用）
├── README.md                       # プロジェクト説明
├── .gitignore                      # Git 無視ファイル
├── src/                            # ソースコード
│   ├── main.ts                     # アプリケーションエントリーポイント
│   ├── types/
│   │   ├── index.ts               # 型定義のエクスポート
│   │   ├── node.ts                # ノード関連の型定義
│   │   ├── mindmap.ts             # マインドマップ関連の型定義
│   │   └── ui.ts                  # UI 関連の型定義
│   ├── core/
│   │   ├── state-manager.ts       # 状態管理システム
│   │   ├── event-emitter.ts       # イベント発行・購読システム
│   │   └── data-model.ts          # データモデル定義
│   ├── mindmap/
│   │   ├── mindmap-renderer.ts    # d3.js 描画メイン
│   │   ├── node-manager.ts        # ノード操作機能
│   │   ├── layout-manager.ts      # レイアウトアルゴリズム
│   │   └── animation.ts           # アニメーション機能
│   ├── ui/
│   │   ├── toolbar.ts             # ツールバー機能
│   │   ├── context-menu.ts        # 右クリックメニュー
│   │   ├── hierarchy-panel.ts     # 左ペイン（ツリービュー）
│   │   ├── detail-panel.ts        # 右ペイン（詳細設定）
│   │   ├── modal.ts               # モーダルダイアログ
│   │   └── notifications.ts       # 通知システム
│   ├── features/
│   │   ├── file-handler.ts        # ファイル操作（インポート/エクスポート）
│   │   ├── keyboard-shortcuts.ts  # キーボードショートカット
│   │   ├── drag-drop.ts           # ドラッグ&ドロップ
│   │   └── zoom-pan.ts            # ズーム・パン機能
│   ├── utils/
│   │   ├── helpers.ts             # 汎用ユーティリティ関数
│   │   ├── constants.ts           # 定数定義
│   │   ├── validators.ts          # バリデーション機能
│   │   └── yaml-parser.ts         # YAML 解析機能
│   └── config/
│       ├── settings.ts            # アプリケーション設定
│       └── defaults.ts            # デフォルト値定義
├── public/                         # 静的ファイル
│   ├── css/
│   │   ├── input.css              # Tailwind CSS 入力ファイル
│   │   ├── output.css             # Tailwind CSS ビルド済みファイル
│   │   ├── mindmap.css            # マインドマップ専用カスタムスタイル
│   │   └── components.css         # @apply ディレクティブ用コンポーネント
│   ├── icons/                      # アイコンファイル
│   │   ├── toolbar/               # ツールバー用アイコン
│   │   └── ui/                    # UI 用アイコン
│   └── fonts/                      # カスタムフォント（オプション）
├── dist/                           # ビルド出力（デプロイ用）
│   ├── index.html
│   ├── assets/
│   └── ...
├── samples/                        # サンプルデータ
│   ├── basic-mindmap.yaml         # 基本的なマインドマップ
│   ├── complex-mindmap.yaml       # 複雑なマインドマップ
│   └── templates/                 # テンプレート
│       ├── project-planning.yaml
│       ├── brainstorming.yaml
│       └── study-notes.yaml
├── docs/                           # ドキュメント
│   ├── user-manual.md             # ユーザーマニュアル
│   ├── api-reference.md           # API リファレンス
│   ├── architecture.md            # アーキテクチャ説明
│   └── development-guide.md       # 開発ガイド
└── tests/                          # テスト（Bun 内蔵テストランナー使用）
    ├── unit/                      # ユニットテスト
    ├── integration/               # 統合テスト
    └── e2e/                       # E2E テスト
```

### 主要ファイルの役割（Bun + Tailwind CSS 環境）

#### プロジェクト設定

- `package.json`: Bun パッケージ管理、スクリプト定義、Tailwind CSS 依存関係
- `bun.lockb`: Bun ロックファイル（自動生成）
- `bunfig.toml`: Bun 設定ファイル（オプション）
- `tsconfig.json`: TypeScript 設定
- `tailwind.config.js`: Tailwind CSS 設定（カラーパレット、コンポーネント、プラグイン）
- `postcss.config.js`: PostCSS 設定（Tailwind CSS とプラグイン）

#### HTML 構造

- `index.html`: 3 ペイン構成のメインレイアウト（Tailwind クラス使用）
- `dist/index.html`: ビルド済み HTML（デプロイ用）

#### CSS 構成（Tailwind CSS ベース）

- `public/css/input.css`: Tailwind ディレクティブ（@tailwind base, components, utilities）
- `public/css/output.css`: Tailwind ビルド済み CSS（本番用）
- `public/css/components.css`: @apply ディレクティブによるカスタムコンポーネント
- `public/css/mindmap.css`: SVG ノード、エッジ、アニメーション等の特殊スタイル

#### TypeScript モジュール構成

- **src/types/**: 型定義ファイル（Node、MindMap、UI 関連型）
- **src/core/**: アプリケーション基盤（状態管理、イベントシステム）
- **src/mindmap/**: マインドマップ描画・操作のコア機能
- **src/ui/**: ユーザーインターフェース関連
- **src/features/**: 特定機能（ファイル操作、ショートカット等）
- **src/utils/**: 汎用ユーティリティ
- **src/config/**: 設定・定数

#### ビルド・デプロイ

- **src/**: TypeScript ソースファイル
- **dist/**: Bun でビルドされた最適化済みファイル（デプロイ用）

#### 外部ライブラリ（Bun パッケージ管理）

- **d3.js 関連**: `bun add d3` でインストール、自動バンドル
- **型定義**: `bun add -d @types/d3` で TypeScript 型定義
- **Tailwind CSS**: `bun add -d tailwindcss postcss autoprefixer` で CSS フレームワーク
- **Tailwind プラグイン**: `bun add -d @tailwindcss/forms @tailwindcss/typography` でフォーム・タイポグラフィ
- **js-yaml**: `bun add js-yaml` で YAML 解析ライブラリ
- **html2canvas**: `bun add html2canvas` で画像エクスポート機能（オプション）

#### 開発・テスト環境

- **samples/**: テストデータ、テンプレート
- **docs/**: 技術文書
- **tests/**: Bun 内蔵テストランナーでのテストコード

### ファイルサイズ目安（Bun + Tailwind CSS ビルド後）

- **HTML**: ~2-3KB
- **Tailwind CSS（最適化済み）**: ~8-12KB（使用クラスのみ、PurgeCSS により大幅削減）
- **カスタム CSS**: ~3-5KB（マインドマップ専用スタイル）
- **TypeScript ソース**: ~60-80KB（開発時のみ）
- **JavaScript（Bun バンドル済み）**: ~40-60KB（圧縮済み、ライブラリ含む）
- **d3.js（バンドル内）**: ~25-35KB（必要モジュールのみ、Tree-shaking 済み）
- **総サイズ**: ~80-120KB（Tailwind PurgeCSS により従来比 20-30%削減）

## プロジェクトセットアップ

- [x] プロジェクト初期化と基本構造
  - [x] `bun init` でプロジェクト初期化
  - [x] ディレクトリ構造の設計（上記 Bun + Tailwind 構成に従って作成）
  - [x] README.md の作成
  - [x] .gitignore の設定（node_modules、dist、bun.lockb、output.css を含める）
  - [x] bunfig.toml の設定（オプション）
- [x] パッケージ・ライブラリ導入
  - [x] `bun add -d typescript @types/node` で TypeScript 環境設定
  - [x] `bun add -d tailwindcss postcss autoprefixer` で Tailwind 導入
  - [x] `bun add -d @tailwindcss/forms @tailwindcss/typography` でプラグイン導入
  - [x] `bun add d3` で d3.js 導入
  - [x] `bun add -d @types/d3` で型定義導入
  - [x] `bun add js-yaml && bun add -d @types/js-yaml` で YAML ライブラリ導入
  - [x] `bun add html2canvas`（オプション、画像エクスポート用）
  - [x] `bun add -d eslint prettier concurrently`（開発ツール）
- [ ] 設定ファイルの作成
  - [ ] tsconfig.json の作成（Bun 最適化設定）
  - [ ] `bunx tailwindcss init -p` で Tailwind 設定ファイル生成
  - [ ] tailwind.config.js の詳細設定
    - [ ] content パスの設定（HTML、TypeScript ファイルを対象）
    - [ ] カスタムカラーパレットの定義（マインドマップ用）
    - [ ] カスタムフォントサイズ、間隔の定義
    - [ ] ダークモード設定（'class' ストラテジー）
    - [ ] プラグインの有効化
  - [ ] package.json スクリプトの設定
    - [ ] `css:watch` で Tailwind ウォッチモード
    - [ ] `css:build` で Tailwind 本番ビルド
    - [ ] `dev` で並行開発サーバー起動（CSS ウォッチ + TS コンパイル）
    - [ ] `build` でビルド実行（Tailwind + Bun バンドラー）
    - [ ] `preview` でビルド結果プレビュー
    - [ ] `test` でテスト実行（Bun 内蔵テストランナー）
- [ ] ファイル構造の作成
  - [ ] index.html の作成（3 ペインレイアウト、Tailwind クラス使用）
  - [ ] TypeScript モジュールの構成（src/ 配下に配置）
  - [ ] CSS ファイルの構成
    - [ ] public/css/input.css の作成（@tailwind ディレクティブ）
    - [ ] public/css/components.css の作成（@apply ディレクティブ用）
    - [ ] public/css/mindmap.css の作成（特殊スタイル用）
- [ ] 開発環境の最終設定
  - [ ] ESLint + Prettier の設定
  - [ ] VS Code Tailwind CSS IntelliSense の有効化
  - [ ] 開発サーバーの動作確認

## 基本画面・レイアウト実装（Tailwind CSS）

- [ ] HTML の基本構造作成（Tailwind クラス使用）
  - [ ] ヘッダー部分（`flex justify-between items-center` 等）
  - [ ] 3 ペイン構成のレイアウト
    - [ ] 左ペイン: ツリービュー（`w-64 bg-gray-100 dark:bg-gray-800` 等）
    - [ ] 中央ペイン: d3.js キャンバス（`flex-1 relative` 等）
    - [ ] 右ペイン: ノード詳細・設定（`w-80 bg-gray-50 dark:bg-gray-900` 等）
- [ ] Tailwind CSS レイアウトの実装
  - [ ] CSS Grid を使った 3 ペインレイアウト（`grid grid-cols-[256px_1fr_320px]`）
  - [ ] レスポンシブデザインの設定（`lg:grid-cols-1 md:grid-cols-[256px_1fr]`）
  - [ ] ダークモード対応（`dark:` モディファイア）
  - [ ] ペインのリサイズ機能（`resize-x` 等、オプション）
- [ ] Tailwind UI コンポーネントの作成
  - [ ] @apply ディレクティブによるボタンコンポーネント
  - [ ] @apply ディレクティブによるフォームコンポーネント
  - [ ] @apply ディレクティブによるモーダルコンポーネント

## 状態管理システム実装

- [ ] TypeScript 型定義の作成
  - [ ] 基本型定義（types/index.ts）
  - [ ] ノード関連型定義（types/node.ts）
  - [ ] マインドマップ関連型定義（types/mindmap.ts）
  - [ ] UI 関連型定義（types/ui.ts）
  - [ ] イベント関連型定義
- [ ] 基本的な状態管理クラスの作成
  - [ ] Observer Pattern の実装（core/event-emitter.ts）
  - [ ] 状態管理クラスの作成（core/state-manager.ts）
  - [ ] 型安全なイベント発行・購読システム
- [ ] マインドマップデータモデルの定義
  - [ ] ノードデータ構造の設計（core/data-model.ts）
  - [ ] ツリー構造の管理クラス（型安全な実装）
  - [ ] ノードの一意 ID 生成機能（utils/helpers.ts）
  - [ ] バリデーション機能（utils/validators.ts、型ガード実装）
  - [ ] インターフェース・型エイリアスの定義
- [ ] 状態管理の主要機能
  - [ ] ノード情報の管理（テキスト、色、位置、親子関係）
  - [ ] 選択中ノードの管理
  - [ ] 折りたたみ状態の管理
  - [ ] キャンバス表示状態の管理（ズーム、位置）
  - [ ] アンドゥ・リドゥ機能の基盤

## d3.js マインドマップ描画機能

### 基本描画システム

- [ ] d3.js 基盤クラスの作成
  - [ ] SVG キャンバスの初期化（mindmap/mindmap-renderer.ts）
  - [ ] d3.js の型定義インポートと設定
  - [ ] ズーム・パン機能の実装（features/zoom-pan.ts、d3-zoom 使用）
  - [ ] 基本的なイベントハンドリング（型安全な実装）
  - [ ] キャンバスサイズの自動調整

### ノード描画

- [ ] ノード描画機能
  - [ ] d3-hierarchy を使ったツリー構造の処理
  - [ ] ノードの基本形状描画（矩形、円形、角丸等）
  - [ ] テキスト描画とサイズ調整
  - [ ] ノードの色・スタイル適用
- [ ] エッジ（接続線）描画
  - [ ] ノード間の線の描画
  - [ ] 曲線・直線の選択
  - [ ] 線のスタイル設定（色、太さ、破線等）

### レイアウトアルゴリズム

- [ ] レイアウト機能の実装
  - [ ] d3-tree を使った基本ツリーレイアウト
  - [ ] d3-force を使った力学レイアウト（オプション）
  - [ ] 放射状レイアウト（オプション）
  - [ ] カスタムレイアウトの実装

### アニメーション

- [ ] d3 トランジションを使ったアニメーション
  - [ ] ノード追加・削除時のアニメーション
  - [ ] レイアウト変更時のスムーズな移行
  - [ ] 折りたたみ・展開アニメーション

## ノード操作機能

### 基本操作

- [ ] ノードの選択機能
  - [ ] クリックによる単一選択
  - [ ] 複数選択（Ctrl+クリック）
  - [ ] 範囲選択（ドラッグ選択）
- [ ] ノードの追加機能
  - [ ] 子ノード追加
  - [ ] 兄弟ノード追加
  - [ ] 親ノードの追加
- [ ] ノードの削除機能
  - [ ] 単一ノード削除
  - [ ] 複数ノード削除
  - [ ] 子ノード込みの削除

### ドラッグ&ドロップ

- [ ] ノードのドラッグ機能
  - [ ] d3-drag を使ったドラッグ実装
  - [ ] ドラッグ中の視覚的フィードバック
  - [ ] ドロップ可能領域の表示
- [ ] ノードの移動・再配置
  - [ ] 親子関係の変更
  - [ ] 位置の調整
  - [ ] 不正な移動の防止

### テキスト編集

- [ ] インライン編集機能
  - [ ] ダブルクリックでの編集モード開始
  - [ ] foreignObject を使った入力フィールド
  - [ ] Enter/ESC キーでの編集確定・キャンセル
  - [ ] テキストの自動サイズ調整

### スタイル変更

- [ ] ノードスタイル変更機能（Tailwind CSS 統合）
  - [ ] 色変更機能（Tailwind カラーパレット使用）
  - [ ] 形状変更機能（Tailwind ユーティリティクラス適用）
  - [ ] フォントサイズ・スタイル変更（`text-sm` `text-lg` 等）
- [ ] Tailwind カラーピッカーの実装
  - [ ] プリセットカラーパレット（tailwind.config.js 定義色）
  - [ ] CSS 変数との連携によるカスタムカラー選択

## ファイル操作機能

### YAML インポート機能

- [ ] ファイル選択 UI
  - [ ] File API を使ったファイル選択
  - [ ] ドラッグ&ドロップでのファイル読み込み
- [ ] YAML パースライブラリの実装
  - [ ] 軽量 YAML パーサーの導入（js-yaml 等）
  - [ ] エラーハンドリング
- [ ] データ変換機能
  - [ ] YAML データからマインドマップデータへの変換
  - [ ] バリデーション機能

### YAML エクスポート機能

- [ ] データシリアライズ機能
  - [ ] マインドマップデータから YAML 形式への変換
  - [ ] プリティ印刷（整形）機能
- [ ] ファイルダウンロード機能
  - [ ] Blob API を使ったファイル生成
  - [ ] ダウンロードリンクの動的生成

### 画像エクスポート機能（オプション）

- [ ] SVG 画像としてのエクスポート
- [ ] PNG 画像としてのエクスポート（html2canvas 等使用）

## キーボードショートカット

- [ ] ショートカット管理システム
  - [ ] キーイベントのグローバルハンドリング
  - [ ] ショートカットの競合回避
  - [ ] カスタマイズ可能な設定
- [ ] 基本操作ショートカット
  - [ ] Tab: 新規子ノード追加
  - [ ] Enter: 新規兄弟ノード追加
  - [ ] Delete/Backspace: ノード削除
  - [ ] Space: 折りたたみ/展開
  - [ ] F2: ノード名編集
- [ ] 編集操作ショートカット
  - [ ] Ctrl+C: コピー
  - [ ] Ctrl+V: ペースト
  - [ ] Ctrl+X: カット
  - [ ] Ctrl+Z: アンドゥ
  - [ ] Ctrl+Y: リドゥ
- [ ] 表示操作ショートカット
  - [ ] +/-: ズームイン/アウト
  - [ ] 0: 100%表示
  - [ ] Home: 全体表示
  - [ ] 矢印キー: ノード間の移動

## ユーザビリティ向上

### マウス操作の改善

- [ ] 右クリックコンテキストメニュー
  - [ ] ノード操作メニュー
  - [ ] キャンバス操作メニュー
- [ ] マウスホバーエフェクト
  - [ ] ノードのハイライト
  - [ ] ツールチップの表示
- [ ] マウスホイール操作
  - [ ] ズーム機能
  - [ ] スクロール機能（Shift+ホイール）

### 視覚的フィードバック（Tailwind CSS）

- [ ] ローディング表示（Tailwind アニメーション）
  - [ ] ファイル読み込み時（`animate-spin` 等）
  - [ ] 大きなマップの描画時（`animate-pulse` 等）
- [ ] 通知システム（Tailwind トランジション）
  - [ ] 操作完了の通知（`transition-all duration-300` 等）
  - [ ] エラーメッセージの表示（`bg-red-100 text-red-800` 等）
  - [ ] 警告メッセージの表示（`bg-yellow-100 text-yellow-800` 等）
- [ ] プログレス表示（Tailwind プログレスバー）
  - [ ] 時間のかかる処理の進捗表示（`w-[var(--progress)]` 等）

### アクセシビリティ

- [ ] キーボードナビゲーション
- [ ] フォーカス管理
- [ ] スクリーンリーダー対応（基本的な部分）

## ヒエラルキー表示（左ペイン・Tailwind CSS）

- [ ] ツリービューの実装（Tailwind スタイル）
  - [ ] ネストした構造の表示（`ml-4` `pl-4` 等でインデント）
  - [ ] 折りたたみ/展開機能（`transform rotate-90` 等でアイコン回転）
  - [ ] ノードの選択同期（`bg-blue-100 dark:bg-blue-900` 等でハイライト）
- [ ] ドラッグ&ドロップ対応（Tailwind 視覚効果）
  - [ ] ツリービュー内でのノード移動（`border-2 border-dashed` 等）
  - [ ] キャンバスとの連携（`opacity-50` 等でドラッグ中表示）

## ノード詳細パネル（右ペイン・Tailwind CSS）

- [ ] ノード情報の表示（Tailwind フォーム）
  - [ ] 選択中ノードの詳細情報（`space-y-4` 等でレイアウト）
  - [ ] 編集可能なプロパティの表示（`@tailwindcss/forms` プラグイン使用）
- [ ] スタイル設定 UI（Tailwind コンポーネント）
  - [ ] 色設定パネル（カラーパレット、`grid grid-cols-6 gap-2` 等）
  - [ ] フォント設定パネル（`select` `input` 等、Tailwind フォームスタイル）
  - [ ] 形状設定パネル（ボタングループ、`flex space-x-2` 等）

## 設定・環境設定（Tailwind CSS）

- [ ] アプリケーション設定（Tailwind UI）
  - [ ] テーマ設定（ライト/ダーク切り替え、`dark:` モディファイア活用）
  - [ ] デフォルトスタイル設定（Tailwind カラーパレット選択）
  - [ ] キーボードショートカット設定（Tailwind モーダル・フォーム）
- [ ] 設定の永続化
  - [ ] LocalStorage を使った設定保存
  - [ ] 設定のインポート/エクスポート
- [ ] Tailwind ダークモード実装
  - [ ] `document.documentElement.classList.toggle('dark')` での切り替え
  - [ ] システム設定との連携（`prefers-color-scheme` 検出）
  - [ ] ダークモード状態の永続化

## テスト・デバッグ

### 基本テスト

- [ ] 手動テストスイートの作成
  - [ ] 機能別テストケース
  - [ ] ブラウザ互換性テスト
- [ ] エラーハンドリングの強化
  - [ ] try-catch 文の適切な配置
  - [ ] ユーザーフレンドリーなエラーメッセージ

### パフォーマンステスト

- [ ] 大量ノードでの動作確認
- [ ] メモリリーク検査
- [ ] 描画パフォーマンスの測定

## ドキュメント・ヘルプ

- [ ] ユーザーマニュアルの作成
  - [ ] 基本操作説明
  - [ ] ショートカット一覧
  - [ ] トラブルシューティング
- [ ] 開発者向けドキュメント
  - [ ] アーキテクチャ説明
  - [ ] API ドキュメント
  - [ ] 拡張方法の説明

## 最適化・改善

### パフォーマンス最適化（Tailwind CSS）

- [ ] CSS 最適化
  - [ ] Tailwind PurgeCSS による未使用クラス削除
  - [ ] カスタム CSS の最小化
  - [ ] @apply ディレクティブの最適使用
- [ ] 描画最適化
  - [ ] 不要な再描画の削減
  - [ ] debounce/throttle の適用
- [ ] メモリ最適化
  - [ ] イベントリスナーの適切な削除
  - [ ] オブジェクトの循環参照の回避

### ブラウザ互換性

- [ ] 主要ブラウザでの動作確認
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Edge
  - [ ] Safari（可能であれば）
- [ ] ポリフィルの追加（必要に応じて）

## デプロイメント準備（Tailwind CSS）

- [ ] ビルドプロセスの設定
  - [ ] Tailwind CSS の本番ビルド（`--minify` フラグ）
  - [ ] PurgeCSS による未使用クラス削除の確認
  - [ ] JavaScript の最小化
- [ ] 静的ホスティング対応
  - [ ] GitHub Pages 設定
  - [ ] Netlify/Vercel 設定（オプション）
  - [ ] ビルド済みファイルの最適化確認

---

## 開発スケジュール目安（Bun + Tailwind CSS 環境）

### フェーズ 1: 基盤構築（0.5-1 週間、Tailwind により短縮）

- Bun + Tailwind CSS プロジェクトセットアップ
- TypeScript 環境設定・型定義作成
- Tailwind CSS 設定とコンポーネント定義
- 基本画面・レイアウト（Tailwind クラスにより高速化）

### フェーズ 2: コア機能実装（1-1.5 週間）

- d3.js 描画機能（TypeScript 対応）
- 基本的なノード操作
- ファイル操作の基本部分
- Tailwind UI コンポーネントの実装

### フェーズ 3: 高度な機能（0.5-1 週間、UI 実装が効率化）

- キーボードショートカット
- ユーザビリティ向上（Tailwind アニメーション等）
- ヒエラルキー表示・詳細パネル（Tailwind フォーム活用）

### フェーズ 4: 仕上げ・最適化（0.5 週間）

- Bun テストランナーでのテスト・デバッグ
- Tailwind PurgeCSS + Bun ビルドでの最適化
- ドキュメント作成

**総開発期間: 2.5-4 週間**（Tailwind CSS により UI 開発が大幅効率化）

---

## Bun + Tailwind CSS 使用による変更点と利点

### 追加されるメリット（Tailwind CSS）

- **UI 開発速度**: utility-first による高速プロトタイピング
- **レスポンシブ対応**: ブレイクポイントの自動管理
- **ダークモード**: `dark:` モディファイアによる簡単実装
- **一貫性**: デザインシステムの自動的な統一
- **保守性**: CSS の肥大化問題の解消
- **カスタマイズ性**: tailwind.config.js による柔軟な設定

### Tailwind CSS による改善点

- **CSS 記述量**: 80-90%削減（utility クラス使用）
- **レスポンシブ実装**: 手動ブレイクポイント不要
- **テーマ切り替え**: ダークモードが標準機能
- **コンポーネント化**: @apply ディレクティブによる再利用
- **デバッグ効率**: ブラウザ検証ツールでの直接編集

### 推奨 Bun + Tailwind CSS 設定例

#### package.json スクリプト（Tailwind 統合）

```json
{
  "scripts": {
    "dev": "concurrently \"bun css:watch\" \"bun run --watch src/main.ts\"",
    "css:watch": "tailwindcss -i public/css/input.css -o public/css/output.css --watch",
    "css:build": "tailwindcss -i public/css/input.css -o public/css/output.css --minify",
    "build": "bun css:build && bun build src/main.ts --outdir dist --minify --splitting --target browser",
    "preview": "bun run build && bun serve dist",
    "test": "bun test"
  }
}
```

#### tailwind.config.js（マインドマップ最適化）

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,js}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        mindmap: {
          node: "#3B82F6",
          edge: "#6B7280",
          selected: "#EF4444",
          hover: "#10B981",
        },
      },
      animation: {
        "node-pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "edge-draw": "draw 0.5s ease-in-out",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

#### input.css（Tailwind ディレクティブ）

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors;
  }

  .mindmap-node {
    @apply cursor-pointer transition-all duration-200 hover:scale-105;
  }

  .sidebar-panel {
    @apply bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### 開発時間への影響（詳細）

#### 大幅短縮される部分（-50-70%）

- **レイアウト実装**: CSS Grid/Flexbox が utility クラス
- **レスポンシブ**: `sm:` `md:` `lg:` で自動対応
- **ダークモード**: `dark:` モディファイアで即座に実装
- **ホバー効果**: `hover:` モディファイアで簡単
- **アニメーション**: `transition-` `animate-` で高速実装
- **フォーム**: @tailwindcss/forms で統一スタイル

#### 新たに追加される工程（+10-15%）

- **Tailwind 設定**: tailwind.config.js の詳細設定
- **コンポーネント定義**: @apply ディレクティブでの抽象化
- **カラーパレット**: プロジェクト専用色の定義

#### 最終的な効果

- **UI 開発効率**: 従来比 2-3 倍向上
- **保守性**: CSS 管理コストの大幅削減
- **一貫性**: デザインの自動統一
- **ファイルサイズ**: PurgeCSS により最適化

### Tailwind CSS が特に効果的な部分

1. **3 ペインレイアウト**: Grid クラスで瞬時に実装
2. **レスポンシブ対応**: ブレイクポイント管理が自動
3. **ダークモード**: システム連携が標準機能
4. **ツールバー・メニュー**: コンポーネントライブラリ豊富
5. **モーダル・通知**: トランジション効果が簡単
6. **フォーム**: 統一されたスタイルが自動適用

**結論**: Tailwind CSS の導入により、**UI 実装フェーズが 1-2 週間短縮**され、**保守性と一貫性が大幅に向上**します。現代的な Web 開発としては強く推奨される構成です。
