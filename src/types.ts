import type { Node, Edge } from "reactflow";

export interface MindMapData {
	nodes: Node[];
	edges: Edge[];
}

export interface CustomNodeData {
	label: string;
}
