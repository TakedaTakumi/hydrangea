import { describe, it, expect } from 'bun:test';
import { MindMapStateManager } from '../../../src/core/state-manager';

describe('MindMapStateManagerの初期化', () => {
  it('初期化時にルートノードが必ず生成される', () => {
    const manager = new MindMapStateManager();
    const nodes = manager.getNodes();
    const rootId = manager.getState().rootNodeId;

    expect(nodes.size).toBeGreaterThan(0);
    expect(rootId).not.toBeNull();
    const root = nodes.get(rootId!);
    expect(root).toBeDefined();
    expect(root?.parentId).toBeNull();
    expect(root?.text).toBe('ルートノード');
  });
});
