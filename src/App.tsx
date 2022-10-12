import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Alert, Card } from '@fluentui/react-components/unstable';
import { Button, CompoundButton, Divider, Input, PresenceBadge, Spinner, Tooltip } from '@fluentui/react-components';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { BiClipboard, BiBuilding } from 'react-icons/bi';
import styles from './App.module.scss'
import { AiFillCloseCircle } from 'react-icons/ai';
import { GetEnvironments } from './services/requests';
import uuid from 'react-uuid';
import classNames from 'classnames';
import Viewer from './pages/Viewer';
import { ErrorsProps, ILoginInfo, ILoginInfoError, LoginProps, SelectEnvironmentProps, tokenChecks } from './interfaces';

export default function App() {

  const [token, setToken] = useState<string>('')
  const [loginInfo, setLoginInfo] = useState<ILoginInfo | ILoginInfoError>()
  const [environments, setEnvironments] = useState<any[]>([])
  const [selectedEnvironment, selectEnvironment] = useState<any>();
  const [errors, setErrors] = useState<any[]>([]);
  const [loadingLogin, setLoadingLogin] = useState(false);

  useEffect(() => {

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = JSON.parse(decodeURIComponent(
          window
            .atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        ));

        setLoginInfo({
          exp: jsonPayload.exp,
          name: jsonPayload.name,
          given_name: jsonPayload.given_name,
          unique_name: jsonPayload.unique_name,
          upn: jsonPayload.upn,
        });

      } catch (e) {
        setLoginInfo({ error: { message: e } });
      }
    }
  }, [token])

  const handleLogout = () => {
    setEnvironments([])
    selectEnvironment(null)
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    setErrors([])
    setLoadingLogin(true)

    GetEnvironments(token)
      .then((envsData: any) => {
        setErrors([])
        const newEnvs = envsData.data.value
          .sort((a: any, b: any) => a.properties.isDefault === b.properties.isDefault ? 0 : (a.properties.isDefault ? -1 : 1))
          .sort((a: any, b: any) => (a.properties.displayName > b.properties.displayName) ? 1 : -1)
        setEnvironments(newEnvs)
      })
      .catch(e => handleErrors(e))
      .finally(() => setLoadingLogin(false))
  }

  const handleErrors = (e: any) => {
    const newError = { ...e.response.data, id: uuid() };
    setErrors(prev => prev.length ? [newError, ...prev] : [newError])
  }

  if (environments.length && selectedEnvironment && loginInfo)
    return <Viewer
      token={token}
      loginInfo={loginInfo as ILoginInfo}
      handleLogout={handleLogout}
      selectedEnvironment={selectedEnvironment}
    />

  else
    return (
      <div className='d-flex justify-content-center align-items-center h-100 flex-column'>
        <div className={classNames(styles.login_card)}>
          {
            environments.length && !selectedEnvironment ?
              <SelectEnvironment
                loginInfo={loginInfo}
                environments={environments}
                selectEnvironment={selectEnvironment}
                handleLogout={handleLogout}
              />
              :
              <LoginPage
                handleErrors={handleErrors}
                loginInfo={loginInfo}
                token={token}
                setToken={setToken}
                handleLogin={handleLogin}
                loadingLogin={loadingLogin} />
          }
        </div>
        <Errors errors={errors} setErrors={setErrors} />
      </div>
    )
}

const SelectEnvironment = (props: SelectEnvironmentProps) => {

  const Environment = ({ env }: any) => (
    <>
      <Tooltip
        content={`${env.properties.isDefault ? 'Ambiente padrão - ' : ''}${env.properties.displayName}`}
        relationship="label"
        showDelay={env.properties.isDefault ? 100 : 10000}>

        <CompoundButton
          onClick={() => props.selectEnvironment(env)}
          style={{ width: 220 }}
          icon={<BiBuilding />}
          secondaryContent={env.properties.description}
          className={styles.login_card_envs_button}>

          <div className='d-flex align-items-center flex-row'>
            {env.properties.displayName}
            {env.properties.isDefault &&
              <PresenceBadge className='ms-2' title='Ambiente Padrão' />}
          </div>

        </CompoundButton>
      </Tooltip>

      {env.properties.isDefault &&
        <Divider inset style={{ marginBottom: 9 }} />}
    </>
  )

  return (
    <div className={styles.login}>
      <div className='d-flex flex-column align-items-center'>
        <p>Olá, {props.loginInfo.given_name}!</p>
        <p>Selecione o ambiente:</p>
      </div>

      <div className={classNames(styles.login_card_envs, styles.modern_scroll)}>
        {props.environments.map(env => <Environment key={env.name} env={env} />)}
      </div>
      <><Button appearance='secondary' onClick={props.handleLogout}>Voltar</Button></>
    </div >
  )
}

const LoginPage = (props: LoginProps) => {

  const handlePaste = () =>
    navigator.clipboard.readText()
      .then(text => props.setToken(text))
      .catch(props.handleErrors);

  const handleCheckToken = () => {
    if (!props.loginInfo || !props.token)
      return undefined

    if (props.loginInfo?.error)
      return 'error'

    return 'success'
  }

  const checkToken: tokenChecks = handleCheckToken();

  return (
    <form
      onSubmit={props.handleLogin}
      className={classNames(styles.login)}>

      <span>Insira o Bearer Token</span>
      <div>
        <Input
          id='txtBearer'
          type="search"
          placeholder="Bearer ey..."
          value={props.token}
          required
          onChange={e => props.setToken(e.target.value)}

          contentAfter={(
            <BiClipboard
              onClick={handlePaste}
              title='Colar'
              className={styles.login_pasteToken} />
          )}
        />
      </div>
      <Button
        disabled={props.loadingLogin || checkToken !== 'success'}
        appearance='primary'
        type='submit'>
        {props.loadingLogin ? <Spinner size='tiny' /> : 'Login'}
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

const Errors = (props: ErrorsProps) => {

  return (
    <>
      {props.errors.map(e =>
        <Card key={e.id} className={styles.login_card_errors}>
          <Alert
            intent="error"
            action={
              <div onClick={() => props.setErrors(prev => prev.filter(err => err.id !== e.id))}>
                <AiFillCloseCircle style={{ marginLeft: 5 }} />
                Fechar
              </div>
            }
            className='w-100'>
            <span className={styles.login_card_errors_text}>
              {JSON.stringify(e)}
            </span>
          </Alert>
        </Card>
      )}
    </>
  )
}