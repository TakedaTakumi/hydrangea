import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { CustomNodeData } from '../types';

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({ data, id }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (label.trim()) {
        // グローバルイベントでノードデータを更新する
        window.dispatchEvent(
          new CustomEvent('nodeUpdate', {
            detail: { nodeId: id, newLabel: label },
          })
        );
      }
      setIsEditing(false);
    }
  };

  const handleInputBlur = () => {
    if (label.trim()) {
      window.dispatchEvent(
        new CustomEvent('nodeUpdate', {
          detail: { nodeId: id, newLabel: label },
        })
      );
    } else {
      // キャンセル時は元に戻す
      setLabel(data.label);
    }
    setIsEditing(false);
  };

  return (
    <div className="custom-node">
      <Handle type="target" position={Position.Top} />
      {isEditing ? (
        <input
          autoFocus
          type="text"
          value={label}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          className="custom-node-input"
        />
      ) : (
        <div
          onDoubleClick={handleDoubleClick}
          className="custom-node-label"
        >
          {data.label}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default React.memo(CustomNode);
