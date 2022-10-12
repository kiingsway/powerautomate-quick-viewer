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