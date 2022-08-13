import * as React from "react";
import { Handle, Position } from "react-flow-renderer";
import { DragNodeBody } from "./DragNodeBody";

function DragHandleNode({
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
      />
    </>
  );
}

export default React.memo(DragHandleNode);
