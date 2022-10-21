import { DateTime } from "luxon";

export type IGetJwt = (token: string) => IJwt | null;

export interface IToken {
  text: string;
  jwt: IJwt | null;
}

export interface IJwt {
  expires: string;
  given_name: string;
  name: string;
  email: string;
}

export interface IEnvironment {
  name: string
  location: string
  type: string
  id: string
  properties: {
    displayName: string
    description: string
    createdTime: string
    createdBy: {
      id: string
      displayName: string
      type: string
    }
    provisioningState: string
    creationType: string
    environmentSku: string
    environmentType: string
    states: {
      management: any
      runtime: any
    }
    isDefault: boolean
    isPayAsYouGoEnabled: boolean
    azureRegionHint: string
    runtimeEndpoints: any
    linkedEnvironmentMetadata: {
      type: string
      resourceId: string
      friendlyName: string
      uniqueName: string
      domainName: string
      version: string
      instanceUrl: string
      instanceApiUrl: string
      baseLanguage: number
      instanceState: string
      createdTime: string
    }
    environmentFeatures: {
      isOpenApiEnabled: boolean
    }
    cluster: {
      category: string
      number: string
      uriSuffix: string
      geoShortName: string
      environment: string
    }
    governanceConfiguration: {
      protectionLevel: string
    }
  }
}

type IHandleAlerts = ({ add, remove, removeAll }: IHandleAlertsProps) => void;

interface IHandleAlertsProps {
  add?: {
      id?: string;
      message: any;
      intent: IAlert['intent'];
      createdDateTime: DateTime;
    }
    remove?: string;
    removeAll?: boolean;
  }
  
  export interface IAlert {
    id: string;
    message: string;
    intent: 'error' | 'warning' | 'info' | 'success'
    createdDateTime: DateTime;
}