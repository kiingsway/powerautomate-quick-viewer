import { Avatar, Badge, Button, CompoundButton, PresenceBadge, Spinner, Tooltip, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, MenuItemRadio } from '@fluentui/react-components';
import { Persona } from '@fluentui/react-components/unstable';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react'
import { BiArrowBack, BiChevronDown } from 'react-icons/bi';
import { RiPlayList2Line } from 'react-icons/ri';
import { BsFillPersonFill, BsPeopleFill, BsTrash } from 'react-icons/bs';
import { VscDebugDisconnect } from 'react-icons/vsc';
import uuid from 'react-uuid';
import { FriendlyDate } from '../../App';
import QuickTable, { IQuickTableColumnDefinition, IQuickTableStyleDefinition } from '../../components/QuickTable';
import { IAlert, IEnvironment, IHandleAlertsProps, IJwt, IToken } from '../../interfaces';
import { GetFlow, GetFlows } from '../../services/requests';
import FlowDetails from '../FlowDetails';
import FlowsRecycleBin from '../FlowsRecycleBin';
import styles from './FlowsViewer.module.scss'
import { AppPages, IAppPage, IBreadcrumbProps, IFlow, IHandleSetFlow, IHandleUpdateFlowsList, IHeaderAppProps, IMainTableProps, ISharedType } from './interfaces';
import Connections from '../Connections';
import AppAlerts from '../../components/AppAlerts';

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
  const [flows, setFlows] = useState<IFlow[]>();
  const [page, setPage] = useState<AppPages>('FlowLists');



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

    if (removeAll) setAlerts(() => [])
  }

  const handleUpdateFlowsList: IHandleUpdateFlowsList = (
    flowName: IFlow['name'],
    action: {
      remove?: boolean,
      edit?: {
        state?: 'Started' | 'Stopped' | 'Suspended';
        title?: string;
        lastModifiedTime?: string;
        definition?: any;
      }
    }) => {
    if (!action.edit && !action.remove) return
    if (action.remove) {
      setFlows(prev => prev ? prev.filter(f => f.name !== flowName) : prev);
      selectFlow(null)
      return
    }
    if (action.edit) {
      setFlows(prevFlows => {
        if (!prevFlows) return undefined

        let flows = prevFlows;
        const indexToUpdate = flows.map(f => f.name).indexOf(flowName);

        const statesBr = {
          Started: 'Ativado',
          Suspended: 'Suspenso',
          Stopped: 'Parado'
        }

        const state = action.edit?.state ? action.edit.state : flows[indexToUpdate].properties.state;
        const displayName = action.edit?.title ? action.edit.title : flows[indexToUpdate].properties.displayName;
        const definition = action.edit?.definition ? action.edit.definition : flows[indexToUpdate].properties.definition;

        const flowToUpdate = {
          ...flows[indexToUpdate],
          properties: {
            ...flows[indexToUpdate].properties,
            state,
            displayName,
            definition,
          }
        };

        flows[indexToUpdate] = flowToUpdate;

        selectFlow(prevFlow => {

          if (!prevFlow || prevFlow?.name !== flowToUpdate.name) return prevFlow
          else return {
            ...prevFlow,
            properties: {
              ...prevFlow.properties,
              definition: flowToUpdate.properties.definition ? flowToUpdate.properties.definition : prevFlow.properties.definition,
              displayName: flowToUpdate.properties.displayName ? flowToUpdate.properties.displayName : prevFlow.properties.displayName,
              state: flowToUpdate.properties.state ? flowToUpdate.properties.state : prevFlow.properties.state
            }
          }
        })

        return flows;

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
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
      .then(flowData => {
        selectFlow(flowData?.data)
      })
      .finally(() => setLoadingFlow(false))

  }

  const handleGetFlows = (sharedType: ISharedType, force?: boolean) => {
    if (flows && flows.length && !force) return
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
            properties: {
              ...f.properties,
              state: states[f.properties.state as keyof typeof states]
            },
            ambiente: getAmbienteFlow(f.properties.displayName),
            cliente: getClienteFlow(f.properties.displayName),
            sharedType: sharedType === 'personal' || sharedType === 'team' ? sharedTypes[sharedType] : sharedType
          }
        ))

        const uniqueNewFlows = Array.from(new Map(newFlows.map(item => [item.name, item])).values());
        setFlows(prev => {
          const prevFlows = prev ? prev : []
          return [
            ...uniqueNewFlows,
            ...prevFlows.filter(f => f.sharedType !== sharedTypes[sharedType])
          ]
        });
        setObtainedFlows(prev => ({ ...prev, [sharedType]: DateTime.now() }))

      })
      .catch(e => {
        handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } });
        setObtainedFlows(prev => ({ ...prev, [sharedType]: null }))
      })
      .finally(() => {
        setLoadingFlows(prev => ({ ...prev, [sharedType]: false }))
      })

  }

  useEffect(() => handleGetFlows('personal', true), [])

  return (
    <div className={styles.Viewer}>
      <HeaderApp
        jwt={token.jwt as IJwt}
        env={selectedEnvironment}
        handleLogout={handleLogout}
      />

      <Breadcrumb
        page={page}
        setPage={setPage}
        handleSetFlow={handleSetFlow}
        selectedFlow={selectedFlow}
      />

      <AppAlerts
        alerts={alerts}
        handleAlerts={handleAlerts} />

      <LoadingScreen open={loadingFlow} />

      {page === 'Connections' ? <Connections
        token={token.text}
        handleAlerts={handleAlerts}
        selectedEnvironment={selectedEnvironment} /> : null}

      {page === 'RecycleBin' ? <FlowsRecycleBin
        handleAlerts={handleAlerts}
        selectedEnvironment={selectedEnvironment}
        token={token.text} /> : null}

      {page === 'FlowLists' ? (
        selectedFlow ?
          <FlowDetails
            token={token.text}
            selectedFlow={selectedFlow}
            handleAlerts={handleAlerts}
            handleSetFlow={handleSetFlow}
            handleUpdateFlowsList={handleUpdateFlowsList}
          /> :
          <MainTable
            flows={flows ? flows : []}
            loadingFlows={loadingFlows}
            obtainedFlows={obtainedFlows}
            handleSetFlow={handleSetFlow}
            handleGetFlows={handleGetFlows}
          />
      ) : null}

      <div className={classNames({ "d-none": selectedFlow })}>
      </div>
    </div>
  )
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

