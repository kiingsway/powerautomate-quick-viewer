export interface IAlert {
    id: string;
    message: string;
    intent: 'error' | 'warning' | 'info' | 'success'
}
export interface ErrorsProps {

}

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