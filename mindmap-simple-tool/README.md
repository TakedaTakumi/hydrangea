# マインドマップ Web ツール

Bun + TypeScript + Tailwind CSS + d3.js で作成されたマインドマップ Web ツール

## 技術スタック

- **ビルドツール**: Bun（高速ビルド・パッケージ管理）
- **言語**: TypeScript（厳密な型安全性）
- **CSS フレームワーク**: Tailwind CSS（utility-first、レスポンシブ、ダークモード）
- **データ可視化**: d3.js（SVG 描画、アニメーション）
- **データ形式**: YAML（設定・データ交換）

## 開発環境セットアップ

```bash
# 依存関係のインストール
bun install

# 開発サーバーの起動
bun run dev

# ビルド実行
bun run build

# テスト実行
bun test
```

## プロジェクト構造

```
mindmap-simple-tool/
├── src/                    # TypeScript ソースコード
│   ├── types/             # 型定義
│   ├── core/              # 状態管理・イベントシステム
│   ├── mindmap/           # d3.js 描画・レイアウト
│   ├── ui/                # ユーザーインターフェース
│   ├── features/          # 特定機能
│   ├── utils/             # 汎用ユーティリティ
│   └── config/            # 設定・定数
├── public/css/            # Tailwind CSS ファイル
├── samples/               # サンプルデータ・テンプレート
└── tests/                 # Bun テストランナー
```
