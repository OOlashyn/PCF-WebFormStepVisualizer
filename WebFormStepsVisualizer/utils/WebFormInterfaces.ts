export enum WebFormStepType {
    Condition = 100000000,
    LoadForm,
    LoadTab,
    LoadUserControl,
    Redirect
}

export enum WebFormStepMode {
    Insert = 100000000,
    Edit,
    ReadOnly
}

export interface WebFormStep {
    adx_webformstepid: string,
    adx_name: string,
    adx_type: WebFormStepType,
    adx_targetentitylogicalname: string,
    adx_mode: WebFormStepMode | null,
    adx_condition: string | null,
    adx_conditiondefaultnextstep: string | null,
    adx_nextstep: string | null
}