import { Avatar, Badge, Button, CompoundButton, Divider, LargeTitle, Link, PresenceBadge, Spinner, Tab, TabList, Title3, Tooltip } from '@fluentui/react-components';
import { Alert, Card } from '@fluentui/react-components/unstable';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react'
import { BiDetail, BiHistory, BiLogOut, BiTrash } from 'react-icons/bi'
import { BsFillPersonFill, BsPeopleFill } from 'react-icons/bs'
import { IoMdClose } from 'react-icons/io';
import uuid from 'react-uuid';
import QuickTable, { IQuickTableColumnDefinition, IQuickTableStyleDefinition } from '../../components/QuickTable';
import { IToken } from '../../interfaces';
import { GetFlows } from '../../services/requests';
import FlowDetails from '../FlowDetails';
import { AlertsProps, IAlert, IListFlowsProps, ILoadings, INavApp, TSharedTypes } from './interfaces';
import styles from './Viewer.module.scss'

interface Props {
  loginInfo: IToken['jwt'];
  token: string;
  handleLogout: () => void;
  selectedEnvironment: any;
}

export default function Viewer(props: Props) {

  const [selectedFlow, selectFlow] = useState<any>();

  const env = {
    displayName: props.selectedEnvironment.properties.displayName
  }

  const Breadcrumb = () => (
    <ul className={classNames(styles.breadcrumb, styles.App_Breadcrumb)}>
      <li>
        <span
          className={classNames(styles.App_Breadcrumb_Level0, { [styles.App_Breadcrumb_Level0_Link]: Boolean(selectedFlow?.name) })}
          onClick={() => selectFlow(undefined)}
        >
          Fluxos
        </span>
      </li>
      {
        selectedFlow?.name ?
          <li>
            <span className={classNames(styles.App_Breadcrumb_Level1)}>
              {selectedFlow['properties.displayName']}
            </span>
          </li> : null
      }
    </ul>
  )

  return (
    <div className={styles.App}>
      <NavApp
        env={env}
        handleLogout={props.handleLogout}
        loginInfo={props.loginInfo}
      />

      <Breadcrumb />

      {/* {selectedFlow &&
        <FlowDetails
          handleAlerts={}
          token={props.token}
          handleSetFlow={selectFlow}
          selectedFlow={selectedFlow} />} */}

      <ListFlows
        selectFlow={selectFlow}
        hide={Boolean(selectedFlow)}
        token={props.token}
        selectedEnvironment={props.selectedEnvironment}
      />
    </div>
  )
}

const NavApp = (props: INavApp) => {

  const expirationTime = DateTime
    .fromMillis(parseInt(String(props.loginInfo?.expires)) * 1000)
    .toFormat('HH:mm:ss')

  const expirationDate = DateTime
    .fromISO(`${DateTime.now().toFormat('yyyy-MM-dd')}T${expirationTime}-03:00`)

  const [tokenTimeLeft, setTokenTimeLeft] = useState(expirationDate.diffNow().toFormat('hh:mm:ss'));

  useEffect(() => {

    const timer = setInterval(() => {
      setTokenTimeLeft(expirationDate.diffNow().toFormat('hh:mm:ss'))
    }, 1000);

    return () => clearInterval(timer);

  }, [tokenTimeLeft]);

  return (
    <nav className={classNames(`navbar bg-dark text-light`, styles.App_Header)}>
      <div className="container-fluid">
        <span className="navbar-brand text-light">{props.env.displayName}</span>
        <div className='d-flex flex-row align-items-center' style={{ gap: '10px' }}>

          <div className='d-flex flex-column align-items-end'>
            <span>{props.loginInfo?.name}</span>
            <small className='text-muted'>{props.loginInfo?.email}</small>
          </div>

          <Tooltip
            content={<>Tempo restante para<br />a expiração do token.<br />Expira {friendlyDate(expirationDate)}.</>}
            relationship="label"
            showDelay={100}>
            <Badge appearance="outline" className='px-3'>
              {tokenTimeLeft}
            </Badge>
          </Tooltip>

          <Tooltip
            content={`Log-out de ${props.env.displayName}`}
            relationship="label"
            showDelay={100}>
            <Button
              appearance='primary'
              onClick={props.handleLogout}
              icon={<Avatar icon={<BiLogOut />} aria-label="Log-out" />}
              shape="circular" />
          </Tooltip>
        </div>
      </div>
    </nav>
  )
}

const timeGetDef: Record<TSharedTypes, null | DateTime> = {
  personal: null,
  team: null,
}

