import { WebFormStep, WebFormStepType, WebFormStepMode } from "./WebFormInterfaces";

export const WebFormSteps: WebFormStep[] = [
    {
        adx_webformstepid: "1bdcfcb9-5898-ea11-a812-000d3aa98048",
        adx_name: "Add Account",
        adx_type: WebFormStepType.LoadForm,
        adx_targetentitylogicalname: "account",
        adx_mode: WebFormStepMode.Insert,
        adx_condition: null,
        adx_conditiondefaultnextstep: null,
        adx_nextstep: "c4f2c8de-5898-ea11-a812-000d3aa98048"
    },
    {
        adx_webformstepid: "c4f2c8de-5898-ea11-a812-000d3aa98048",
        adx_name: "Add Contact",
        adx_type: WebFormStepType.LoadForm,
        adx_targetentitylogicalname: "contact",
        adx_mode: WebFormStepMode.Insert,
        adx_condition: null,
        adx_conditiondefaultnextstep: null,
        adx_nextstep: "ab741a9b-5998-ea11-a812-000d3aa98048"
    },
    {
        adx_webformstepid: "ab741a9b-5998-ea11-a812-000d3aa98048",
        adx_name: "Condition Split",
        adx_type: WebFormStepType.Condition,
        adx_targetentitylogicalname: "contact",
        adx_mode: null,
        adx_condition: "dwcrm_splittype  == true",
        adx_conditiondefaultnextstep: "b47daef7-5998-ea11-a812-000d3aa98048",
        adx_nextstep: "f49da5cc-5998-ea11-a812-000d3aa98048"
    },
    {
        adx_webformstepid: "b47daef7-5998-ea11-a812-000d3aa98048",
        adx_name: "Add Example",
        adx_type: WebFormStepType.LoadForm,
        adx_targetentitylogicalname: "dwcrm_example",
        adx_mode: WebFormStepMode.Insert,
        adx_condition: null,
        adx_conditiondefaultnextstep: null,
        adx_nextstep: "0793f271-187c-4072-982d-fa51cb2c99da"
    },
    {
        adx_webformstepid: "0793f271-187c-4072-982d-fa51cb2c99da",
        adx_name: "Add Second Example",
        adx_type: WebFormStepType.LoadForm,
        adx_targetentitylogicalname: "dwcrm_example",
        adx_mode: WebFormStepMode.Insert,
        adx_condition: null,
        adx_conditiondefaultnextstep: null,
        adx_nextstep: "36fced2c-5a98-ea11-a812-000d3aa98048"
    },
    {
        adx_webformstepid: "f49da5cc-5998-ea11-a812-000d3aa98048",
        adx_name: "Add Sample",
        adx_type: WebFormStepType.LoadForm,
        adx_targetentitylogicalname: "dwcrm_sample",
        adx_mode: WebFormStepMode.Insert,
        adx_condition: null,
        adx_conditiondefaultnextstep: null,
        adx_nextstep: "30f9d385-52d3-4a50-a775-50c943985061"
    },
    {
        adx_webformstepid: "30f9d385-52d3-4a50-a775-50c943985061",
        adx_name: "Add Second Sample",
        adx_type: WebFormStepType.LoadForm,
        adx_targetentitylogicalname: "dwcrm_sample",
        adx_mode: WebFormStepMode.Insert,
        adx_condition: null,
        adx_conditiondefaultnextstep: null,
        adx_nextstep: "36fced2c-5a98-ea11-a812-000d3aa98048"
    },
    {
        adx_webformstepid: "36fced2c-5a98-ea11-a812-000d3aa98048",
        adx_name: "Edit Contact",
        adx_type: WebFormStepType.LoadForm,
        adx_targetentitylogicalname: "contact",
        adx_mode: WebFormStepMode.Edit,
        adx_condition: null,
        adx_conditiondefaultnextstep: null,
        adx_nextstep: null
    }
]

