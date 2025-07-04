// d3-hierarchy 互換のマインドマップツリーサンプル
// 型: MindMapNodeTree
import type { MindMapNodeTree } from '../src/types/node';
import {
  DEFAULT_NODE_STYLE,
  DEFAULT_NODE_LAYOUT,
  DEFAULT_NODE_STATE,
  DEFAULT_NODE_METADATA,
} from '../src/types/node';

export const sampleMindMapTree: MindMapNodeTree = {
  id: 'node_01932b9d',
  text: 'ルートノード',
  parentId: null,
  children: [
    {
      id: 'node_01932b9e',
      text: '子ノードA',
      parentId: 'node_01932b9d',
      children: [],
      style: { ...DEFAULT_NODE_STYLE },
      layout: { ...DEFAULT_NODE_LAYOUT },
      state: { ...DEFAULT_NODE_STATE },
      metadata: { ...DEFAULT_NODE_METADATA },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'node_01932b9f',
      text: '子ノードB',
      parentId: 'node_01932b9d',
      children: [
        {
          id: 'node_01932b9g',
          text: '孫ノードB-1',
          parentId: 'node_01932b9f',
          children: [],
          style: { ...DEFAULT_NODE_STYLE },
          layout: { ...DEFAULT_NODE_LAYOUT },
          state: { ...DEFAULT_NODE_STATE },
          metadata: { ...DEFAULT_NODE_METADATA },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      style: { ...DEFAULT_NODE_STYLE },
      layout: { ...DEFAULT_NODE_LAYOUT },
      state: { ...DEFAULT_NODE_STATE },
      metadata: { ...DEFAULT_NODE_METADATA },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  style: { ...DEFAULT_NODE_STYLE },
  layout: { ...DEFAULT_NODE_LAYOUT },
  state: { ...DEFAULT_NODE_STATE },
  metadata: { ...DEFAULT_NODE_METADATA },
  createdAt: new Date(),
  updatedAt: new Date(),
};
