export type IGetJwt = (token: string) => IJwt | null;

export interface LoginProps {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  handleLogin: (e: any) => void;
  handleErrors: (e: any) => void;
  loadingLogin: boolean;
  loginInfo: any;
}

export interface ErrorsProps {
  errors: any[];
  setErrors: (value: React.SetStateAction<any[]>) => void;
}

export interface SelectEnvironmentProps {
  environments: any[];
  loginInfo: any;
  selectEnvironment: React.Dispatch<any>;
  handleLogout: () => void;
}

export type tokenChecks = undefined | 'error' | 'success'

export interface ILoginInfoError {
  error: any
}
export interface ILoginInfo {
  exp: number | string;
  name: string;
  given_name: string;
  unique_name: string;
  upn: string;
}

export interface IEnvironment {
  name: string
  location: string
  type: string
  id: string
  properties: {
    displayName: string
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

export interface IToken {
  text: string;
  jwt: IJwt | null;
}

export interface IAlert {
  id: string;
  message: string;
  intent: 'error' | 'warning' | 'info' | 'success'
}

export interface IJwt {
  expires: string;
  given_name: string;
  name: string;
  email: string;
}

interface IAlertMessage {
  intent: IAlert['intent'];
  action: JSX.Element;
  children: any;
}

interface IAlertsProps {
  alerts: IAlert[];
  handleAlerts: IHandleAlerts;
}

interface ILoginPageProps {
  token: IToken;
  handleToken: (newToken: string) => void;
  handleAlerts: IHandleAlerts;
  setEnvironments: any;
}
type IHandleAlerts = ({ add, remove, removeAll }: IHandleAlertsProps) => void;

interface IHandleAlertsProps {
  add?: {
    id?: string;
    message: any;
    intent: IAlert['intent'];
  }
  remove?: string;
  removeAll?: boolean;
}