import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { IEnvironment, IGetJwt, IJwt, IToken } from './interfaces';
import Login from './pages/Login';
import { DateTime } from 'luxon';
import FlowsViewer from './pages/FlowsViewer';

const App = () => {

  const [token, setToken] = useState<IToken>({ text: '', jwt: null });
  const [selectedEnvironment, selectEnvironment] = useState<IEnvironment | null>(null);

  const handleToken = (newToken: string) => setToken({ text: newToken, jwt: GetJwt(newToken) })
  const handleLogout = () => selectEnvironment(null);

  if (selectedEnvironment && token.jwt) return (
    <FlowsViewer
      selectedEnvironment={selectedEnvironment}
      token={token}
      handleLogout={handleLogout}
    />
  )

  return (
    <Login
      token={token}
      handleToken={handleToken}
      selectEnvironment={selectEnvironment}
    />
  );
}

export default App;

const GetJwt: IGetJwt = (token: string) => {

  if (token && token.includes('.')) {
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

      return {
        expires: jsonPayload.exp,
        name: jsonPayload.name,
        given_name: jsonPayload.given_name,
        email: jsonPayload?.unique_name || jsonPayload.upn
      };

    } catch (e) { return null }
  } else return null

}

export const FriendlyDate = ({ date }: { date: DateTime }) => {
  const now = DateTime.now().setLocale('pt-BR');
  const dateTime = date.setLocale('pt-BR');
  const isDateHasSameMonth = date.hasSame(now, 'month');
  const friendlyDates = {
    tomorrow: `amanhã às ${dateTime.toFormat('HH:mm')}`,
    today: `hoje às ${dateTime.toFormat('HH:mm')}`,
    yesterday: `ontem às ${dateTime.toFormat('HH:mm')}`,
    week: `${dateTime.toFormat(`cccc (dd${isDateHasSameMonth ? '' : ' LLL'})`)} às ${dateTime.toFormat('HH:mm')}`,
    year: `${dateTime.toFormat('dd LLL')} às ${dateTime.toFormat('HH:mm')}`,
    fullDate: dateTime.toFormat('dd LLL yyyy HH:mm')
  }

  const Span = ({ children }: { children: any }) => (
    <span title={dateTime.toFormat('dd/LL/yyyy HH:mm:ss')}>
      {children}
    </span>
  )

  if (dateTime.hasSame(now.plus({ days: 1 }), 'day'))
    return <Span>{friendlyDates.tomorrow}</Span>

  if (dateTime.hasSame(now, 'day'))
    return <Span>{friendlyDates.today}</Span>

  if (dateTime.hasSame(now.minus({ days: 1 }), 'day'))
    return <Span>{friendlyDates.yesterday}</Span>

  if (dateTime.hasSame(now, 'week'))
    return <Span>{friendlyDates.week}</Span>

  if (dateTime.hasSame(now, 'year'))
    return <Span>{friendlyDates.year}</Span>

  return <Span>{friendlyDates.fullDate}</Span>
}