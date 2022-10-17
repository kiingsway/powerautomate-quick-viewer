import { IToken } from "../../interfaces";

export type TSharedTypes = 'personal' | 'team';

export interface INavApp {
  env: any;
  loginInfo: IToken['jwt'];
  handleLogout: any;
}

export interface ILoadings {
  flows: { name: null | string, state: boolean }
}

export interface IAlert {
  id: string;
  message: string;
  intent: 'error' | 'warning' | 'info' | 'success'
}
export interface AlertsProps {
  alerts: IAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<IAlert[]>>
}

export interface IListFlowsProps {
  selectFlow: React.Dispatch<any>;
  selectedEnvironment: any;
  token: string;
  hide: boolean
}