const Breadcrumb = ({ handleSetFlow, selectedFlow, page, setPage }: IBreadcrumbProps) => {

  const appPagesTitles: Record<AppPages, string> = {
    Connections: "Conexões",
    FlowLists: "Fluxos",
    RecycleBin: "Lixeira"
  }

  const appPagesDef: IAppPage[] = [
    {
      title: appPagesTitles['FlowLists'],
      page: 'FlowLists',
      icon: <RiPlayList2Line className={classNames(
        { [styles.Viewer_Breadcrumb_List_MenuPage_Icon_Selected]: page === 'FlowLists' }
      )} />
    },
    {
      title: appPagesTitles['Connections'],
      page: 'Connections',
      icon: <VscDebugDisconnect className={classNames(
        { [styles.Viewer_Breadcrumb_List_MenuPage_Icon_Selected]: page === 'Connections' }
      )} />
    },
    {
      title: appPagesTitles['RecycleBin'],
      page: 'RecycleBin',
      hide: true,
      icon: <BsTrash className={classNames(
        { [styles.Viewer_Breadcrumb_List_MenuPage_Icon_Selected]: page === 'RecycleBin' }
      )} />
    }
  ]

  return (
    <div className={styles.Viewer_Breadcrumb}>
      <ul className={styles.Viewer_Breadcrumb_List}>
        <li className={styles.Viewer_Breadcrumb_List_Item}>


          <div className='d-flex flex-row align-items-center'>
            <span
              className={classNames(
                styles.Viewer_Breadcrumb_List_Item_0,
                { [styles.Viewer_Breadcrumb_List_Item_0_ChangeScreen]: !selectedFlow?.name },
                { [styles.Viewer_Breadcrumb_List_Item_0_Link]: Boolean(selectedFlow?.name) },
              )}
              onClick={() => handleSetFlow(null)}>

              {appPagesTitles[page]}

            </span>
            {!selectedFlow?.name ?

              <Menu>
                <MenuTrigger>
                  <Button icon={<BiChevronDown />} appearance='subtle' className='ms-2' />
                </MenuTrigger>

                <MenuPopover>
                  <MenuList>
                    {appPagesDef.filter(a => !a.hide).map(p => {
                      return (
                        <MenuItem
                          key={p.page}
                          icon={p.icon}
                          onClick={() => setPage(p.page)}
                          className={classNames(
                            styles.Viewer_Breadcrumb_List_MenuPage,
                            { [styles.Viewer_Breadcrumb_List_MenuPage_Text_Selected]: page === p.page },
                          )}>
                          {p.title}
                        </MenuItem>
                      )
                    })}
                  </MenuList>
                </MenuPopover>
              </Menu> : <></>}
          </div>

        </li>
        {
          selectedFlow?.name ?
            <li>

              <span className={classNames(styles.Viewer_Breadcrumb_List_Item_1)}>
                {selectedFlow?.properties?.displayName}
              </span>

            </li> : null
        }
      </ul>
      {
        selectedFlow?.name ?
          <Button
            icon={<BiArrowBack />}
            onClick={() => handleSetFlow(null)}
            appearance='transparent'>
            Voltar
          </Button> : null
      }
    </div>
  )
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
        <div className='px-4'>
          <Button
            onClick={() => handleSetFlow(item.name)}
            className={classNames(styles.Viewer_Table_BtnSelectFlow, 'w-100')}
            appearance='subtle'>
            {value}
          </Button>
        </div>
      )

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
      {flows && !flows.length && !isLoadingPersonalFlows ? 'Nenhum fluxo encontrado neste ambiente.' : null}
      {flows && flows.length ?
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

export const tableStyle: IQuickTableStyleDefinition = {
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
    padding: '5px 0',
    borderBottom: '1px solid #555',
    verticalAlign: 'middle'
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