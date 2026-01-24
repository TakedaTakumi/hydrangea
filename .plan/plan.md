# マインドマップ作成サービス開発計画書

## プロジェクト概要

ブラウザ完結型のマインドマップ作成サービスのフロントエンド開発。
サーバーを使用せず、ReactとTypeScript、ReactFlowを用いて実装する。
パッケージマネージャーにはpnpmを使用。

---

## 決めるべき事項

### 技術スタック

- **フレームワーク**: React + TypeScript
- **マインドマップ描画**: ReactFlow
- **ビルドツール**: Vite
- **パッケージマネージャー**: pnpm
- **データ永続化**: localStorage のみ
- **スタイリング**: CSS（または必要に応じてインラインスタイル）

### 機能範囲の明確化

#### 必須機能
- ノードの追加・削除・編集
- ノード間の接続線の自動表示
- ドラッグによるノード位置調整
- ReactFlow標準のズーム・パン操作
- ダブルクリックまたはボタンクリックでのテキスト編集
- localStorageへの自動保存・読み込み

#### オプション機能
- データのエクスポート・インポート（JSON形式）
- キーボードショートカット
- ノードの色変更
- 元に戻す・やり直す機能

### UI/UXの基本設計

- **メイン表示領域**: ReactFlowキャンバス
- **ツールバー**:
  - 新規ノード追加ボタン
  - 選択ノード削除ボタン
  - データクリアボタン
- **ノードのスタイル**: 形状、色、サイズを定義
- **マインドマップの構造**: ツリー型または自由配置型

### データ構造

```typescript
// ReactFlowの標準型を使用
interface MindMapData {
  nodes: Node[];
  edges: Edge[];
}

// カスタムノードデータの型定義
interface CustomNodeData {
  label: string;
  // 必要に応じて追加（色、アイコンなど）
}
```

---

## 開発手順

### 1. 環境構築

```bash
# pnpmのインストール（未インストールの場合）
npm install -g pnpm

# プロジェクト作成
pnpm create vite mindmap-app --template react-ts
cd mindmap-app

# 依存関係インストール
pnpm install
pnpm add reactflow

# 開発サーバー起動
pnpm run dev
```

### 2. 型定義の準備

**ファイル**: `src/types.ts`

```typescript
import { Node, Edge } from 'reactflow';

export interface MindMapData {
  nodes: Node[];
  edges: Edge[];
}

export interface CustomNodeData {
  label: string;
}
```

**目的**: プロジェクト全体で使用する型を一元管理

### 3. localStorage操作機能の実装

**ファイル**: `src/storage.ts`

```typescript
import { MindMapData } from './types';

const STORAGE_KEY = 'mindmap-data';

export const saveToStorage = (data: MindMapData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadFromStorage = (): MindMapData | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
```

**実装内容**:
- データの保存
- データの読み込み
- データのクリア

### 4. 基本的なReactFlowコンポーネントの実装

**ファイル**: `src/App.tsx`

```typescript
import { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow';
import 'reactflow/dist/style.css';

// 初期データ
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: 'ルートノード' },
    position: { x: 250, y: 0 },
  },
];

const initialEdges: Edge[] = [];

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default App;
```

**実装内容**:
- ReactFlowの基本セットアップ
- 初期ノードの表示
- ノードとエッジの状態管理
- ズーム・パン・ドラッグ機能（ReactFlow標準）

### 5. ノード操作機能の実装

**`App.tsx`に追加**:

```typescript
// ノード追加
const handleAddNode = useCallback(() => {
  const newNode: Node = {
    id: `${Date.now()}`,
    data: { label: '新しいノード' },
    position: {
      x: Math.random() * 500,
      y: Math.random() * 500
    },
  };
  setNodes((nds) => [...nds, newNode]);
}, []);

// ノード削除
const handleDeleteNode = useCallback(() => {
  setNodes((nds) => nds.filter((node) => !node.selected));
  setEdges((eds) => eds.filter((edge) => {
    const sourceExists = nodes.some((node) => node.id === edge.source);
    const targetExists = nodes.some((node) => node.id === edge.target);
    return sourceExists && targetExists;
  }));
}, [nodes]);

// エッジ追加（ノード接続）
const onConnect = useCallback(
  (connection) => setEdges((eds) => [...eds, connection]),
  []
);
```

**実装内容**:
- 新規ノードの追加
- 選択ノードの削除
- ノード間の接続

### 6. テキスト編集機能の実装

**オプション1**: ReactFlowの標準ノードを使用し、ノードデータを直接更新

```typescript
const handleNodeLabelChange = useCallback((nodeId: string, newLabel: string) => {
  setNodes((nds) =>
    nds.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, label: newLabel } }
        : node
    )
  );
}, []);
```

**オプション2**: カスタムノードコンポーネントの作成

**ファイル**: `src/components/CustomNode.tsx`

```typescript
import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const CustomNode = ({ data, id }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // 親コンポーネントに変更を通知する処理
  };

  return (
    <div onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Top} />
      {isEditing ? (
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          autoFocus
        />
      ) : (
        <div>{label}</div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default memo(CustomNode);
```

### 7. データ永続化の統合

**`App.tsx`に追加**:

```typescript
import { useEffect } from 'react';
import { saveToStorage, loadFromStorage, clearStorage } from './storage';

// コンポーネント内
useEffect(() => {
  // 初回読み込み
  const saved = loadFromStorage();
  if (saved) {
    setNodes(saved.nodes);
    setEdges(saved.edges);
  }
}, []);

useEffect(() => {
  // 変更時に自動保存
  if (nodes.length > 0 || edges.length > 0) {
    saveToStorage({ nodes, edges });
  }
}, [nodes, edges]);

// データクリア機能
const handleClearData = useCallback(() => {
  clearStorage();
  setNodes(initialNodes);
  setEdges(initialEdges);
}, []);
```

