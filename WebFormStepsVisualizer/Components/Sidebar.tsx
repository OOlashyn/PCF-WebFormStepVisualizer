import * as React from "react";
import styled from "styled-components";

import {
  Stack,
  TextField,
  Dropdown,
  IDropdownOption,
  PrimaryButton,
  IStackTokens,
} from "@fluentui/react";

import { WebFormStepType, WebFormStepMode } from "../utils/WebFormInterfaces";

const SidebarWrapper = styled.div`
  width: 300px;
  background: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  text-align: start;
`;

const Message = styled.div`
  margin: 10px;
  padding: 10px;
  line-height: 1.4em;
`;

const verticalGapStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 10,
};

const typeOptions: IDropdownOption[] = [
  { key: WebFormStepType.Condition, text: "Condtion" },
  { key: WebFormStepType.LoadForm, text: "Load Form" },
  { key: WebFormStepType.LoadTab, text: "Load Tab" },
  { key: WebFormStepType.LoadUserControl, text: "Load User Control" },
  { key: WebFormStepType.Redirect, text: "Redirect" },
];

const modeOptions: IDropdownOption[] = [
  { key: WebFormStepMode.Insert, text: "Insert" },
  { key: WebFormStepMode.Edit, text: "Edit" },
  { key: WebFormStepMode.ReadOnly, text: "Read Only" },
];

export interface ISelectedEntityProps {
  title: string;
  entity: string;
  type: WebFormStepType;
  mode: WebFormStepMode;
  id: string;
  condition:string;
}

interface ISidebarProps {
  selected: Partial<ISelectedEntityProps>;
  openRecord: Function;
}

export const Sidebar = (props: ISidebarProps) => {
  const selected = props.selected;
  console.log("selected", selected);

  return (
    <SidebarWrapper>
      {selected !== undefined && selected.type ? (
        <Stack tokens={verticalGapStackTokens}>
          <TextField label="Name" value={selected.title} />
          <TextField label="Entity" value={selected.entity} />
          <Dropdown
            label="Type"
            selectedKey={selected.type}
            options={typeOptions}
          />
          {selected.type == WebFormStepType.Condition ? (<TextField label="Condition" value={selected.condition} />): null}
          <Dropdown
            label="Mode"
            selectedKey={selected.mode}
            options={modeOptions}
            disabled={selected.mode == null}
          />
          <PrimaryButton
            iconProps={{ iconName: "OpenInNewWindow" }}
            text="Open Record"
            onClick={() => props.openRecord(selected.id)}
          />
        </Stack>
      ) : (
        <Message>Click on a Node</Message>
      )}
    </SidebarWrapper>
  );
};
