import * as React from "react";

import { Page } from "./Page";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";
import ReactFlow, {
  Node,
  Edge,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
} from "react-flow-renderer";
import {
  IAppActions,
  IEntity,
  WebFormStep,
  WebFormStepType,
} from "../utils/Interfaces";
import ConditionDragHandleNode from "./Nodes/ConditionDragHandleNode";
import DragHandleNode from "./Nodes/DragHandleNode";
import dagre from "dagre";
import { PrimaryButton } from "@fluentui/react/lib/Button";

const Content = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export interface IFlowProps {
  actions: IAppActions;
  webFormSteps: WebFormStep[];
  entities: IEntity[];
  isMetadataLoading: boolean;
}

const nodeTypes = {
  nodeWithDragHandle: DragHandleNode,
  conditionNodeWithDragHandle: ConditionDragHandleNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 150;
const nodeHeight = 50;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    ///@ts-ignore
    node.targetPosition = "top";
    ///@ts-ignore
    node.sourcePosition = "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const getIntialNodesAndEdges = (
  webFormSteps: WebFormStep[],
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string>>,
  setCreateMode: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let initialNodes: Node[] = [];
  let initialEdges: Edge[] = [];

  webFormSteps.forEach((step, index) => {
    let node: Node = {
      id: step.adx_webformstepid,
      type: "nodeWithDragHandle",
      position: {
        x: 100,
        y: 100,
      },
      data: {
        label: step.adx_name,
        setSelected: () => {
          setSelectedNodeId(step.adx_webformstepid);
          setCreateMode(false);
        },
      },
      style: {
        border: "1px solid #777",
        backgroundColor: "white",
      },
      dragHandle: ".custom-drag-handle",
    };

    if (step.adx_type == WebFormStepType.Condition) {
      node.type = "conditionNodeWithDragHandle";
    }

    if (step.adx_nextstep) {
      let edge: Edge = {
        id: `${step.adx_webformstepid}-${step.adx_nextstep}`,
        source: step.adx_webformstepid,
        target: step.adx_nextstep,
        style: {
          strokeWidth: 2,
        },
      };
      if (step.adx_type == WebFormStepType.Condition) {
        edge.sourceHandle = "next";
        edge.className = "success-edge";
      }
      initialEdges.push(edge);
    }

    if (step.adx_conditiondefaultnextstep) {
      initialEdges.push({
        id: `${step.adx_webformstepid}-${step.adx_conditiondefaultnextstep}`,
        source: step.adx_webformstepid,
        target: step.adx_conditiondefaultnextstep,
        sourceHandle: "default",
        className: "error-edge",
      });
    }

    initialNodes.push(node);
  });

  return { initialNodes, initialEdges };
};

