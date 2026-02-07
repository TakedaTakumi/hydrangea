import type { Edge, Node } from 'reactflow';

export type Theme = 'light' | 'dark';

export interface MindMapData {
  nodes: Node[];
  edges: Edge[];
}

export interface CustomNodeData {
  label: string;
  isEditing?: boolean;
}
