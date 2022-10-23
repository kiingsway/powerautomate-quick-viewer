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

export type IHandleSetFlow = (flowName: IFlow['name'] | null) => Promise<unknown>

export type IHandleUpdateFlowsList = (flowName: IFlow['name'], action: {
  remove?: boolean;
  edit?: {
    state?: 'Started' | 'Stopped';
    title?: string;
    lastModifiedTime?: string;
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

export interface IHeaderAppProps {
  jwt: IJwt;
  env: IEnvironment;
  handleLogout: () => void
}

type AppPages = 'FlowLists' | 'Connections' | 'RecycleBin';

export interface IAppPage {
  title: string,
  page: AppPages,
  icon: JSX.Element
  hide?: boolean;
}

export interface IBreadcrumbProps {
  handleSetFlow: (flowName: IFlow['name'] | null) => void;
  selectedFlow: IFlow | null;
  page: AppPages;
  setPage: React.Dispatch<React.SetStateAction<AppPages>>;
}

export interface IMainTableProps {
  flows: IFlow[];
  handleSetFlow: (flowName: IFlow['name'] | null) => void;
  loadingFlows: Record<ISharedType, boolean>;
  handleGetFlows: (sharedType: ISharedType, force?: boolean) => void;
  obtainedFlows: Record<ISharedType, DateTime | null>;
}