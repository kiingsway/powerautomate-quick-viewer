export interface IFlowDetailsSummary {

  name: IFlowDetails['name'];
  envName: any;
  displayName: IFlowDetails['properties']['displayName'];
  state: IFlowDetails['properties']['state'];
  flowSuspensionReason: IFlowDetails['properties']['flowSuspensionReason'];
  lastModifiedTime: IFlowDetails['properties']['lastModifiedTime'];
  createdTime: IFlowDetails['properties']['createdTime'];
  flowFailureAlertSubscribed: IFlowDetails['properties']['flowFailureAlertSubscribed'];
  trigger: {
    uri: IFlowDetails['properties']['flowTriggerUri'];
    name: string;
    summary: {
      type: string;
      kind: string;
      metadata?: any;
    };
    conditions?: string[];
  };
  actions: {
    value:  IFlowDetails['properties']['definition']['actions'];
    summary: string[];
  };
  connections: {
    names: string[];
    references:  IFlowDetails['properties']['connectionReferences'];
  };
}

export interface IFlowDetailsSummary1 {

  name: IFlowDetails['name'];
  displayName: IFlowDetails['properties']['displayName'];
  state: IFlowDetails['properties']['state'];
  flowSuspensionReason: IFlowDetails['properties']['flowSuspensionReason'];
  description: IFlowDetails['properties']['definitionSummary']['description'];
  trigger: any;
  triggerName: string | null;
  triggerSummary: any;
  triggerConditions: any;
  actions: any;
  actionsSummary: any;
  envName: any;
  flowTriggerUri: any;
  connectionReferences: any;
  connectionsNames: any[];
  lastModifiedTime: any;
  createdTime: any;
  flowFailureAlertSubscribed: any;
}
export interface IFlowDetails {
  name: string
  id: string
  type: string
  properties: {
    apiId: string
    displayName: string
    userType: string
    definition: {
      $schema: string
      contentVersion: string
      parameters: any
      triggers: any;
      actions: any;
      description: string
    }
    triggerSchema: {
      type: string
      properties: any;
      required: Array<any>
    }
    state: string
    connectionReferences: any
    installedConnectionReferences: any
    createdTime: string
    lastModifiedTime: string
    flowSuspensionReason: string
    environment: {
      name: string
      type: string
      id: string
    }
    definitionSummary: {
      triggers: Array<{
        type: string
        kind: string
        metadata: {
          operationMetadataId: string
        }
      }>
      actions: {
        type: string
        metadata: {
          operationMetadataId: string
        }
        swaggerOperationId?: string
      }[]
      description: string
    }
    creator: {
      tenantId: string
      objectId: string
      userId: string
      userType: string
    }
    flowTriggerUri: string
    installationStatus: string
    provisioningMethod: string
    flowFailureAlertSubscribed: boolean
    referencedResources: any[];
    isManaged: boolean
  }
}
