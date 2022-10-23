import { IToken } from '../../interfaces'

export interface IAlertMessage {
    intent: IAlert['intent'];
    action: JSX.Element;
    children: any;
}

export interface IAlertsProps {
    alerts: IAlert[];
    handleAlerts: IHandleAlerts;
    maxHeight: number;
}

export interface ILoginPageProps {
    token: IToken;
    handleToken: (newToken: string) => void;
    handleAlerts: IHandleAlerts;
    setEnvironments: any;
}

export interface ISelectEnvPageProps {
    token: IToken;
    environments: IEnvironment[];
    selectEnvironment: React.Dispatch<React.SetStateAction<IEnvironment | null>>;
    handleLogout: () => void
}