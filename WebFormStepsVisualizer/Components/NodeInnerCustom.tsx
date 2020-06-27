import * as React from "react";
import styled from "styled-components";
import {
    INodeInnerDefaultProps,
} from "@mrblenny/react-flow-chart";

import { ChartContext } from "./ChartContext";
import { ISelectedEntityProps } from "./Sidebar";

const Outer = styled.div`
  padding: 30px;
`;

export const NodeInnerCustom = ({ node, config }: INodeInnerDefaultProps) => {
    const { setSelected } = React.useContext(ChartContext);
  
    const handleClick = () => {
      if (setSelected) {
        let newSelectedEntityProps = {...node.properties} as ISelectedEntityProps;
        console.log("Handle CLick", newSelectedEntityProps);
        setSelected(newSelectedEntityProps);
      }
    };
  
    let condition;
  
    if (node.properties.condition) {
      condition = <p>{node.properties.condition}</p>;
    }
  
    return (
      <Outer onClick={handleClick}>
        <p>{node.properties.title}</p>
        {condition}
      </Outer>
    );
  };