import { Icon } from "@fluentui/react/lib/Icon";
import * as React from "react";
import styled from "styled-components";

const DragNode = styled.div`
  display: flex;
  width: 150px;
  height: 50px;
  align-items: center;
  justify-content: center;
`;

export const DragNodeBody = ({ data }: any) => {
  return (
    <DragNode>
      <div className="node-text custom-drag-handle">{data.label}</div>
      <div className="node-controls">
        <Icon
          iconName="InfoSolid"
          onClick={() => data.setSelected()}
          className="node-controls__icon"
        />
      </div>
    </DragNode>
  );
};
