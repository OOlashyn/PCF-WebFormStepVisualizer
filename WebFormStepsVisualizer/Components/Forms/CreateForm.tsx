import * as React from "react";

import { DefaultButton } from "@fluentui/react/lib/Button";

import { IEntity, ISidebarMessageBar, WebFormStep } from "../../utils/Interfaces";

import { DefaultForm } from "./DefaultForm";
import { AsyncPrimaryButton } from "../Buttons/AsyncPrimaryButton";

interface ICreateForm {
  isCreateMode: boolean;
  setCreateMode: Function;
  createNewNode: (newWebFormStep: WebFormStep) => void;
  webFormSteps: WebFormStep[];
  entities: IEntity[];
  isMetadataLoading: boolean;
  createRecord: (
    record: WebFormStep,
    setAsStartStep?: boolean
  ) => Promise<{
    isSuccess: boolean;
    value: string | undefined;
  }>;
  setMessageBar: React.Dispatch<React.SetStateAction<ISidebarMessageBar | undefined>>;
}

export const CreateForm = (props: ICreateForm) => {
  const [newStep, setStep] = React.useState({} as WebFormStep);

  React.useEffect(() => {
    setStep({} as WebFormStep);
  }, [props.isCreateMode]);

  const createRecord = async () => {
    let newStepId = await props.createRecord(
      newStep,
      props.webFormSteps.length == 0
    );
    if (newStepId.isSuccess) {
      props.createNewNode({
        ...newStep,
        adx_webformstepid: newStepId.value ?? "",
      });
      props.setCreateMode(false);
      props.setMessageBar({messageType: "success", messageText: "Step created successfully!"});
    } else {
      props.setMessageBar({messageType: "error", messageText: "An error occured. Please check console for more details"});
    }
  };

  const cancelChanges = () => {
    props.setCreateMode(false);
  };

  const createFormButtons = (
    <>
      <AsyncPrimaryButton
        onClick={createRecord}
        text="Create step"
        loadingText="Creating record..."
        iconProps={{ iconName: "EditCreate" }}
      />
      <DefaultButton
        iconProps={{ iconName: "Cancel" }}
        text="Cancel"
        onClick={() => cancelChanges()}
      />
    </>
  );

  return (
    <DefaultForm
      buttons={createFormButtons}
      step={newStep}
      setSelectedStep={setStep}
      closeDialog={cancelChanges}
      webFormSteps={props.webFormSteps}
      entities={props.entities}
      isMetadataLoading={props.isMetadataLoading}
    />
  );
};
