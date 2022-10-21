import React, { useState } from 'react'
import styles from './Login.module.scss'
import { IToken, IEnvironment, IHandleAlertsProps, IAlert } from '../../interfaces';
import { Card } from '@fluentui/react-components/unstable';
import classNames from 'classnames';
import uuid from 'react-uuid';
import { GetEnvironments } from '../../services/requests';
import { Input, Button, Spinner, Avatar, Divider } from '@fluentui/react-components';
import { BiBuilding, BiClipboard, BiInfoCircle } from 'react-icons/bi';
import { TbAlertTriangle } from 'react-icons/tb';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { AiOutlineExclamationCircle, AiOutlineQuestionCircle } from 'react-icons/ai';
import { BsCheckCircle } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { DateTime } from 'luxon';
import { FriendlyDate } from '../../App';
import { IAlertMessage, IAlertsProps, ILoginPageProps } from './interfaces';

interface Props {
  token: IToken;
  handleToken: (newToken: string) => void;
  selectEnvironment: React.Dispatch<React.SetStateAction<IEnvironment | null>>;
}

export default function Login({ token, handleToken, selectEnvironment }: Props) {

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
        setAlerts(prev => [{ id, message, intent, createdDateTime }, ...prev])
    }

    if (remove) setAlerts(prev => prev.filter(a => a.id !== remove))

    if (removeAll) setAlerts(prev => [])
  }

  const handleLogout = () => {
    selectEnvironment(null)
    setEnvironments([]);
  };


  return (
    <div className='d-flex justify-content-center align-items-center h-100 flex-column mx-4'>
      <Card className={classNames(styles.Card, styles.LoginCard)}>
        {environments && environments.length ?
          <SelectEnvironmentPage
            token={token}
            environments={environments}
            selectEnvironment={selectEnvironment}
            handleLogout={handleLogout}
          />
          :
          <LoginPage
            token={token}
            handleAlerts={handleAlerts}
            handleToken={handleToken}
            setEnvironments={setEnvironments}
          />
        }


      </Card>
      {alerts.length ? <Card className={classNames(styles.AlertsCard, styles.BlueScroll)}>
        <Alerts
          maxHeight={300}
          alerts={alerts}
          handleAlerts={handleAlerts}
        />
      </Card> : null}
    </div>
  )
}

const LoginPage = ({ token, handleToken, handleAlerts, setEnvironments }: ILoginPageProps) => {

  const [loading, setLoading] = useState(false);

  const handlePaste = () =>
    navigator.clipboard.readText()
      .then(text => handleToken(text))
      .catch(e => handleAlerts({ add: { message: String(e), intent: 'warning' } }));

  const handleLogin = (e: any) => {
    e.preventDefault();
    setLoading(true)

    GetEnvironments(token.text)
      .then(envData => {
        const newEnvironments = envData.data.value;

        if (!newEnvironments.length)
          handleAlerts({ add: { id: 'NoEnv', message: 'Nenhum ambiente encontrado nesta autenticação', intent: 'info' } })
        else
          handleAlerts({ removeAll: true });

        setEnvironments(newEnvironments);
      })
      .catch(e => handleAlerts({ add: { message: e, intent: 'error' } }))
      .finally(() => setLoading(false))
  }

  return (
    <form
      onSubmit={handleLogin}
      className={classNames(styles.Card, styles.LoginCard_Form)}>

      <span>Insira o Bearer Token</span>
      <div>
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
              className={styles.LoginCard_PasteButton} />
          )}
        />
      </div>
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
  )
}

interface ISelectEnvPageProps {
  token: IToken;
  environments: IEnvironment[];
  selectEnvironment: React.Dispatch<React.SetStateAction<IEnvironment | null>>;
  handleLogout: () => void
}

