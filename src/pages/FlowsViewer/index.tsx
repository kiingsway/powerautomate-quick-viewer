import { Avatar, Badge, Button, CompoundButton, PresenceBadge, Spinner, Tooltip } from '@fluentui/react-components';
import { Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Persona } from '@fluentui/react-components/unstable';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react'
import { BsFillPersonFill, BsPeopleFill } from 'react-icons/bs';
import uuid from 'react-uuid';
import { FriendlyDate } from '../../App';
import QuickTable, { IQuickTableColumnDefinition, IQuickTableStyleDefinition } from '../../components/QuickTable';
import { IEnvironment, IJwt, IToken } from '../../interfaces';
import { GetFlow, GetFlows } from '../../services/requests';
import FlowDetails from '../FlowDetails';
import { Alerts } from '../Login';
import { IAlert, IHandleAlerts, IHandleAlertsProps } from '../Login/interfaces';
import styles from './FlowsViewer.module.scss'
import { IFlow, IHandleSetFlow, IHandleUpdateFlowsList, ISharedType } from './interfaces';

interface Props {
  token: IToken;
  selectedEnvironment: IEnvironment;
  handleLogout: () => void;
}

export default function FlowsViewer({ token, handleLogout, selectedEnvironment, }: Props) {

  const [selectedFlow, selectFlow] = useState<IFlow | null>(null);
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [loadingFlows, setLoadingFlows] = useState<Record<ISharedType, boolean>>({ personal: false, team: false });
  const [obtainedFlows, setObtainedFlows] = useState<Record<ISharedType, DateTime | null>>({ personal: null, team: null });
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [flows, setFlows] = useState<IFlow[]>([])


  const handleAlerts = ({ add, remove, removeAll }: IHandleAlertsProps) => {
    if (!add && !remove && !removeAll) return

    if (add) {
      const id = add.id ? add.id : uuid();
      const intent = add.intent;
      let message: any = add.message?.response?.data?.error;

      if (message) {
        message = `${message?.code}: ${message?.message}`;
      } else message = String(add.message);

      if (!alerts.find(a => a.message === message))
        setAlerts(prev => [{ id, message, intent }, ...prev])
    }

    if (remove) setAlerts(prev => prev.filter(a => a.id !== remove))

    if (removeAll) setAlerts(() => [])
  }

  const handleUpdateFlowsList: IHandleUpdateFlowsList = (flowName: IFlow['name'], action: { remove?: boolean, edit?: { state: 'Started' | 'Stopped' } }) => {
    if (!action.edit && !action.remove) return

    if (action.remove) {
      setFlows(prev => prev.filter(f => f.name !== flowName));
      return
    }

    if (action.edit) {
      if (action.edit.state)
        setFlows(prev => {
          let flows = prev;
          const indexToUpdate = flows.map(f => f.name).indexOf(flowName);

          let flow = flows[indexToUpdate];

          flow.properties.state = action.edit?.state === 'Started' ? 'Ativado' : 'Parado';
          flows[indexToUpdate] = flow;
          selectFlow(prev => {

            if (!prev) return prev;

            return {
              ...prev,
              properties: {
                ...prev.properties,
                state: prev.properties.state === 'Started' ? 'Stopped' : 'Started'
              }
            }
          })
          console.log(selectedFlow?.properties.state)
          return flows
        });
      return
    }

  }

  const handleSetFlow: IHandleSetFlow = (flowName: IFlow['name'] | null) => {

    if (!flowName) {
      selectFlow(null);
      return
    }

    setLoadingFlow(true)

    return GetFlow(token.text, selectedEnvironment.name, flowName)
      .catch(e => handleAlerts({ add: { message: e, intent: 'error' } }))
      .then(flowData => {
        selectFlow(flowData?.data)
      })
      .finally(() => setLoadingFlow(false))

  }

  const handleGetFlows = (sharedType: ISharedType, force?: boolean) => {
    if (flows.length && !force) return
    setLoadingFlows(prev => ({ ...prev, [sharedType]: true }))

    GetFlows(token.text, selectedEnvironment.name, sharedType)
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
        setObtainedFlows(prev => ({ ...prev, [sharedType]: DateTime.now() }))

      })
      .catch(e => {
        handleAlerts({ add: { message: e, intent: 'error' } });
        setObtainedFlows(prev => ({ ...prev, [sharedType]: null }))
      })
      .finally(() => {
        setLoadingFlows(prev => ({ ...prev, [sharedType]: false }))
      })

  }

  return (
    <div className={styles.Viewer}>
      <HeaderApp
        jwt={token.jwt as IJwt}
        env={selectedEnvironment}
        handleLogout={handleLogout}
      />

      <Breadcrumb
        handleSetFlow={handleSetFlow}
        selectedFlow={selectedFlow}
      />

      <Alerts
        alerts={alerts}
        handleAlerts={handleAlerts}
        maxHeight={200} />

      <LoadingScreen open={loadingFlow} />

      {selectedFlow ?
        <FlowDetails
          handleAlerts={handleAlerts}
          handleSetFlow={handleSetFlow}
          handleUpdateFlowsList={handleUpdateFlowsList}
          selectedFlow={selectedFlow}
          token={token.text}
        /> : null}

      <div className={classNames({ "d-none": selectedFlow })}>
        <MainTable
          flows={flows}
          handleSetFlow={handleSetFlow}
          loadingFlows={loadingFlows}
          handleGetFlows={handleGetFlows}
          obtainedFlows={obtainedFlows}
        />
      </div>

    </div>
  )
}