const ListFlows = (props: IListFlowsProps) => {

  const [flows, setFlows] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loadings, setLoadings] = useState<ILoadings>({ flows: { name: null, state: false } });
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [timeGet, setTimeGet] = useState(timeGetDef)

  const handleError = (e: any) => {
    const alert: IAlert = { intent: 'error', message: JSON.stringify(e), id: uuid() };
    setAlerts(prev => prev?.length ? ([alert, ...prev]) : [alert])
    console.error(e);
  }

  const handleGetFlows = (sharedType: TSharedTypes, force?: boolean) => {
    if (flows.length && !force) return
    setLoadings(prev => ({ ...prev, flows: { name: sharedType, state: true } }))

    GetFlows(props.token, props.selectedEnvironment.name, sharedType)
      .then(flowsData => {

        let newFlows = flowsData.data?.value as any[] || [];

        const getClienteFlow = (name: string) => {
          let cliente: string = '';
          if (name.includes('[') && name.includes(']')) {
            cliente = name
              .split('[')[1]
              .split(']')[0]
              .split('-')[0]
              .trim()
          }
          return cliente
        }

        const getAmbienteFlow = (name: string) => {
          if (name.toLowerCase().includes(' dev]'))
            return 'DEV'
          if (name.toLowerCase().includes(' dev class]'))
            return 'DEV Class'
          if (name.toLowerCase().includes(' dev cliente]'))
            return 'DEV Cliente'
          if (name.toLowerCase().includes(' hml]'))
            return 'HML'
          if (name.toLowerCase().includes(' hml class]'))
            return 'HML Class'
          if (name.toLowerCase().includes(' hml cliente]'))
            return 'HML Cliente'
          if (name.toLowerCase().includes(' prod]'))
            return 'PROD'
        }

        const sharedTypes = {
          personal: 'Pessoal',
          team: 'Compartilhado'
        }

        const states = {
          Started: 'Ativado',
          Suspended: 'Suspenso',
          Stopped: 'Parado'
        }

        newFlows = newFlows.map(f => (
          {
            ...f,
            properties: { ...f.properties, state: states[f.properties.state as keyof typeof states] },
            ambiente: getAmbienteFlow(f.properties.displayName),
            cliente: getClienteFlow(f.properties.displayName),
            sharedType: sharedType === 'personal' || sharedType === 'team' ? sharedTypes[sharedType] : sharedType
          }
        ))

        const uniqueNewFlows = Array.from(new Map(newFlows.map(item => [item.name, item])).values());
        setFlows(prev => [...uniqueNewFlows, ...prev.filter(f => f.sharedType !== sharedTypes[sharedType])]);

      })
      .catch(handleError)
      .finally(() => {
        setLoadings(prev => ({ ...prev, flows: { name: sharedType, state: false } }));
        setTimeGet(prev => ({ ...prev, [sharedType]: DateTime.now() }));
      })

  }

  const handleGetConnections = () => {
  }

  useEffect(() => {

    handleGetFlows('personal');
    handleGetConnections();
  }, [])

  const tableCols: IQuickTableColumnDefinition[] = [
    {
      title: 'Compartilhamento',
      acessor: 'sharedType',
      render: (value: any) => {
        return <Tooltip
          content={<>{value}</>}
          relationship="label"
          showDelay={100}>
          <div className='text-center'>
            {value === 'Pessoal' ? <BsFillPersonFill /> : <BsPeopleFill />}
          </div>
        </Tooltip>
      }
    },
    {
      title: 'Status',
      acessor: 'properties.state',
      render: (value: any) => {
        const Badges = {
          Ativado: 'available',
          Parado: 'offline',
          Suspenso: 'away'
        }
        return <Tooltip
          content={value}
          relationship="label"
          showDelay={100}>
          <div className='text-center'>
            {value === 'Ativado' || value === 'Parado' || value === 'Suspenso' ?
              <PresenceBadge outOfOffice status={Badges[value as keyof typeof Badges] as 'available' | 'offline' | 'away'} />
              : <PresenceBadge outOfOffice status="out-of-office" />}
          </div>
        </Tooltip>
      }
    },
    {
      title: 'Nome',
      acessor: 'properties.displayName',
      filterable: false,
      render: (value: any, item: any) => (
        <Button
          onClick={() => props.selectFlow(item)}
          className={classNames(styles.flist_select, 'w-100')}
          appearance='subtle'>
          {value}
        </Button>)
    },
    {
      title: 'Modificado',
      acessor: 'properties.lastModifiedTime',
      filterable: false,
      render: (value: any, item: any) => <>{friendlyDate(DateTime.fromISO(value))}</>

    },
    {
      title: 'Criado',
      acessor: 'properties.createdTime',
      filterable: false,
      render: (value: any, item: any) => <>{friendlyDate(DateTime.fromISO(value))}</>
    },
    {
      title: 'Cliente',
      acessor: 'cliente'
    },
    {
      title: 'Ambiente',
      acessor: 'ambiente'
    },
    {
      title: 'flowName',
      acessor: 'name',
      show: false
    },
    {
      title: 'envName',
      acessor: 'properties.environment.name',
      show: false
    }
  ]

  const isLoadingPersonalFlows = loadings.flows.state && loadings.flows.name === 'personal';
  const isLoadingTeamFlows = loadings.flows.state && loadings.flows.name === 'team';

  return (
    <div className={classNames(styles.App_Main, { 'd-none': props.hide })}>
      <Alerts alerts={alerts} setAlerts={setAlerts} />
      <div className={styles.table_card}>
        <div className={styles.table_card_toolbar}>

          <div className='ps-2'>
            <CompoundButton
              size='small'
              disabled={loadings.flows.state}
              onClick={() => handleGetFlows('personal', true)}
              className='me-3'
              secondaryContent={timeGet.personal && !loadings.flows.state ? `Obtido ${friendlyDate(timeGet.personal as DateTime)}` : undefined}
              icon={isLoadingPersonalFlows ? <Spinner size='small' /> : <BsFillPersonFill />}>
              {timeGet.personal ? (isLoadingPersonalFlows ? 'Atualizando' : 'Atualizar') : (isLoadingPersonalFlows ? 'Obtendo' : 'Obter')} meus fluxos
            </CompoundButton>
            <CompoundButton
              size='small'
              disabled={loadings.flows.state}
              onClick={() => handleGetFlows('team', true)}
              secondaryContent={timeGet.team && !loadings.flows.state ? `Obtido ${friendlyDate(timeGet.team as DateTime)}` : undefined}
              icon={isLoadingTeamFlows ? <Spinner size='small' /> : <BsPeopleFill />}>
              {timeGet.team ? (isLoadingTeamFlows ? 'Atualizando...' : 'Atualizar') : (isLoadingTeamFlows ? 'Obtendo' : 'Obter')} fluxos compartilhados
            </CompoundButton>
          </div>

          <div>
            {connections.map(conn => {
              return (
                <Avatar name="King Sway" badge={{ status: 'busy' }} />
              )
            })}
          </div>
        </div>

        {flows?.length ?
          <div className={styles.FadeIn}>
            <QuickTable
              style={tableStyle}
              columns={tableCols}
              data={flows}
              itensPerPage={50}
            />
          </div> : null
        }


      </div>
    </div>
  )
}