export const Flow = (props: IFlowProps) => {
  const [selectedNodeId, setSelectedNodeId] = React.useState("");
  const [webFormSteps, setWebFormSteps] = React.useState<WebFormStep[]>(
    props.webFormSteps
  );
  const [connectionToUpdate, setConnectionsToUpdate] = React.useState<
    Partial<WebFormStep>[]
  >([]);

  const [isCreateMode, setCreateMode] = React.useState<boolean>(false);

  const updateChangedRecords = async () => {
    if (connectionToUpdate.length == 0) {
      return null;
    }
    let isSuccess = true;

    const results = await props.actions.updateRecords(connectionToUpdate);

    // array of errors
    let errors: any[] = [];

    results?.forEach((result: any) => {
      if (result.status == "rejected") {
        errors.push(result.reason.responseText);
      }
    });

    if (errors.length > 0) {
      isSuccess = false;
      errors.forEach((error) => {
        console.error("Error while updating web steps", error);
      });
    }

    setConnectionsToUpdate([]);

    return isSuccess;
  };

  const clearSelected = () => setSelectedNodeId("");

  let { initialNodes, initialEdges } = getIntialNodesAndEdges(
    webFormSteps,
    setSelectedNodeId,
    setCreateMode
  );

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  const reactFlowWrapper = React.useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [reactFlowInstance, setReactFlowInstance] = React.useState(null);

  const onEdgesDelete = React.useCallback((deletedEdges) => {
    deletedEdges.forEach(
      (params: { id: string; source: string; sourceHandle?: string }) => {
        let stepToUpdate = connectionToUpdate.findIndex(
          (el) => el.adx_webformstepid == params.source
        );

        if (stepToUpdate != -1) {
          setConnectionsToUpdate((connections) =>
            connections.map((connection) => {
              if (connection.adx_webformstepid == params.source) {
                if (params.sourceHandle == "default") {
                  connection.adx_conditiondefaultnextstep = null;
                } else {
                  connection.adx_nextstep = null;
                }
              }
              return connection;
            })
          );
        } else {
          setConnectionsToUpdate((connections) => {
            let newConnection: Partial<WebFormStep> = {
              adx_webformstepid: params.source,
            };

            if (params.sourceHandle == "default") {
              newConnection.adx_conditiondefaultnextstep = null;
            } else {
              newConnection.adx_nextstep = null;
            }

            return connections.concat(newConnection);
          });
        }
      }
    );
  }, []);

  const onConnect = React.useCallback((params) => {
    let stepToUpdate = connectionToUpdate.findIndex(
      (el) => el.adx_webformstepid == params.source
    );

    if (stepToUpdate != -1) {
      setConnectionsToUpdate((connections) =>
        connections.map((connection) => {
          if (connection.adx_webformstepid == params.source) {
            if (params.sourceHandle == "default") {
              connection.adx_conditiondefaultnextstep = params.target;
            } else {
              connection.adx_nextstep = params.target;
            }
          }
          return connection;
        })
      );
    } else {
      setConnectionsToUpdate((connections) => {
        let newConnection: Partial<WebFormStep> = {
          adx_webformstepid: params.source,
        };

        if (params.sourceHandle == "default") {
          newConnection.adx_conditiondefaultnextstep = params.target;
        } else {
          newConnection.adx_nextstep = params.target;
        }

        return connections.concat(newConnection);
      });
    }

    let edge = {
      ...params,
      type: ConnectionLineType.Bezier,
    };

    switch (params.sourceHandle) {
      case "default":
        edge.className = "error-edge";
        break;
      case "next":
        edge.className = "success-edge";
        break;
      default:
        break;
    }

    setEdges((eds) => addEdge(edge, eds));
  }, []);

  const createNewNode = (newWebFormStep: WebFormStep) => {
    ///@ts-ignore
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

    let newNode: Node = {
      id: newWebFormStep.adx_webformstepid,
      type:
        newWebFormStep.adx_type == WebFormStepType.Condition
          ? "conditionNodeWithDragHandle"
          : "nodeWithDragHandle",
      position: {
        x: reactFlowBounds.left - 115,
        y: reactFlowBounds.top - 70,
      },
      data: {
        label: newWebFormStep.adx_name,
        setSelected: () => {
          setSelectedNodeId(newWebFormStep.adx_webformstepid);
          setCreateMode(false);
        },
      },
      style: {
        border: "1px solid #777",
        backgroundColor: "white",
      },
      dragHandle: ".custom-drag-handle",
    };

    setNodes((nds) => nds.concat(newNode));

    setWebFormSteps((steps) => steps.concat(newWebFormStep));

    setCreateMode(false);
  };

  const removeNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
  };

  const updateNode = (webFormStep: WebFormStep) => {
    setNodes((nds: Node[]) =>
      nds.map((node) => {
        if (node.id === webFormStep.adx_webformstepid) {
          node.data = {
            ...node.data,
            label: webFormStep.adx_name,
          };
        }

        return node;
      })
    );
  };

  return (
    <Page>
      <ReactFlowProvider>
        <Content ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onEdgesDelete={onEdgesDelete}
            onConnect={onConnect}
            ///@ts-ignore
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
          />
        </Content>
        <Sidebar
          selectedNodeId={selectedNodeId}
          clearSelected={clearSelected}
          isCreateMode={isCreateMode}
          setCreateMode={setCreateMode}
          webFormSteps={webFormSteps}
          setWebFormSteps={setWebFormSteps}
          createNewNode={createNewNode}
          updateNode={updateNode}
          entities={props.entities}
          isMetadataLoading={props.isMetadataLoading}
          removeNode={removeNode}
          actions={props.actions}
          updateChangedRecords={updateChangedRecords}
        />
      </ReactFlowProvider>
    </Page>
  );
};
