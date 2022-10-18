export interface IFlow extends ICloudFlow {
  sharedType: 'personal' | 'team'
}

export interface ICloudFlow {
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
        swaggerOperationId: string;
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

export type IHandleSetFlow = (flowName: IFlow['name'] | null) => Promise<void> | undefined;

export type IHandleUpdateFlowsList = (flowName: IFlow['name'], action: {
  remove?: boolean;
  edit?: {
    state?: 'Started' | 'Stopped';
    title?: string;
    description?: string;
    definition?: any;
  };
}) => void

export type ISharedType = 'personal' | 'team';

export interface IFlowConnection {
  name: string
  id: string
  type: string
  properties: {
    apiId: string
    displayName: string
    iconUri: string
    statuses: {
      status: string
    }[]
    connectionParameters: any;
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
    expirationTime: string
    environment: {
      name: string
      type: string
      id: string
    }
    authenticatedUser: {
      tenantId: string
      objectId: string
      name: string
    }
    isDelegatedAuthConnection: boolean
  }
}
