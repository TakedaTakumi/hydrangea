import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
type  Node,
type  Edge,
type NodeTypes,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import type { MindMapData, Theme } from './types';
import { saveToStorage, loadFromStorage, clearStorage, saveTheme, loadTheme, detectSystemTheme } from './storage';
import CustomNode from './components/CustomNode';

// ノードタイプ定義
const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// 初期データ
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    data: { label: 'ルートノード' },
    position: { x: 250, y: 0 },
  },
];

const initialEdges: Edge[] = [];

function App() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [theme, setTheme] = useState<Theme>('dark');

  // ページ読み込み時にlocalStorageからデータを復元
  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      setNodes(savedData.nodes);
      setEdges(savedData.edges);
    }
  }, []);

  // テーマの初期化（保存値またはシステム設定）
  useEffect(() => {
    const savedTheme = loadTheme();
    const initialTheme = savedTheme || detectSystemTheme();
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // テーマ変更時にDOMに反映
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  // ノード編集イベントのリスナー
  useEffect(() => {
    const handleNodeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { nodeId, newLabel } = customEvent.detail;
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node
        )
      );
    };

    window.addEventListener('nodeUpdate', handleNodeUpdate);
    return () => window.removeEventListener('nodeUpdate', handleNodeUpdate);
  }, []);

  // ノードまたはエッジが変更されたときに自動保存
  useEffect(() => {
    const data: MindMapData = { nodes, edges };
    saveToStorage(data);
  }, [nodes, edges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  // ノード追加
  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'custom',
      data: { label: '新しいノード' },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, []);

  // ノード削除
  const handleDeleteNode = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) {
      alert('削除するノードを選択してください');
      return;
    }

    const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target)
      )
    );
  }, [nodes]);

  // データクリア
  const handleClearData = useCallback(() => {
    if (window.confirm('すべてのデータをクリアしますか？')) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      clearStorage();
    }
  }, []);

  // テーマ切り替え
  const handleToggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
      >
        <Controls />
        <Background />
      </ReactFlow>

      {/* ツールバー */}
      <div className="toolbar">
        <button
          onClick={handleAddNode}
          className="toolbar-button toolbar-button-add"
        >
          ノード追加
        </button>
        <button
          onClick={handleDeleteNode}
          className="toolbar-button toolbar-button-delete"
        >
          削除
        </button>
        <button
          onClick={handleClearData}
          className="toolbar-button toolbar-button-clear"
        >
          クリア
        </button>
        <button
          onClick={handleToggleTheme}
          className="toolbar-button toolbar-button-theme"
          title={`${theme === 'dark' ? 'ライト' : 'ダーク'}モードに切り替え`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  );
}

export default App;
