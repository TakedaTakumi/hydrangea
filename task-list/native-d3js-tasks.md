# マインドマップ Web ツール開発タスクリスト（Bun + ネイティブ HTML+TS+CSS+d3.js 版）

## 概要

Bun をビルドツールとして使用し、ネイティブ HTML+TypeScript+CSS+d3.js でマインドマップ Web ツールを開発する場合のタスクリスト。最終成果物は軽量な静的 Web アプリケーション。

## 想定するプロジェクト構成（Bun 環境）

```
mindmap-simple-tool/
├── package.json                    # Bun パッケージ設定
├── bun.lockb                       # Bun ロックファイル
├── bunfig.toml                     # Bun 設定ファイル（オプション）
├── tsconfig.json                   # TypeScript 設定
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
│   │   ├── main.css               # メインスタイル
│   │   ├── layout.css             # レイアウト専用スタイル
│   │   ├── components.css         # UI コンポーネントスタイル
│   │   ├── mindmap.css            # マインドマップ専用スタイル
│   │   └── themes/
│   │       ├── light.css          # ライトテーマ
│   │       └── dark.css           # ダークテーマ
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

### 主要ファイルの役割（Bun 環境）

#### プロジェクト設定

- `package.json`: Bun パッケージ管理、スクリプト定義
- `bun.lockb`: Bun ロックファイル（自動生成）
- `bunfig.toml`: Bun 設定ファイル（オプション）
- `tsconfig.json`: TypeScript 設定

#### HTML 構造

- `index.html`: 3 ペイン構成のメインレイアウト（開発用）
- `dist/index.html`: ビルド済み HTML（デプロイ用）

#### CSS 構成

- `public/css/main.css`: グローバルスタイル、リセット CSS
- `public/css/layout.css`: 3 ペインレイアウト、グリッドシステム
- `public/css/components.css`: ボタン、フォーム、モーダル等の UI コンポーネント
- `public/css/mindmap.css`: SVG ノード、エッジ、アニメーション等のマインドマップ専用スタイル

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
- **js-yaml**: `bun add js-yaml` で YAML 解析ライブラリ
- **html2canvas**: `bun add html2canvas` で画像エクスポート機能（オプション）

#### 開発・テスト環境

- **samples/**: テストデータ、テンプレート
- **docs/**: 技術文書
- **tests/**: Bun 内蔵テストランナーでのテストコード

### ファイルサイズ目安（Bun ビルド後）

- **HTML**: ~2-3KB
- **CSS**: ~15-20KB（圧縮済み）
- **TypeScript ソース**: ~60-80KB（開発時のみ）
- **JavaScript（Bun バンドル済み）**: ~40-60KB（圧縮済み、ライブラリ含む）
- **d3.js（バンドル内）**: ~25-35KB（必要モジュールのみ、Tree-shaking 済み）
- **総サイズ**: ~80-120KB（Bun 最適化により軽量）

## プロジェクトセットアップ

- [ ] プロジェクト構造の作成
  - [ ] `bun init` でプロジェクト初期化
  - [ ] ディレクトリ構造の設計（上記 Bun 構成に従って作成）
  - [ ] index.html の作成（3 ペインレイアウトの基本構造）
  - [ ] CSS ファイルの構成（public/css/ 配下に配置）
  - [ ] TypeScript モジュールの構成（src/ 配下に配置）
  - [ ] README.md の作成
  - [ ] .gitignore の設定（node_modules、dist、bun.lockb を含める）
  - [ ] bunfig.toml の設定（オプション）
  - [ ] CSS ファイルの構成（main.css、layout.css、components.css、mindmap.css）
  - [ ] TypeScript モジュールの構成（types、core、mindmap、ui、features、utils、config フォルダ）
  - [ ] README.md の作成
  - [ ] .gitignore の設定
- [ ] d3.js ライブラリの導入
  - **【Bun 環境】** Bun パッケージマネージャーでの導入
    - [ ] `bun add d3` で d3.js 導入
    - [ ] `bun add -d @types/d3` で型定義導入
    - [ ] `bun add js-yaml && bun add -d @types/js-yaml` で YAML ライブラリ導入
    - [ ] `bun add html2canvas`（オプション、画像エクスポート用）
  - **【従来環境（参考）】** CDN またはローカルファイルでの導入
    - [ ] 必要な d3 モジュールのダウンロード
      - [ ] d3-selection.min.js
      - [ ] d3-zoom.min.js
      - [ ] d3-hierarchy.min.js
      - [ ] d3-drag.min.js
      - [ ] d3-transition.min.js
    - [ ] TypeScript 型定義の導入
      - [ ] @types/d3 または個別型定義ファイル
      - [ ] d3 関連モジュールの型定義設定
    - [ ] js-yaml ライブラリの導入（lib/js-yaml.min.js）
    - [ ] js-yaml の型定義導入（@types/js-yaml または独自定義）
    - [ ] html2canvas の導入（オプション、画像エクスポート用）
- [ ] 開発環境の設定
  - **【Bun 環境】** 現代的な開発環境
    - [ ] `bun init` でプロジェクト初期化
    - [ ] `bun add -d typescript @types/node` で TypeScript 環境設定
    - [ ] tsconfig.json の作成（Bun 最適化設定）
    - [ ] package.json スクリプトの設定
      - [ ] `bun run dev` で開発サーバー起動（Bun 内蔵）
      - [ ] `bun run build` でビルド実行（Bun 内蔵バンドラー）
      - [ ] `bun run preview` でビルド結果プレビュー
      - [ ] `bun test` でテスト実行（Bun 内蔵テストランナー）
    - [ ] bunfig.toml での詳細設定（オプション）
    - [ ] ESLint + Prettier の設定（`bun add -d eslint prettier`）
  - **【従来環境（参考）】** 手動セットアップ
    - [ ] TypeScript の設定
      - [ ] TypeScript コンパイラのインストール（npm install typescript）
      - [ ] tsconfig.json の作成と設定
      - [ ] ES6 モジュール、ターゲットブラウザの設定
      - [ ] 型チェックの厳密度設定
    - [ ] ローカルサーバーの設定（live-server、Python http.server、Node.js serve 等）
    - [ ] package.json の作成（開発依存関係、TypeScript 関連スクリプト定義）
    - [ ] コンパイル・ビルドスクリプトの設定
      - [ ] TypeScript ウォッチモード（tsc --watch）
      - [ ] 自動ビルドスクリプト
    - [ ] ESLint の設定（オプション、TypeScript 対応）
    - [ ] Prettier の設定（オプション、TypeScript 対応）
    - [ ] VS Code 設定（TypeScript デバッグ、IntelliSense 設定）

## 基本画面・レイアウト実装

- [ ] HTML の基本構造作成
  - [ ] ヘッダー部分
  - [ ] 3 ペイン構成のレイアウト
    - [ ] 左ペイン: ツリービュー（ヒエラルキー表示）
    - [ ] 中央ペイン: d3.js キャンバス
    - [ ] 右ペイン: ノード詳細・設定
- [ ] CSS レイアウトの実装
  - [ ] Flexbox/CSS Grid を使った 3 ペインレイアウト
  - [ ] レスポンシブデザインの基本設定
  - [ ] ペインのリサイズ機能（オプション）
- [ ] 基本的な UI 要素の作成
  - [ ] ツールバーの実装
  - [ ] メニューの実装
  - [ ] モーダルダイアログの基盤

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

- [ ] ノードスタイル変更機能
  - [ ] 色変更機能（背景色、文字色、境界色）
  - [ ] 形状変更機能
  - [ ] フォントサイズ・スタイル変更
- [ ] カラーピッカーの実装
  - [ ] プリセットカラーパレット
  - [ ] カスタムカラー選択

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

### 視覚的フィードバック

- [ ] ローディング表示
  - [ ] ファイル読み込み時
  - [ ] 大きなマップの描画時
- [ ] 通知システム
  - [ ] 操作完了の通知
  - [ ] エラーメッセージの表示
  - [ ] 警告メッセージの表示
- [ ] プログレス表示
  - [ ] 時間のかかる処理の進捗表示

### アクセシビリティ

- [ ] キーボードナビゲーション
- [ ] フォーカス管理
- [ ] スクリーンリーダー対応（基本的な部分）

## ヒエラルキー表示（左ペイン）

- [ ] ツリービューの実装
  - [ ] ネストした構造の表示
  - [ ] 折りたたみ/展開機能
  - [ ] ノードの選択同期
- [ ] ドラッグ&ドロップ対応
  - [ ] ツリービュー内でのノード移動
  - [ ] キャンバスとの連携

## ノード詳細パネル（右ペイン）

- [ ] ノード情報の表示
  - [ ] 選択中ノードの詳細情報
  - [ ] 編集可能なプロパティの表示
- [ ] スタイル設定 UI
  - [ ] 色設定パネル
  - [ ] フォント設定パネル
  - [ ] 形状設定パネル

## 設定・環境設定

- [ ] アプリケーション設定
  - [ ] テーマ設定（ライト/ダーク）
  - [ ] デフォルトスタイル設定
  - [ ] キーボードショートカット設定
- [ ] 設定の永続化
  - [ ] LocalStorage を使った設定保存
  - [ ] 設定のインポート/エクスポート

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

### パフォーマンス最適化

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

## デプロイメント準備

- [ ] ビルドプロセスの設定
  - [ ] ファイルの最小化
  - [ ] CSS/JS の結合
- [ ] 静的ホスティング対応
  - [ ] GitHub Pages 設定
  - [ ] Netlify/Vercel 設定（オプション）

---

## 開発スケジュール目安（Bun 環境）

### フェーズ 1: 基盤構築（1 週間）

- Bun プロジェクトセットアップ
- TypeScript 環境設定・型定義作成
- 基本画面・レイアウト
- 状態管理システム基盤

### フェーズ 2: コア機能実装（1.5 週間）

- d3.js 描画機能（TypeScript 対応）
- 基本的なノード操作
- ファイル操作の基本部分

### フェーズ 3: 高度な機能（1 週間）

- キーボードショートカット
- ユーザビリティ向上
- ヒエラルキー表示・詳細パネル

### フェーズ 4: 仕上げ・最適化（0.5 週間）

- Bun テストランナーでのテスト・デバッグ
- Bun ビルドでのパフォーマンス最適化
- ドキュメント作成

**総開発期間: 4-4.5 週間**（Bun の高速化により短縮）

---

## Bun 使用による変更点

### 追加されるメリット

- **開発速度**: Bun の高速ビルド・インストール
- **設定簡素化**: 内蔵機能により設定ファイル削減
- **メモリ効率**: 低メモリ使用量
- **TypeScript ネイティブサポート**: 追加設定不要

### 従来環境からの改善点

- **セットアップ時間**: 大幅短縮（設定が簡単）
- **ビルド時間**: 5-10 倍高速化
- **パッケージインストール**: 数倍高速化
- **開発サーバー**: より高速で安定

### 推奨 Bun + TypeScript 設定例

#### package.json スクリプト

```json
{
  "scripts": {
    "dev": "bun run --watch src/main.ts",
    "build": "bun build src/main.ts --outdir dist --minify --splitting --target browser",
    "preview": "bun run build && bun serve dist",
    "test": "bun test",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src"
  }
}
```

#### tsconfig.json（Bun 最適化）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["DOM", "ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### bunfig.toml（オプション）

```toml
[install]
cache = true
exact = true

