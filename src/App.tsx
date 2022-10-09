import React, { useEffect, useId, useState } from 'react';
import styles from './App.module.scss';
import { Card } from '@fluentui/react-components/unstable';
import MainScreen from './components/MainScreen';
import { GetEnvironments } from './services/requests';
import { Button, Input, Label, Spinner, Textarea, Tooltip } from '@fluentui/react-components';
import { BiClipboard } from 'react-icons/bi'
import { SiSpinrilla } from 'react-icons/si'

export default function App() {

  const [token, setToken] = useState<string>('')
  const [environments, setEnvironments] = useState<any[]>([])
  const [error, setError] = useState<string | JSX.Element>(<></>);
  const [loadingLogin, setLoadingLogin] = useState(false);

  useEffect(() => {
    if (environments.length) console.log(environments)

  }, [environments])

  const handleLogout = () => setEnvironments([]);
  const handleLogin = () => {
    setLoadingLogin(true)

    GetEnvironments(token)
      .then((envsData: any) => {
        setError(<></>)
        setEnvironments(envsData.data.value)
      })
      .catch(e => handleErrors(e))
      .finally(() => {
        setLoadingLogin(false);
      })
  }
  const handleErrors = (e: any) => {

    // alert(JSON.stringify(e));
    // console.log(e);

    let error: string | JSX.Element = JSON.stringify(e);

    if (e?.response?.data?.error?.code) error = <><b>({e.response.data.error.code})</b>: {e.response.data.error.message}</>

    setError(error)


  }


  return (

    <div className={styles.App}>

      <div className={styles.cardContainer}>

        {
          environments.length ?
            <MainScreen
              environments={environments}
              handleLogout={handleLogout}
              token={token}
            />
            :
            <LoginPage handleLogin={handleLogin} token={token} setToken={setToken} error={error} loadingLogin={loadingLogin} />
        }

      </div>

    </div>
  );
}

const LoginPage = (pr: { handleLogin: any, token: string; setToken: any; error: string | JSX.Element; loadingLogin: boolean }) => {

  const txtBearer = useId();

  const handlePaste = () => {

    navigator.clipboard.readText()
      .then(text => {
        pr.setToken(text)
      })
      .catch(err => {
        alert('Failed to read clipboard contents: ' + err);
      });
  }

  return (
    <Card className={styles.login}>

      <Label htmlFor={txtBearer} className={styles.login_label}>
        Insira o Token Bearer
      </Label>

      <div className={styles.login_form}>
        <Input
          id={txtBearer}
          type="search"
          placeholder="Bearer ey..."
          value={pr.token}
          onChange={e => pr.setToken(e.target.value)}

          contentAfter={(
            <BiClipboard
              onClick={handlePaste}
              title='Colar'
              className={styles.login_pasteToken} />
          )}
        />
      </div>

      <span className={styles.login_error}>
        {pr.error}
      </span>

      <Button
        disabled={pr.loadingLogin}
        appearance="primary"
        onClick={pr.handleLogin}
        className={styles.login_button}
      >
        {pr.loadingLogin ?
          <>
            <Spinner size='tiny' />
          </>
          :
          'Login'}
      </Button>

    </Card>
  )
}