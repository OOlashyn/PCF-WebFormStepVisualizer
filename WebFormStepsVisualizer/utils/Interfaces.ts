export enum WebFormStepType {
  Condition = 100000000,
  LoadForm,
  LoadTab,
  LoadUserControl,
  Redirect,
}

export enum WebFormStepMode {
  Insert = 100000000,
  Edit,
  ReadOnly,
}

export enum WebFormStepTableSourceType {
  QueryString = 100000001,
  CurrentPortalUser,
  ResultFromPreviousStep,
  RecordAssociateToCurrentPortalUser,
}

export interface WebFormStep {
  adx_webformstepid: string;
  adx_name: string;
  adx_type: WebFormStepType;
  adx_targetentitylogicalname: string;
  adx_mode: WebFormStepMode | null;
  adx_condition: string | null;
  adx_conditiondefaultnextstep: string | null;
  adx_nextstep: string | null;
  adx_entitysourcetype?: WebFormStepTableSourceType | null;
  adx_entitysourcestep?: string | null;
}

export interface IEntity {
  logicalName: string;
  displayName: string;
}

export interface ISidebarMessageBar {
  messageType: string;
  messageText: string;
}

export interface IAppActions {
  openRecord: (id: string) => void;
  saveRecord: (record: WebFormStep) => Promise<boolean>;
  createRecord: (
    record: WebFormStep,
    setAsStartStep?: boolean
  ) => Promise<{
    isSuccess: boolean;
    value: string | undefined;
  }>;
  updateRecords: (
    recordsToUpdate: Partial<WebFormStep>[]
  ) => Promise<
    PromiseSettledResult<ComponentFramework.LookupValue>[] | undefined
  >;
  deleteRecord: (recordId: string) => Promise<boolean>;
}
