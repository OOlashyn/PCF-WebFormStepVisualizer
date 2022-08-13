import * as React from "react";

import { IconButton } from "@fluentui/react/lib/Button";
import { Dropdown, IDropdownOption } from "@fluentui/react/lib/Dropdown";
import { IStackTokens, Stack } from "@fluentui/react/lib/Stack";
import { TextField } from "@fluentui/react/lib/TextField";

import {
  IEntity,
  WebFormStep,
  WebFormStepMode,
  WebFormStepTableSourceType,
  WebFormStepType,
} from "../../utils/Interfaces";
import { Spinner } from "@fluentui/react/lib/Spinner";
import {
  IComboBox,
  IComboBoxOption,
  VirtualizedComboBox,
} from "@fluentui/react/lib/ComboBox";

const verticalGapStackTokens: IStackTokens = {
  childrenGap: 10,
  padding: 20,
};

const typeOptions: IDropdownOption[] = [
  { key: WebFormStepType.Condition, text: "Condition" },
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

const sourceTypeOptions: IDropdownOption[] = [
  { key: WebFormStepTableSourceType.QueryString, text: "Query String" },
  {
    key: WebFormStepTableSourceType.CurrentPortalUser,
    text: "Current Portal User",
  },
  {
    key: WebFormStepTableSourceType.ResultFromPreviousStep,
    text: "Result From Previous Step",
  },
  {
    key: WebFormStepTableSourceType.RecordAssociateToCurrentPortalUser,
    text: "Record Associate To Current Portal User",
  },
];

export const DefaultForm = ({
  closeDialog,
  step,
  setSelectedStep,
  buttons,
  webFormSteps,
  entities,
  isMetadataLoading,
}: {
  closeDialog: () => void;
  step: WebFormStep;
  setSelectedStep: Function;
  buttons: JSX.Element;
  webFormSteps: WebFormStep[];
  entities: IEntity[];
  isMetadataLoading: boolean;
}) => {
  const previousStepSelectorOptions: IDropdownOption[] = webFormSteps.map(
    (step) => {
      let option: IDropdownOption = {
        key: step.adx_webformstepid,
        text: step.adx_name,
      };

      return option;
    }
  );

  const targetTableEntities: IComboBoxOption[] = entities.map((entity) => {
    let option: IComboBoxOption = {
      key: entity.logicalName,
      text: `${entity.displayName} (${entity.logicalName})`,
    };

    return option;
  });

  const targetTable = isMetadataLoading ? (
    <>
      <Spinner
        label="Getting metadata..."
        ariaLive="assertive"
        labelPosition="left"
      />
      <TextField
        label="Target Table name"
        value={step.adx_targetentitylogicalname}
        required
        disabled
      />
    </>
  ) : (
    <VirtualizedComboBox
      selectedKey={step.adx_targetentitylogicalname}
      label="Target Table name"
      autoComplete="on"
      options={targetTableEntities}
      dropdownMaxWidth={200}
      allowFreeform
      useComboBoxAsMenuWidth
      onChange={(
        event: React.FormEvent<IComboBox>,
        item: IDropdownOption | undefined
      ): void => {
        setSelectedStep({
          ...step,
          adx_targetentitylogicalname: item?.key as string,
        });
      }}
      required
    />
  );

  return (
    <>
      <Stack tokens={verticalGapStackTokens}>
        <Stack.Item align="end">
          <IconButton
            iconProps={{ iconName: "ChromeClose" }}
            onClick={() => closeDialog()}
            style={{color: "#666666"}}
          />
        </Stack.Item>
        <TextField
          label="Name"
          value={step.adx_name}
          onChange={(
            event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
            newValue?: string
          ) => {
            setSelectedStep({ ...step, adx_name: newValue || "" });
          }}
          onGetErrorMessage={() =>
            step.adx_name != "" ? "" : "Name is required"
          }
          required
        />
        {targetTable}
        <Dropdown
          label="Type"
          selectedKey={step.adx_type}
          options={typeOptions}
          onChange={(
            event: React.FormEvent<HTMLDivElement>,
            item: IDropdownOption | undefined
          ): void => {
            setSelectedStep({
              ...step,
              adx_type: item?.key as WebFormStepType,
            });
          }}
          required
        />
        {step.adx_type == WebFormStepType.Condition ? (
          <TextField
            label="Condition"
            value={step.adx_condition ?? ""}
            onChange={(
              event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
              newValue?: string
            ) => {
              setSelectedStep({
                ...step,
                adx_condition: newValue || "",
              });
            }}
            required
          />
        ) : null}
        <Dropdown
          label="Mode"
          selectedKey={step.adx_mode}
          options={modeOptions}
          disabled={step.adx_type == WebFormStepType.Condition}
          onChange={(
            event: React.FormEvent<HTMLDivElement>,
            item: IDropdownOption | undefined
          ): void => {
            if (item?.key == WebFormStepMode.Insert) {
              setSelectedStep({
                ...step,
                adx_mode: item?.key as WebFormStepMode,
                adx_entitysourcetype: null,
              });
            } else {
              setSelectedStep({
                ...step,
                adx_mode: item?.key as WebFormStepMode,
              });
            }
          }}
          required={step.adx_type != WebFormStepType.Condition}
        />
        {step.adx_mode == WebFormStepMode.Edit ||
        step.adx_mode == WebFormStepMode.ReadOnly ? (
          <>
            <Dropdown
              label="Source Type"
              selectedKey={step.adx_entitysourcetype}
              options={sourceTypeOptions}
              onChange={(
                event: React.FormEvent<HTMLDivElement>,
                item: IDropdownOption | undefined
              ): void => {
                setSelectedStep({
                  ...step,
                  adx_entitysourcetype: item?.key as WebFormStepTableSourceType,
                });
              }}
              required
            />
            {step.adx_entitysourcetype ==
            WebFormStepTableSourceType.ResultFromPreviousStep ? (
              <Dropdown
                label="Entity Source Step"
                selectedKey={step.adx_entitysourcestep}
                options={previousStepSelectorOptions}
                onChange={(
                  event: React.FormEvent<HTMLDivElement>,
                  item: IDropdownOption | undefined
                ): void => {
                  setSelectedStep({
                    ...step,
                    adx_entitysourcestep: item?.key as string,
                  });
                }}
                required
              />
            ) : null}
          </>
        ) : null}
        {buttons}
      </Stack>
    </>
  );
};
