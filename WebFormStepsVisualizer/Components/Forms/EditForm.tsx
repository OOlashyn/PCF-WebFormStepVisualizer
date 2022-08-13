import * as React from "react";

import { DefaultButton } from "@fluentui/react/lib/Button";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";

import {
  IAppActions,
  IEntity,
  ISidebarMessageBar,
  WebFormStep,
} from "../../utils/Interfaces";

import { DefaultForm } from "./DefaultForm";
import { AsyncPrimaryButton } from "../Buttons/AsyncPrimaryButton";

interface IEditFormProps {
  selectedNodeId: string;
  clearSelected: () => void;
  webFormSteps: WebFormStep[];
  setWebFormSteps: React.Dispatch<React.SetStateAction<WebFormStep[]>>;
  entities: IEntity[];
  isMetadataLoading: boolean;
  removeNode: (nodeId: string) => void;
  actions: IAppActions;
  setMessageBar: React.Dispatch<React.SetStateAction<ISidebarMessageBar | undefined>>;
  updateNode: (webFormStep: WebFormStep) => void;
}

export const EditForm = ({
  selectedNodeId,
  clearSelected,
  webFormSteps,
  setWebFormSteps,
  entities,
  isMetadataLoading,
  removeNode,
  actions,
  setMessageBar,
  updateNode,
}: IEditFormProps) => {
  const [selectedStep, setSelectedStep] = React.useState(
    webFormSteps.find((el) => el.adx_webformstepid == selectedNodeId)
  );

  const [isDeleteDialogHidden, setIsDeleteDialogHidden] = React.useState(true);

  const hideDeleteDialog = () => setIsDeleteDialogHidden(true);

  React.useEffect(() => {
    setSelectedStep(
      webFormSteps.find((el) => el.adx_webformstepid == selectedNodeId)
    );
  }, [selectedNodeId, webFormSteps]);

  const removeRecord = async () => {
    let isError = await actions.deleteRecord(
      selectedStep?.adx_webformstepid || ""
    );

    if (isError) {
      hideDeleteDialog();
      setMessageBar({messageType: "error", messageText: "An error occured. Please check console for more details"});
    } else {
      removeNode(selectedStep?.adx_webformstepid || "");

      setWebFormSteps((steps) =>
        steps.filter(
          (step) =>
            step.adx_webformstepid !== selectedStep?.adx_webformstepid || ""
        )
      );
      hideDeleteDialog();
      clearSelected();
    }
  };

  const saveRecord = async () => {
    let isSaved = await actions.saveRecord(
      selectedStep || ({} as WebFormStep)
    );

    if (isSaved) {
      setWebFormSteps((steps: WebFormStep[]) =>
        steps.map((step) => {
          if (step.adx_webformstepid == selectedStep?.adx_webformstepid) {
            step = {
              ...step,
              adx_name: selectedStep.adx_name,
              adx_type: selectedStep.adx_type,
              adx_targetentitylogicalname:
                selectedStep.adx_targetentitylogicalname,
              adx_mode: selectedStep.adx_mode,
              adx_condition: selectedStep.adx_condition,
            };
          }
          return step;
        })
      );
      updateNode(selectedStep as WebFormStep);
      setMessageBar({messageType: "success", messageText: "Record updated successfully"});
    } else {
      setMessageBar({messageType: "error", messageText: "An error occured. Please check console for more details"});
    }
  }

  const editFormButtons = (
    <div className="edit-form_buttons-container">
      <AsyncPrimaryButton onClick={saveRecord} style={{ marginRight: "5px" }} text={"Save"} loadingText="Saving..."/>
      <DefaultButton
        text="Open"
        onClick={() =>
          actions.openRecord(selectedStep?.adx_webformstepid || "")
        }
        style={{ margin: "0 5px" }}
      />
      <DefaultButton
        text="Delete"
        onClick={() => setIsDeleteDialogHidden(false)}
        style={{ marginLeft: "5px" }}
      />
      <Dialog
        hidden={isDeleteDialogHidden}
        onDismiss={hideDeleteDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Confirm Deletion",
          closeButtonAriaLabel: "Close",
          subText: `Do you want to delete this Advanced Form Step? You can't undo this action.`,
        }}
        modalProps={{
          titleAriaId: "webFormStepVisualizer_DeleteDialog_Title",
          subtitleAriaId: "webFormStepVisualizer_DeleteDialog_Subtitle",
          isBlocking: false,
        }}
      >
        <DialogFooter>
          <AsyncPrimaryButton onClick={removeRecord} text="Delete" loadingText="Deleting..."/>
          <DefaultButton onClick={hideDeleteDialog} text="Cancel" />
        </DialogFooter>
      </Dialog>
    </div>
  );

  if (selectedStep) {
    return (
      <DefaultForm
        buttons={editFormButtons}
        closeDialog={clearSelected}
        step={selectedStep}
        setSelectedStep={setSelectedStep}
        webFormSteps={webFormSteps}
        entities={entities}
        isMetadataLoading={isMetadataLoading}
      />
    );
  } else {
    return <div>Selected node not found</div>;
  }
};