**実装内容**:
- ページ読み込み時にlocalStorageから復元
- ノード・エッジ変更時に自動保存
- データクリア機能

### 8. UIの整備

**ファイル**: `src/components/Toolbar.tsx`

```typescript
interface ToolbarProps {
  onAddNode: () => void;
  onDeleteNode: () => void;
  onClearData: () => void;
}

const Toolbar = ({ onAddNode, onDeleteNode, onClearData }: ToolbarProps) => {
  return (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 4,
      background: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      <button onClick={onAddNode}>ノード追加</button>
      <button onClick={onDeleteNode}>ノード削除</button>
      <button onClick={onClearData}>データクリア</button>
    </div>
  );
};

export default Toolbar;
```

**`App.tsx`でToolbarを使用**:

```typescript
import Toolbar from './components/Toolbar';

// JSX内
<div style={{ width: '100vw', height: '100vh' }}>
  <Toolbar
    onAddNode={handleAddNode}
    onDeleteNode={handleDeleteNode}
    onClearData={handleClearData}
  />
  <ReactFlow
    // ...
  />
</div>
```

### 9. テストとデバッグ

#### 確認項目
- ノードの追加・削除が正常に動作するか
- エッジの接続が正しく行われるか
- テキスト編集が機能するか
- ドラッグ、ズーム、パンが動作するか
- localStorageへの保存・読み込みが正常か
- ブラウザをリロードしてもデータが保持されるか
- エッジケースの動作（ノードが0個の時など）

#### デバッグ方法
- ブラウザの開発者ツールでlocalStorageを確認
- React Developer Toolsで状態を監視
- コンソールでエラーを確認

### 10. オプション機能の追加

#### エクスポート機能

```typescript
const handleExport = useCallback(() => {
  const data = { nodes, edges };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mindmap.json';
  link.click();
  URL.revokeObjectURL(url);
}, [nodes, edges]);
```

#### インポート機能

```typescript
const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (error) {
      console.error('Invalid JSON file', error);
    }
  };
  reader.readAsText(file);
}, []);
```

---

## 推奨ファイル構成

```
mindmap-app/
├── src/
│   ├── App.tsx              # メインコンポーネント
│   ├── main.tsx             # エントリーポイント
│   ├── types.ts             # 型定義
│   ├── storage.ts           # localStorage操作
│   ├── components/
│   │   ├── CustomNode.tsx   # カスタムノード（必要時）
│   │   └── Toolbar.tsx      # ツールバー
│   ├── App.css              # スタイル
│   └── vite-env.d.ts        # Vite型定義（自動生成）
├── package.json
├── pnpm-lock.yaml           # pnpmのロックファイル
├── tsconfig.json
├── vite.config.ts
└── index.html
```

---

## 開発の進め方（推奨順序）

1. **環境構築** - Viteプロジェクト作成、ReactFlowインストール
2. **型定義** - types.tsで基本的な型を定義
3. **表示機能** - ReactFlowで初期ノードを表示
4. **ノード追加** - ボタンクリックで新規ノード作成
5. **ノード削除** - 選択ノードの削除機能
6. **エッジ作成** - ノード間の接続機能
7. **テキスト編集** - ノードのラベル編集
8. **localStorage** - 保存・読み込み機能
9. **UI改善** - ツールバー、スタイリング
10. **追加機能** - 必要に応じてオプション機能

---

## pnpm使用のメリット

### ディスク容量の節約
- pnpmはハードリンクを使用してnode_modulesを管理
- 同じパッケージを複数のプロジェクトで共有
- ディスク容量を大幅に削減

### 高速なインストール
- npmやyarnよりも高速
- 既存のキャッシュを効率的に活用

### 厳格な依存関係管理
- フラットなnode_modulesではなく、階層構造を維持
- 宣言されていない依存関係への不正アクセスを防止

### 主なコマンド

```bash
pnpm install          # 依存関係のインストール
pnpm add <package>    # パッケージの追加
pnpm remove <package> # パッケージの削除
pnpm run <script>     # スクリプトの実行
pnpm update           # パッケージの更新
```

---

## TypeScript使用のポイント

### ReactFlowの型を活用
- `Node`, `Edge`, `NodeProps`, `OnNodesChange`, `OnEdgesChange`などの型をインポートして使用
- カスタムノードデータの型を明確に定義

### localStorage操作での注意
```typescript
// 型アサーションに注意
const saved = localStorage.getItem(STORAGE_KEY);
const data: MindMapData | null = saved ? JSON.parse(saved) : null;
```

### エディタの補完を活用
- TypeScriptの型情報により、エディタが自動補完やエラー表示を提供
- ReactFlowのAPIを探索する際に特に有用

### エラーハンドリング
```typescript
try {
  const data = JSON.parse(storedData);
  // 型チェック
  if (isValidMindMapData(data)) {
    setNodes(data.nodes);
    setEdges(data.edges);
  }
} catch (error) {
  console.error('Failed to load data', error);
}
```

---

## まとめ

この計画書に従うことで、型安全性を保ちながら、シンプルで拡張しやすいブラウザ完結型マインドマップアプリケーションを構築できます。

### 主な利点
- サーバー不要でブラウザのみで動作
- TypeScriptによる型安全性
- ReactFlowによる充実した描画機能
- localStorageによるデータ永続化
- pnpmによる効率的なパッケージ管理
- 段階的な機能追加が可能

### 次のステップ
1. この計画書に従って開発を開始
2. 基本機能の実装と動作確認
3. ユーザーフィードバックに基づく改善
4. 将来的にはバックエンド連携やリアルタイム共同編集などの拡張も検討可能
