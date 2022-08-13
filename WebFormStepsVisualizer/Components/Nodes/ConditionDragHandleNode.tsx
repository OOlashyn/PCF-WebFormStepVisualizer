import * as React from "react";
import { Handle, Position } from "react-flow-renderer";
import { DragNodeBody } from "./DragNodeBody";

function ConditionDragHandleNode({
  data,
  isConnectable,
}: {
  data: any;
  isConnectable: boolean;
}) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <DragNodeBody data={data}/>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        id="next"
        style={{ left: 55 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        id="default"
        style={{ left: 95 }}
      />
    </>
  );
}

export default React.memo(ConditionDragHandleNode);