const Alerts = ({ alerts, setAlerts }: AlertsProps) => {

  return (
    <div className={classNames('mb-2 mx-2')}>
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          intent={alert.intent}
          className={classNames('mb-2', styles.alerts)}
          action={
            <Button
              icon={<IoMdClose />}
              iconPosition='after'
              className={classNames('mb-2', styles.alerts)}
              onClick={() => setAlerts((prev: any) => prev.filter((a: any) => a.id !== alert.id))}
            >
              Fechar
            </Button>
          }>
          {alert.message}
        </Alert>
      ))}
    </div>
  )
}

const tableStyle: IQuickTableStyleDefinition = {
  all: {
    fontFamily: 'Segoe UI',
    backgroundColor: '#292929',
    color: 'white',
  },
  searchText: {
    color: 'white',
    border: '1px solid #999',
    padding: '4px 8px',
    marginRight: '15px',
    borderRadius: 3,
    backgroundColor: '#232323',
  },
  filterSelect: {
    padding: '3px 8px',
    backgroundColor: '#232323',
    border: 0,
    color: 'white'
  },
  filterSelectOutline: {
    borderRadius: 3,
    padding: 1,
    margin: '3px 3px 3px 0',
    border: '1px solid #999',
  },
  table: {
    marginTop: '10px',
    width: '100%'
  },
  th: {
    fontWeight: 500
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #555'
  }
}

const friendlyDate = (date: DateTime) => {
  const now = DateTime.now().setLocale('pt-BR');
  const dateTime = date.setLocale('pt-BR');
  const isDateHasSameMonth = date.hasSame(now, 'month');
  const friendlyDates = {
    today: `hoje às ${dateTime.toFormat('HH:mm')}`,
    yesterday: `ontem às ${dateTime.toFormat('HH:mm')}`,
    week: `${dateTime.toFormat(`cccc (dd${isDateHasSameMonth ? '' : ' LLL'})`)} às ${dateTime.toFormat('HH:mm')}`,
    year: `${dateTime.toFormat('dd LLL')} às ${dateTime.toFormat('HH:mm')}`,
    fullDate: dateTime.toFormat('dd LLL yyyy HH:mm')
  }

  if (dateTime.hasSame(now, 'day'))
    return friendlyDates.today

  if (dateTime.hasSame(now.minus({ days: 1 }), 'day'))
    return friendlyDates.yesterday

  if (dateTime.hasSame(now, 'week'))
    return friendlyDates.week

  if (dateTime.hasSame(now, 'year'))
    return friendlyDates.year

  return friendlyDates.fullDate
}