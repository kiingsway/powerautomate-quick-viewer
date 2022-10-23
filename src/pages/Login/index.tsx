import React, { useState } from 'react'
import styles from './Login.module.scss'
import { IToken, IEnvironment, IHandleAlertsProps, IAlert } from '../../interfaces';
import { Card } from '@fluentui/react-components/unstable';
import classNames from 'classnames';
import uuid from 'react-uuid';
import { GetEnvironments } from '../../services/requests';
import { Input, Button, Spinner, Avatar, CompoundButton, Badge } from '@fluentui/react-components';
import { BiBuilding, BiClipboard } from 'react-icons/bi';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { DateTime } from 'luxon';
import { ILoginPageProps, ISelectEnvPageProps } from './interfaces';
import AppAlerts from '../../components/AppAlerts';

interface Props {
  token: IToken;
  handleToken: (newToken: string) => void;
  selectEnvironment: React.Dispatch<React.SetStateAction<IEnvironment | null>>;
}

export default function Login({ token, handleToken, selectEnvironment }: Props): JSX.Element {

  const [environments, setEnvironments] = useState<IEnvironment[]>();
  const [alerts, setAlerts] = useState<IAlert[]>([]);

  const handleAlerts = ({ add, remove, removeAll }: IHandleAlertsProps) => {
    if (!add && !remove && !removeAll) return

    if (add) {
      const id = add.id ? add.id : uuid();
      const intent = add.intent;
      const createdDateTime = add.createdDateTime;
      let message: any = add.message?.response?.data?.error;

      if (message) {
        message = `${message?.code}: ${message?.message}`;
      } else message = String(add.message);

      if (!alerts.find(a => a.message === message))
        setAlerts(prev => [{ id, message, intent, createdDateTime }, ...prev]);
      return
    }

    if (remove) { setAlerts(prev => prev.filter(a => a.id !== remove)); return }

    if (removeAll) setAlerts([])
  }

  const handleLogout = () => {
    selectEnvironment(null)
    setEnvironments([]);
  };

  return (
    <div className={styles.Screen}>

      <div>
        {alerts && alerts.length ?
          <Card className={classNames(styles.AlertsCard, styles.BlueScroll)}>
            <AppAlerts
              alerts={alerts}
              handleAlerts={handleAlerts} />
          </Card> : null}
      </div>

      <Card className={classNames('m-0', styles.Card)}>
        {environments && environments.length ?
          <SelectEnvironmentPage
            token={token}
            environments={environments}
            selectEnvironment={selectEnvironment}
            handleLogout={handleLogout} />
          :
          <LoginPage
            token={token}
            handleAlerts={handleAlerts}
            handleToken={handleToken}
            setEnvironments={setEnvironments} />}
      </Card>

      <div className='invisible'>
        {alerts && alerts.length ?
          <Card className={classNames(styles.AlertsCard, styles.BlueScroll)}>
            <AppAlerts
              alerts={alerts}
              handleAlerts={handleAlerts} />
          </Card> : null}
      </div>

    </div>
  )
}

function LoginPage({ token, handleToken, handleAlerts, setEnvironments }: ILoginPageProps): JSX.Element {

  const [loading, setLoading] = useState(false);

  async function handlePaste(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      return handleToken(text);
    } catch (e) {
      console.warn(e);
      handleAlerts({
        add: {
          message: e,
          intent: 'warning',
          createdDateTime: DateTime.now()
        }
      });
    }
  }

  function handleLogin(e: any): void {
    e.preventDefault();
    setLoading(true);

    GetEnvironments(token.text)
      .then(envData => {
        const newEnvironments = envData.data.value;

        if (!newEnvironments.length)
          handleAlerts({ add: { id: 'NoEnv', message: 'Nenhum ambiente encontrado nesta autenticação.', intent: 'info', } });
        else
          handleAlerts({ removeAll: true });

        setEnvironments(newEnvironments);
      })
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
      .finally(() => setLoading(false));
  }

  return (
    <form onSubmit={handleLogin} className={styles.LoginForm}>
      <span>Insira o Bearer Token</span>
      <Input
        id='txtBearer'
        type="search"
        placeholder="Bearer ey..."
        value={token.text}
        onChange={e => handleToken(e.target.value)}
        required
        contentAfter={(
          <BiClipboard
            onClick={handlePaste}
            title='Colar'
            className={styles.LoginForm_PasteButton} />
        )} />
      <Button
        disabled={loading || !Boolean(token.jwt)}
        appearance='primary'
        type='submit'>
        {loading ? <Spinner size='tiny' /> : 'Login'}
      </Button>
      <Button
        as='a'
        appearance='subtle'
        target='__blank'
        href='https://make.powerautomate.com/'
        icon={<HiOutlineExternalLink />}
        iconPosition='after'>
        Abrir Power Automate
      </Button>

    </form>
  );
}

function SelectEnvironmentPage({ token, selectEnvironment, environments, handleLogout }: ISelectEnvPageProps): JSX.Element {

  const [selEnv, selectEnv] = useState<IEnvironment | null>(environments.filter(env => env.properties.isDefault)[0] || null);

  const handleLogin = () => selectEnvironment(selEnv);

  const Environment = ({ env }: any) => {
    const isSelected = selEnv?.name === env.name;
    const isDefault = env.properties.isDefault;

    const IsEnvDefault = () => {
      if (!isDefault)
        return null;
      return (
        <Badge
          appearance="outline"
          color="brand"
          className={styles.EnvironmentForm_Environments_Default}>
          Padrão
        </Badge>
      );
    };

    return (
      <CompoundButton
        size='small'
        onClick={() => selectEnv(env)}
        secondaryContent={env.properties.description}
        appearance='secondary'
        className={styles.EnvironmentForm_Environments_Item}
        icon={<Avatar
          className={styles.EnvironmentForm_Environments_Item_Avatar}
          badge={isSelected ? { status: 'available', size: 'large', outOfOffice: true } : undefined}
          size={48}
          shape="square"
          icon={<BiBuilding />}
          aria-label={env.properties.displayName} />}>

        {env.properties.displayName} <IsEnvDefault />

      </CompoundButton>
    );
  };

  return (
    <div className={styles.EnvironmentForm}>
      <span>Olá, {token.jwt?.given_name}!</span>
      <span>Selecione o ambiente:</span>

      <div className={classNames(styles.EnvironmentForm_Environments, styles.BlueScroll)}>
        {environments.map(env => <Environment key={env.name} env={env} />)}
      </div>

      <div className={styles.EnvironmentForm_Actions}>
        <Button appearance='secondary' onClick={handleLogout}>Voltar</Button>
        <Button appearance='primary' onClick={handleLogin}>Login</Button>
      </div>

    </div>
  );
}