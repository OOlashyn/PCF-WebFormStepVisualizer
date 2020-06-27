import * as React from "react";

import { initializeIcons } from "@uifabric/icons";
initializeIcons();

import { IChart, FlowChartWithState } from "@mrblenny/react-flow-chart";
import { Page } from "./Page";
import styled from "styled-components";
import { ChartContext } from "./ChartContext";
import { NodeInnerCustom } from "./NodeInnerCustom";
import { Sidebar, ISelectedEntityProps } from "./Sidebar";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export interface IAppProps {
  initialChart: IChart;
  openRecord: Function;
}

export const App = (props: IAppProps) => {
  const [selected, setSelected] = React.useState<Partial<ISelectedEntityProps>>(
    {}
  );

  console.log("App selected", selected);

  return (
    <Page>
      <ChartContext.Provider value={{ setSelected: setSelected }}>
        <Content>
          <FlowChartWithState
            initialValue={props.initialChart}
            Components={{
              NodeInner: NodeInnerCustom,
            }}
          />
        </Content>
      </ChartContext.Provider>
      <Sidebar openRecord={props.openRecord} selected={selected}></Sidebar>
    </Page>
  );
};
