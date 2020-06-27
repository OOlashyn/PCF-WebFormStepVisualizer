import * as React from "react";
import styled from "styled-components";
import { INodeDefaultProps } from "@mrblenny/react-flow-chart";

const DarkBox = styled.div`
  position: absolute;
  padding: 30px;
  background: #3e3e3e;
  color: white;
  border-radius: 10px;
`;

const Circle = styled.div`
  position: absolute;
  width: 150px;
  height: 150px;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #d30000;
  color: white;
  border-radius: 50%;
`;

const ConditionNode = styled.div`
  background-color: #dadada;
  width: 200px;
  height: 200px;
  display: block;
  word-break: break-all;
  transform: rotate(45deg);
`;

/**
 * Create the custom component,
 * Make sure it has the same prop signature
 * You'll need to add {...otherProps} so the event listeners are added to your component
 */
export const CustomNode = React.forwardRef(
  (
    { node, children, ...otherProps }: INodeDefaultProps,
    ref: React.Ref<HTMLDivElement>
  ) => {
    if (node.type === "custom") {
      return (
        <ConditionNode ref={ref} {...otherProps}>
          {children}
        </ConditionNode>
      );
    } else {
      return (
        <DarkBox ref={ref} {...otherProps}>
          {children}
        </DarkBox>
      );
    }
  }
);
