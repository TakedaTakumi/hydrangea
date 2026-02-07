import type { Edge, Node } from 'reactflow';

export interface MindMapData {
  nodes: Node[];
  edges: Edge[];
}

export interface CustomNodeData {
  label: string;
  isEditing?: boolean;
}