[dev]
port = 3000

[build]
target = "browser"
format = "esm"
minify = true
splitting = true
```

---

## Bun 環境での開発メリット

### Bun の強力な内蔵機能

- **高速パッケージマネージャー**: npm/yarn の数倍の速度
- **内蔵バンドラー**: Webpack/Vite 不要、設定レス
- **内蔵テストランナー**: Jest 互換、追加設定不要
- **内蔵 TypeScript サポート**: 追加設定なしで TypeScript 実行
- **内蔵開発サーバー**: ホットリロード、自動リフレッシュ
- **Tree-shaking**: 使用しないコードの自動削除

### 開発体験の向上

- **依存関係管理**: `bun add` で高速インストール
- **ビルド速度**: 従来ツールの 5-10 倍高速
- **メモリ効率**: 低メモリ使用量
- **型安全性**: 強力な TypeScript 統合
- **開発ツール**: ESLint、Prettier 等の統合

### 最終成果物の軽量性

- **静的ファイル**: dist フォルダの内容をそのままデプロイ
- **最適化**: Bun の自動最適化でファイルサイズ削減
- **依存関係**: d3.js 等は全て最適化されてバンドル
- **互換性**: 同じブラウザサポート

### 開発時間への影響

- **初期セットアップ**: 30 分程度（設定が簡単）
- **日々の開発**: -30-40%時間短縮（ビルド高速化効果）
- **デバッグ**: より効率的（ソースマップ、型チェック）
- **メンテナンス**: 大幅改善（依存関係管理）

### 推奨 Bun 設定例

#### package.json スクリプト

```json
{
  "scripts": {
    "dev": "bun run --watch src/main.ts",
    "build": "bun build src/main.ts --outdir dist --minify --splitting --target browser",
    "preview": "bun run build && bun serve dist",
    "test": "bun test",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src"
  }
}
```

#### tsconfig.json（Bun 最適化）

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["DOM", "ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true,
    "types": ["bun-types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### bunfig.toml（オプション）

```toml
[install]
cache = true
exact = true

[dev]
port = 3000

[build]
target = "browser"
format = "esm"
minify = true
splitting = true
```
