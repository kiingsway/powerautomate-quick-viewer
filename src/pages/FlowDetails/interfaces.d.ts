export interface IFlowDetailsSummary {

  name: IFlowDetails['name'];
  description: IFlowDetails['properties']['definitionSummary']['description'];
  envName: any;
  displayName: IFlowDetails['properties']['displayName'];
  state: IFlowDetails['properties']['state'];
  flowSuspensionReason: IFlowDetails['properties']['flowSuspensionReason'];
  lastModifiedTime: IFlowDetails['properties']['lastModifiedTime'];
  flowSuspensionTime?: IFlowDetails['properties']['flowSuspensionTime'];
  createdTime: IFlowDetails['properties']['createdTime'];
  flowFailureAlertSubscribed: IFlowDetails['properties']['flowFailureAlertSubscribed'];
  definition: any;
  trigger: {
    uri: IFlowDetails['properties']['flowTriggerUri'];
    name: string;
    summary: {
      type: string;
      kind: string;
      swaggerOperationId: string;
      metadata?: any;
    };
    conditions?: string[];
  };
  actions: {
    value: IFlowDetails['properties']['definition']['actions'];
    summary: string[];
  };
  connections: {
    names: string[];
    references: IFlowDetails['properties']['connectionReferences'];
  };
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
    flowSuspensionTime?: string
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

export interface IFlowRun {
  name: string
  id: string
  type: string
  properties: {
    startTime: string
    endTime: string
    status: IFlowRunStatuses
    code?: string
    error?: {
      code: string
      message: string
    }
    correlation: {
      clientTrackingId: string
      clientKeywords?: string[]
    }
    trigger: {
      name: string
      inputsLink: {
        uri: string
        contentVersion: string
        contentSize: number
        contentHash: {
          algorithm: string
          value: string
        }
      }
      outputsLink: {
        uri: string
        contentVersion: string
        contentSize: number
        contentHash: {
          algorithm: string
          value: string
        }
      }
      startTime: string
      endTime: string
      originHistoryName: string
      correlation: {
        clientTrackingId: string
        clientKeywords?: string[]
      }
      status: string
      sourceHistoryName?: string
    }
  }
}

export type IFlowRunStatuses = 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';

export interface IFlowConnection {
  name: string
  id: string
  type: string
  properties: {
    apiId: string
    displayName: string
    iconUri: string
    statuses: Array<{
      status: string
    }>
    connectionParameters: {
      sku: string
      baseResourceUrl?: string
      "token:ResourceUri"?: string
    }
    createdBy: {
      id: string
      displayName: string
      email: string
      type: string
      tenantId: string
      userPrincipalName: string
    }
    createdTime: string
    lastModifiedTime: string
    environment: {
      name: string
      type: string
      id: string
    }
    authenticatedUser: {
      tenantId?: string
      objectId?: string
      name?: string
    }
    isDelegatedAuthConnection: boolean
    expirationTime?: string
  }
}

type FlowStatus = 'Running' | 'Succeeded' | 'Failed' | 'Cancelled';
type BadgeColors = "subtle" | "danger" | "brand" | "important" | "informative" | "severe" | "success" | "warning";

export interface IFlowSave {
  properties: {
    [key: string]: any;
    displayName: string
    definition: {
      [key: string]: any;
      description: string
    }
  }
}

export interface IFlowSave1 {
  properties: {
    definition: {
      $schema: string
      actions: any
      parameters: any
      triggers: any
      contentVersion: string
      description: string
    }
    connectionReferences: any
    displayName: string
    templateName: string
    environment: {
      name: string
    }
  }
}

import { IHandleUpdateFlowsList } from '../../FlowsViewer/interfaces';

interface RunFlowToolbarProps extends ToolbarProps {
  handleUpdateRuns: () => void;
}

interface ToolbarProps {
  flow: IFlowDetailsSummary
  token: IToken['text'];
  loadingAny: boolean;
  handleAlerts: IHandleAlerts;
  setLoadingAny: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateFlowsList: IHandleUpdateFlowsList;
}