import { IInputs, IOutputs } from "./generated/ManifestTypes";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { App, IAppProps } from "./Components/App";
import { WebFormStep, WebFormStepType } from "./utils/WebFormInterfaces";
import { IChart } from "@mrblenny/react-flow-chart";
import { WebFormSteps } from "./utils/SampleData";

export class WebFormStepsVisualizer implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	private _container: HTMLDivElement;
	private _context: ComponentFramework.Context<IInputs>;
	private props: IAppProps;

	/**
	 * Empty constructor.
	 */
	constructor() {

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
		this.getWebFormSteps = this.getWebFormSteps.bind(this);

		this._context = context;

		this._container = document.createElement('div');

		container.appendChild(this._container);

		this.getWebFormSteps();

		//this.getWebFormStepsLocalDev();
	}

	public async getWebFormSteps(): Promise<void> {
		const webFormId: string = (this._context.mode as any).contextInfo.entityId;

		if (webFormId) {
			let currentWebForm;

			try {
				currentWebForm = await this._context.webAPI
					.retrieveRecord("adx_webform", webFormId, "?$select=_adx_startstep_value");
			} catch (error) {
				console.error(error);
			}


			if (currentWebForm && currentWebForm._adx_startstep_value) {

				const select = "$select=_adx_nextstep_value,adx_type,_adx_conditiondefaultnextstep_value,adx_webformstepid,adx_name,adx_condition,adx_targetentitylogicalname,adx_mode"
				const filter = `$filter=_adx_webform_value eq ${webFormId}`;

				const searchOption = "?" + select + "&" + filter;

				let results = await this._context.webAPI.retrieveMultipleRecords("adx_webformstep", searchOption);

				if (results.entities) {
					let webFormStepsArr: WebFormStep[] = results.entities.map((entity) => {
						let step: WebFormStep = {
							adx_webformstepid: entity.adx_webformstepid,
							adx_name: entity.adx_name,
							adx_type: entity.adx_type,
							adx_targetentitylogicalname: entity.adx_targetentitylogicalname,
							adx_mode: entity.adx_mode,
							adx_condition: entity.adx_condition,
							adx_conditiondefaultnextstep: entity._adx_conditiondefaultnextstep_value,
							adx_nextstep: entity._adx_nextstep_value
						};

						return step;
					});

					this.props = {
						openRecord: this.openRecord,
						initialChart: this.createInitialChart(webFormStepsArr, currentWebForm._adx_startstep_value)
					}

					ReactDOM.render(
						React.createElement(
							App,
							this.props
						),
						this._container
					)
				}

			} else {
				console.error("No Start Step present on Web Form");

				// TODO Error Message 
			}
		}
	}

	public getWebFormStepsLocalDev = () => {
		this.props = {
			openRecord: this.openRecord,
			initialChart: this.createInitialChart(WebFormSteps, "1bdcfcb9-5898-ea11-a812-000d3aa98048")
		}

		ReactDOM.render(
			React.createElement(
				App,
				this.props
			),
			this._container
		)
	}

	private createLink = (
		chart: IChart,
		fromNodeId: string,
		fromNodePort: string,
		toNodeId: string,
		toNodePort: string
	) => {
		let linkId = fromNodeId + toNodeId;

		if (!chart.links[linkId]) {
			chart.links[linkId] = {
				id: linkId,
				from: {
					nodeId: fromNodeId,
					portId: fromNodePort,
				},
				to: {
					nodeId: toNodeId,
					portId: toNodePort,
				},
			};
		}
	};

	public createInitialChart = (stepsArr:WebFormStep[], startStepId:string) => {
		// const stepsArr = WebFormSteps;
		// let startStepId = "1bdcfcb9-5898-ea11-a812-000d3aa98048";

		// const stepsArr = props.webFormSteps;
		// let startStepId = props.startStepId;

		let currentStepId: string | null = startStepId;
		let splitConditionArr = [];

		let sampleChart: IChart = {
			offset: {
				x: 0,
				y: 0,
			},
			scale: 1,
			nodes: {},
			links: {},
			selected: {},
			hovered: {},
		};

		stepsArr.forEach((step, index) => {
			sampleChart.nodes[step.adx_webformstepid] = {
				id: step.adx_webformstepid,
				type: "input-output",
				position: {
					x: 300,
					y: 100,
				},
				ports: {
					port1: {
						id: "port1",
						type: "input",
					},
					port2: {
						id: "port2",
						type: "output",
					},
				},
				properties: {
					title: step.adx_name,
					type: step.adx_type,
					mode: step.adx_mode,
					entity: step.adx_targetentitylogicalname,
					id: step.adx_webformstepid,
				},
			};

			if (step.adx_type == WebFormStepType.Condition) {
				sampleChart.nodes[step.adx_webformstepid].properties.condition =
					step.adx_condition;

				sampleChart.nodes[step.adx_webformstepid].ports.port2.properties = {
					value: "no",
					linkColor: "#FF0000",
				};

				sampleChart.nodes[step.adx_webformstepid].ports.port3 = {
					id: "port3",
					type: "output",
					properties: {
						value: "no",
						linkColor: "#32CD32",
					},
				};
			}
		});

		let stopCondition = false;

		while (!stopCondition) {
			let currentStep = stepsArr.find(
				(el) => el.adx_webformstepid == currentStepId
			);

			if (currentStep && currentStepId) {
				if (currentStep.adx_type == WebFormStepType.Condition) {
					// Create Link for default next step
					if (currentStep.adx_conditiondefaultnextstep) {
						// Update array of split nodes
						splitConditionArr.push(currentStep.adx_conditiondefaultnextstep);

						let splitConditionId = currentStep.adx_conditiondefaultnextstep;

						sampleChart.nodes[splitConditionId].position.x =
							sampleChart.nodes[currentStepId].position.x - 200;
						sampleChart.nodes[splitConditionId].position.y =
							sampleChart.nodes[currentStepId].position.y + 200;

						this.createLink(
							sampleChart,
							currentStep.adx_webformstepid,
							"port2",
							splitConditionId,
							"port1"
						);

						if (currentStep.adx_nextstep) {
							sampleChart.nodes[currentStep.adx_nextstep].position.x =
								sampleChart.nodes[currentStepId].position.x + 200;
						}
					}
				}

				let nextStepId = currentStep.adx_nextstep;

				if (nextStepId) {
					if (!(currentStep.adx_type == WebFormStepType.Condition)) {
						sampleChart.nodes[nextStepId].position.x =
							sampleChart.nodes[currentStepId].position.x;
					}

					sampleChart.nodes[nextStepId].position.y =
						sampleChart.nodes[currentStepId].position.y + 200;

					this.createLink(
						sampleChart,
						currentStep.adx_webformstepid,
						currentStep.adx_type == WebFormStepType.Condition ? "port3" : "port2",
						nextStepId,
						"port1"
					);
				}

				currentStepId = nextStepId;
			} else {
				// check if there are unprocessed path
				if (splitConditionArr.length > 0) {
					currentStepId = splitConditionArr[0];
					splitConditionArr.shift();
				} else {
					stopCondition = true;
				}
			}
		}

		return sampleChart;
	}

	public openRecord = (id: string) => {
		let options: ComponentFramework.NavigationApi.EntityFormOptions = {
			entityName: "adx_webformstep",
			entityId: id
		};

		this._context.navigation.openForm(options);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void {
		// Add code to update control view
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