interface IHeaderAppProps {
  jwt: IJwt;
  env: IEnvironment;
  handleLogout: () => void
}

const HeaderApp = ({ env, handleLogout, jwt }: IHeaderAppProps) => {

  const expirationDate = DateTime.fromMillis(parseInt(String(jwt.expires)) * 1000)
  const now = DateTime.now();
  const isTokenExpired = expirationDate <= now;

  const LogInfo = ({ children }: { children: JSX.Element }) => {

    const [personaActive, setActive] = useState<boolean>(false);
    const [tokenTimeLeft, setTokenTimeLeft] = useState(expirationDate.diffNow().toFormat('hh:mm:ss'));

    useEffect(() => {

      const timer = setInterval(() => {

        const dateTimeLeft = expirationDate.diffNow();
        const secsLeft = parseInt(dateTimeLeft.toFormat('s'));

        if (!(secsLeft % 5) && secsLeft.valueOf() >= 0) {
          setActive(true);
          setTimeout(() => setActive(false), 3000);
        }

        setTokenTimeLeft(dateTimeLeft.toFormat('hh:mm:ss'))

      }, 1000);

      return () => clearInterval(timer);

    }, [tokenTimeLeft]);

    return (
      <Dialog>
        <DialogTrigger>
          {children}
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Informações da conta</DialogTitle>
            <DialogContent className={styles.Viewer_Header_Logout_Dialog}>

              <Persona
                className={styles.Viewer_Header_Logout_Dialog_Persona}
                name={jwt.name}
                avatar={{ active: personaActive && !isTokenExpired ? 'active' : 'inactive', className: 'me-2' }}
                presence={{ status: isTokenExpired ? 'offline' : 'available' }}
                secondaryText={jwt.email}
                tertiaryText={<>Token {isTokenExpired ? 'expirou' : 'expira'} <FriendlyDate date={expirationDate} /></>}
                quaternaryText={<Badge className='mt-1' appearance="outline">{tokenTimeLeft}</Badge>}
              />

            </DialogContent>
            <DialogActions>
              <DialogTrigger>
                <Button appearance="secondary">Fechar</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleLogout}>
                Sair da conta
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    )
  }

  return (
    <div className={styles.Viewer_Header}>
      <div className={styles.Viewer_Header_Logo}>

        <span>{env.properties.displayName}</span>

        {env.properties.description &&
          <span className={styles.Viewer_Header_Logo_Desc}>
            {env.properties.description}
          </span>}

      </div>

      <div>
        <LogInfo>
          <Button
            appearance='transparent'
            size='large'
            iconPosition='after'
            icon={<Avatar size={36} name={jwt.name} badge={{ status: isTokenExpired ? 'offline' : 'available' }} className='ms-2' />}
            className={styles.Viewer_Header_Logout}
          >
            <div className={styles.Viewer_Header_Logout_Btn}>
              <span className={styles.Viewer_Header_Logout_Btn_Name}>
                {jwt.name}
              </span>
            </div>
          </Button>
        </LogInfo>
      </div>
    </div>
  )

}

