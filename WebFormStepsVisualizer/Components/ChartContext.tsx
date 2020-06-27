import * as React from "react"
import { INode } from "@mrblenny/react-flow-chart";

export interface IChartContextProps {
    setSelected: Function
}

export const ChartContext = React.createContext<Partial<IChartContextProps>>(
    {}
);;