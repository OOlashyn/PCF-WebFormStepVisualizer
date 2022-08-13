import * as React from "react";

import { PrimaryButton } from "@fluentui/react/lib/Button";
import styled from "styled-components";

import {
  WebFormStepType,
  WebFormStepMode,
  WebFormStep,
  IEntity,
  IAppActions,
  ISidebarMessageBar,
} from "../utils/Interfaces";

import { CreateForm } from "./Forms/CreateForm";

import { EditForm } from "./Forms/EditForm";
import { MessageBar, MessageBarType } from "@fluentui/react/lib/MessageBar";
import { AsyncPrimaryButton } from "./Buttons/AsyncPrimaryButton";

const SidebarWrapper = styled.div`
  width: 300px;
  background: #f3f2f1;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  text-align: start;
`;

const TextBlock = styled.div`
  margin: 10px;
  padding: 10px;
  line-height: 1.4em;
  color: black;
`;

export interface ISelectedEntityProps {
  title: string;
  entity: string;
  type: WebFormStepType;
  mode: WebFormStepMode;
  id: string;
  condition: string;
}

interface ISidebarProps {
  clearSelected: () => void;
  webFormSteps: WebFormStep[];
  setWebFormSteps: React.Dispatch<React.SetStateAction<WebFormStep[]>>;
  selectedNodeId: string;
  isCreateMode: boolean;
  setCreateMode: Function;
  createNewNode: (newWebFormStep: WebFormStep) => void;
  entities: IEntity[];
  isMetadataLoading: boolean;
  removeNode: (nodeId: string) => void;
  actions: IAppActions;
  updateChangedRecords: () => Promise<boolean | null>;
  updateNode: (webFormStep: WebFormStep) => void;
}

export const Sidebar = (props: ISidebarProps) => {
  const [messageBar, setMessageBar] = React.useState<ISidebarMessageBar>();

  const updateModifiedRecords = async () => {
    let result = await props.updateChangedRecords();

    if(result === true) {
      setMessageBar({messageType: "success", messageText: "Records updated successfully"});
    }

    if(result === false) {
      setMessageBar({messageType: "error", messageText: "An error occured. Please check console for more details"});
    }
  }

  let editForm = null;
  let defaultSidebar = null;
  let createForm = null;

  if (props.selectedNodeId != "") {
    editForm = (
      <EditForm
        selectedNodeId={props.selectedNodeId}
        setWebFormSteps={props.setWebFormSteps}
        updateNode={props.updateNode}
        clearSelected={props.clearSelected}
        webFormSteps={props.webFormSteps}
        entities={props.entities}
        isMetadataLoading={props.isMetadataLoading}
        removeNode={props.removeNode}
        actions={props.actions}
        setMessageBar={setMessageBar}
      />
    );
  }

  if (props.isCreateMode && props.selectedNodeId == "") {
    createForm = (
      <CreateForm
        setCreateMode={props.setCreateMode}
        isCreateMode={props.isCreateMode}
        createNewNode={props.createNewNode}
        webFormSteps={props.webFormSteps}
        entities={props.entities}
        isMetadataLoading={props.isMetadataLoading}
        createRecord={props.actions.createRecord}
        setMessageBar={setMessageBar}
      />
    );
  }

  if (!editForm && !createForm) {
    defaultSidebar = (
      <>
        <TextBlock>
          Click on a Node info icon to see details or create new step using
          button below
        </TextBlock>
        <PrimaryButton
          iconProps={{ iconName: "EditCreate" }}
          text="Create new step"
          style={{ margin: "10px", padding: "10px" }}
          onClick={(ev) => props.setCreateMode(true)}
        />
        <TextBlock>
          Update existing step order and save changes using button below
        </TextBlock>
        <AsyncPrimaryButton
          iconProps={{ iconName: "Save" }}
          text="Save changes"
          loadingText="Saving changes..."
          style={{ margin: "10px", padding: "10px" }}
          onClick={updateModifiedRecords}
        />
      </>
    );
  }

  return (
    <SidebarWrapper>
      {messageBar?.messageType == "error" && (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={true}
          onDismiss={() => {
            setMessageBar({messageText: "", messageType: ""});
          }}
          dismissButtonAriaLabel="Close"
        >
          {messageBar.messageText}
        </MessageBar>
      )}
      {messageBar?.messageType == "success" && (
        <MessageBar
          messageBarType={MessageBarType.success}
          isMultiline={true}
          onDismiss={() => {
            setMessageBar({messageText: "", messageType: ""});
          }}
          dismissButtonAriaLabel="Close"
        >
          {messageBar.messageText}
        </MessageBar>
      )}
      {editForm}
      {createForm}
      {defaultSidebar}
    </SidebarWrapper>
  );
};