interface IBreadcrumbProps {
  handleSetFlow: (flowName: IFlow['name'] | null) => void;
  selectedFlow: IFlow | null;
}

const Breadcrumb = ({ handleSetFlow, selectedFlow }: IBreadcrumbProps) => (
  <ul className={styles.Viewer_Breadcrumb}>
    <li>
      <span
        className={classNames(
          styles.Viewer_Breadcrumb_Level0,
          { [styles.Viewer_Breadcrumb_Level0_Link]: Boolean(selectedFlow?.name) }
        )}
        onClick={() => handleSetFlow(null)}
      >
        Fluxos
      </span>
    </li>
    {
      selectedFlow?.name ?
        <li>
          <span className={classNames(styles.Viewer_Breadcrumb_Level1)}>
            {selectedFlow?.properties?.displayName}
          </span>
        </li> : null
    }
  </ul>
)

interface IMainTableProps {
  flows: IFlow[];
  handleSetFlow: (flowName: IFlow['name'] | null) => void;
  loadingFlows: Record<ISharedType, boolean>;
  handleGetFlows: (sharedType: ISharedType, force?: boolean) => void;
  obtainedFlows: Record<ISharedType, DateTime | null>;
}

const MainTable = ({ handleSetFlow, loadingFlows, handleGetFlows, obtainedFlows, flows }: IMainTableProps) => {

  const isLoadingPersonalFlows = loadingFlows.personal;
  const isLoadingTeamFlows = loadingFlows.team;

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
          onClick={() => handleSetFlow(item.name)}
          className={classNames(styles.Viewer_Table_BtnSelectFlow, 'w-100')}
          appearance='subtle'>
          {value}
        </Button>)

    },
    {
      title: 'Modificado',
      acessor: 'properties.lastModifiedTime',
      filterable: false,
      render: (value: any) => <FriendlyDate date={DateTime.fromISO(value)} />

    },
    {
      title: 'Criado',
      acessor: 'properties.createdTime',
      filterable: false,
      render: (value: any) => <FriendlyDate date={DateTime.fromISO(value)} />
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

  useEffect(() => handleGetFlows('personal', true), [])

  return (
    <div className='ps-2 mt-2'>
      <CompoundButton
        size='small'
        appearance='subtle'
        disabled={isLoadingPersonalFlows || isLoadingTeamFlows}
        onClick={() => handleGetFlows('personal', true)}
        className='me-3'
        secondaryContent={obtainedFlows.personal && !loadingFlows.personal ? <>Obtido <FriendlyDate date={obtainedFlows.personal as DateTime} /></> : undefined}
        icon={isLoadingPersonalFlows ? <Spinner size='small' /> : <BsFillPersonFill />}>
        {obtainedFlows.personal ? (isLoadingPersonalFlows ? 'Atualizando' : 'Atualizar') : (isLoadingPersonalFlows ? 'Obtendo' : 'Obter')} meus fluxos
      </CompoundButton>
      <CompoundButton
        size='small'
        appearance='subtle'
        disabled={isLoadingPersonalFlows || isLoadingTeamFlows}
        onClick={() => handleGetFlows('team', true)}
        secondaryContent={obtainedFlows.team && !loadingFlows.team ? <>Obtido <FriendlyDate date={obtainedFlows.team as DateTime} /></> : undefined}
        icon={isLoadingTeamFlows ? <Spinner size='small' /> : <BsPeopleFill />}>
        {obtainedFlows.team ? (isLoadingTeamFlows ? 'Atualizando...' : 'Atualizar') : (isLoadingTeamFlows ? 'Obtendo' : 'Obter')} fluxos compartilhados
      </CompoundButton>
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

const LoadingScreen = ({ open }: { open: boolean }) => {

  return (

    <Dialog open={open}>
      <DialogSurface>
        <DialogBody>
          <DialogContent className='my-1 py-1'>
            <Spinner size='large' label={'Carregando fluxo...'} />
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}