const SelectEnvironmentPage = ({ token, selectEnvironment, environments, handleLogout }: ISelectEnvPageProps) => {

  const [selEnv, selectEnv] = useState<IEnvironment | null>(environments.filter(env => env.properties.isDefault)[0] || null)

  const handleLogin = () => selectEnvironment(selEnv);

  const Environment = ({ env }: any) => {
    const isSelected = selEnv?.name === env.name;
    const isDefault = env.properties.isDefault;
    return (
      <div
        onClick={() => selectEnv(env)}
        className={classNames(styles.EnvCard_EnvironmentAvatar, { [styles.EnvCard_EnvironmentAvatar_Selected]: isSelected })}
      >
        <Avatar
          badge={isSelected ? { status: 'available', size: 'medium' } : undefined}
          size={36}
          shape="square"
          icon={<BiBuilding />}
          aria-label={env.properties.displayName} />
        <div className={styles.EnvCard_EnvironmentAvatar_Text}>
          <span>
            {env.properties.displayName}
          </span>
          {isDefault ?
            <span className={styles.EnvCard_EnvironmentAvatar_EnvDefault}>
              Ambiente padrão
            </span> : null
          }
          <span className={styles.EnvCard_EnvironmentAvatar_Description}>
            {env.properties.description}
          </span>

        </div>
      </div>
    )
  }

  return (
    <div className={classNames(styles.Card, styles.EnvCard)}>
      <div className='d-flex flex-column align-items-center'>
        <p>Olá, {token.jwt?.given_name}!</p>
        <p>Selecione o ambiente:</p>
      </div>

      <div className={classNames(styles.EnvCard_Environments, styles.BlueScroll)}>
        {environments.map(env => <Environment key={env.name} env={env} />)}
      </div>

      <div className={styles.EnvCard_Actions}>
        <Button appearance='secondary' onClick={handleLogout}>Voltar</Button>
        <Button appearance='primary' onClick={handleLogin}>Login</Button>
      </div>

    </div >
  )
}

export const Alerts = ({ alerts, handleAlerts, maxHeight }: IAlertsProps) => {

  if (!alerts.length) return null

  return (
    <div style={{ maxHeight, overflow: 'auto' }} className={styles.BlueScroll}>

      {alerts.length > 1 ?
        <div className='d-flex justify-content-end sticky-top'>
          <Button
            className={styles.AlertsCard_RemoveAllAlerts}
            size='small'
            appearance='secondary'
            onClick={() => handleAlerts({ removeAll: true })}
            icon={<IoMdClose />}>
            Fechar todos
          </Button>
        </div> : null}

      {alerts.map(alert =>
        <AlertMessage
          key={alert.id}
          intent={alert.intent}
          action={<Button
            style={{ maxWidth: '300px' }}
            size='small'
            appearance='subtle'
            onClick={() => handleAlerts({ remove: alert.id })}
            icon={<IoMdClose />}>
            Fechar
          </Button>}>
          {String(alert.message)}
        </AlertMessage >
      )}

    </div>
  )
}

const AlertMessage = ({ intent, action, children }: IAlertMessage) => {

  const IntentIcon = () => {
    if (intent === 'success')
      return <BsCheckCircle className='text-success flex-shrink-0' />

    if (intent === 'info')
      return <BiInfoCircle className='text-info flex-shrink-0' />

    if (intent === 'warning')
      return <TbAlertTriangle className='text-warning flex-shrink-0' />

    if (intent === 'error')
      return <AiOutlineExclamationCircle className='text-danger flex-shrink-0' />

    return <AiOutlineQuestionCircle />
  }

  return (
    <Card className={styles.AlertsCard_Alert}>

      <div className={styles.AlertsCard_Alert_Body}>
        <div className={styles.AlertsCard_Alert_Body_Icon}>
          <IntentIcon />
        </div>
        <div className={styles.AlertsCard_Alert_Body_Time}>
          <FriendlyDate date={DateTime.now()} />
        </div>
        <div className={styles.AlertsCard_Alert_Body_Children}>
          {children}
        </div>
      </div>

      <div className={styles.AlertsCard_Alert_Intent}>
        {action}
      </div>

    </Card>
  )

}