import { IInputs, IOutputs } from "./generated/ManifestTypes";

import * as React from "react";

import { App, IAppProps } from "./components/App";
import { WebFormStep } from "./utils/Interfaces";

export class WebFormStepsVisualizer
  implements ComponentFramework.ReactControl<IInputs, IOutputs>
{
  private _context: ComponentFramework.Context<IInputs>;
  private props: IAppProps;

  /**
   * Empty constructor.
   */
  constructor() {}

  /**
   * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
   * Data-set values are not initialized here, use updateView.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
   * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
   * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
   * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
   */
  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ) {
    this._context = context;

    this.props = {
      actions: {
        openRecord: this.openRecord,
        saveRecord: this.saveRecord,
        createRecord: this.createRecord,
        updateRecords: this.updateRecords,
        deleteRecord: this.deleteRecord,
      },
      getWebFormSteps: this.getWebFormSteps,
      getEntitiesMetadata: this.getEntitiesMetadata,
    };
  }

  public getWebFormSteps = async () => {
    const webFormId: string = (this._context.mode as any).contextInfo.entityId;

    if (webFormId) {
      let currentWebForm;

      try {
        currentWebForm = await this._context.webAPI.retrieveRecord(
          "adx_webform",
          webFormId,
          "?$select=_adx_startstep_value"
        );
      } catch (error) {
        console.error(error);
      }

      if (currentWebForm && currentWebForm._adx_startstep_value) {
        const select =
          "$select=_adx_nextstep_value,adx_type,_adx_conditiondefaultnextstep_value,adx_webformstepid,adx_name,adx_condition,adx_targetentitylogicalname,adx_mode,adx_entitysourcetype,_adx_entitysourcestep_value";
        const filter = `$filter=_adx_webform_value eq ${webFormId}`;

        const searchOption = `?${select}&${filter}`;

        let results = await this._context.webAPI.retrieveMultipleRecords(
          "adx_webformstep",
          searchOption
        );

        if (results.entities) {
          let webFormStepsArr: WebFormStep[] = results.entities.map(
            (entity) => {
              let step: WebFormStep = {
                adx_webformstepid: entity.adx_webformstepid,
                adx_name: entity.adx_name,
                adx_type: entity.adx_type,
                adx_targetentitylogicalname: entity.adx_targetentitylogicalname,
                adx_mode: entity.adx_mode,
                adx_condition: entity.adx_condition,
                adx_conditiondefaultnextstep:
                  entity._adx_conditiondefaultnextstep_value,
                adx_nextstep: entity._adx_nextstep_value,
                adx_entitysourcetype: entity.adx_entitysourcetype,
                adx_entitysourcestep: entity._adx_entitysourcestep_value,
              };

              return step;
            }
          );

          return webFormStepsArr;
        }
      } else {
        console.log("No Start Step present on Web Form");
        return [];
      }
    }

    return [];
  };

  public openRecord = (id: string) => {
    let options: ComponentFramework.NavigationApi.EntityFormOptions = {
      entityName: "adx_webformstep",
      entityId: id,
      openInNewWindow: true,
    };

    this._context.navigation.openForm(options);
  };

  public saveRecord = async (record: WebFormStep) => {
    let isSuccess = true;

    let recordToUpdate: any = {
      adx_name: record.adx_name,
      adx_type: record.adx_type,
      adx_targetentitylogicalname: record.adx_targetentitylogicalname,
      adx_mode: record.adx_mode,
      adx_condition: record.adx_condition,
      adx_entitysourcetype: record.adx_entitysourcetype,
    };

    if (record.adx_entitysourcestep) {
      recordToUpdate[
        "adx_entitysourcestep@odata.bind"
      ] = `/adx_webformsteps(${record.adx_entitysourcestep})`;
    }

    try {
      await this._context.webAPI.updateRecord(
        "adx_webformstep",
        record.adx_webformstepid,
        recordToUpdate
      );
    } catch (error) {
      isSuccess = false;
      console.error(error);
    }

    return isSuccess;
  };

  public createRecord = async (record: WebFormStep, setAsStartStep = false) => {
    const webFormId: string = (this._context.mode as any).contextInfo.entityId;

    const { adx_entitysourcestep, ...recordWithoutSourceStep } = record;

    let recordToCreate: any = {
      "adx_webform@odata.bind": `/adx_webforms(${webFormId})`,
      ...recordWithoutSourceStep,
    };

    if (adx_entitysourcestep != null && adx_entitysourcestep != undefined) {
      recordToCreate[
        "adx_entitysourcestep@odata.bind"
      ] = `/adx_webformsteps(${adx_entitysourcestep})`;
    }

    let isSuccess = true;
    let result;
    try {
      result = await this._context.webAPI.createRecord(
        "adx_webformstep",
        recordToCreate
      );
    } catch (error) {
      console.error(error);
      isSuccess = false;
    }

    if (result?.id != undefined && setAsStartStep) {
      await this._context.webAPI.updateRecord(
        "adx_webform",
        webFormId,
        {
          "adx_startstep@odata.bind": `/adx_webformsteps(${result.id})`,
        }
      );
    }

    return { isSuccess: isSuccess, value: result?.id};
  };

  public getEntitiesMetadata = () => {
    return fetch(
      "/api/data/v9.2/RetrieveAllEntities(EntityFilters=@EntityFilters,RetrieveAsIfPublished=@RetrieveAsIfPublished)?@EntityFilters=Microsoft.Dynamics.CRM.EntityFilters'Entity'&@RetrieveAsIfPublished=false",
      {
        method: "GET",
        headers: {
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
        },
      }
    );
  };

  public updateRecords = async (recordsToUpdate: Partial<WebFormStep>[]) => {
    let deffereds = [];

    for (let index = 0; index < recordsToUpdate.length; index++) {
      const step = recordsToUpdate[index];
      let recordToUpdate: any = {};

      if (step.adx_nextstep != null) {
        recordToUpdate[
          "adx_nextstep@odata.bind"
        ] = `/adx_webformsteps(${step.adx_nextstep})`;
      }

      if (step.adx_nextstep === null) {
        recordToUpdate["adx_nextstep@odata.bind"] = null;
      }

      if (step.adx_conditiondefaultnextstep != null) {
        recordToUpdate[
          "adx_conditiondefaultnextstep@odata.bind"
        ] = `/adx_webformsteps(${step.adx_conditiondefaultnextstep})`;
      }
      if (step.adx_conditiondefaultnextstep === null) {
        recordToUpdate["adx_conditiondefaultnextstep@odata.bind"] = null;
      }

      deffereds.push(
        this._context.webAPI.updateRecord(
          "adx_webformstep",
          step.adx_webformstepid as string,
          recordToUpdate
        )
      );
    }

    return Promise.allSettled(deffereds);
  };

  public deleteRecord: (recordId: string) => Promise<boolean> = async (
    recordId: string
  ) => {
    let isError = false;
    try {
      await this._context.webAPI.deleteRecord(
        "adx_webformstep",
        recordId
      );
    } catch (error) {
      isError = true;
      console.error(error);
    }

    return isError;
  };

  /**
   * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
   * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
   */
  public updateView(
    context: ComponentFramework.Context<IInputs>
  ): React.ReactElement {
    // Add code to update control view
    return React.createElement(App, this.props);
  }

  /**
   * It is called by the framework prior to a control receiving new data.
   * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
   */
  public getOutputs(): IOutputs {
    return {};
  }

  /**
   * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
   * i.e. cancelling any pending remote calls, removing listeners, etc.
   */
  public destroy(): void {
    // Add code to cleanup control if necessary
  }
}
