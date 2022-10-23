import { useEffect, useState } from 'react'
import { IEnvironment, IHandleAlerts, IToken } from '../../interfaces';
import { GetConnections, GetConnectionsNames, GetWithNextLink, TryGetConnections } from '../../services/requests';
import { IConnection, IConnectionName } from './interfaces';
import styles from './Connections.module.scss';
import { Avatar, Badge, Button, CompoundButton, Divider, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, PresenceBadge, Spinner, Tooltip } from '@fluentui/react-components';
import { TbLayoutGrid, TbLayoutGridAdd, TbLayoutList } from 'react-icons/tb';
import QuickTable, { IQuickTableStyleDefinition } from '../../components/QuickTable';
import { IQuickTableColumn } from '../../components/QuickTable/interfaces';
import { FriendlyDate } from '../../App';
import { DateTime } from 'luxon';
import { GoPlusSmall } from 'react-icons/go';
import { HiChevronDown, HiChevronUp } from 'react-icons/hi';

interface Props {
  selectedEnvironment: IEnvironment;
  token: IToken['text'];
  handleAlerts: IHandleAlerts;
}

type TConnectionsViews = 'gallery' | 'groupByApp' | 'byStatus' | 'table';

interface IConnectionsView {
  id: TConnectionsViews;
  title: string;
  icon: JSX.Element;
}


interface IConnectionData {
  value: IConnectionSummary[];
  obtainedDate: DateTime;
  nextLink?: string;
  apiNames?: IConnectionName[];
}

interface IConnectionSummary {
  name: string;
  iconUri: string;
  presence: "available" | "busy" | "out-of-office";
  displayName: string;
  status: string;
  apiName: string;
  apiIconBrandColor: React.CSSProperties['backgroundColor'];
  isCustomApi: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdTime: string;
  lastModifiedTime: string;
}

export default function Connections({ selectedEnvironment, token, handleAlerts }: Props) {

  const [connectionsData, setConnectionsData] = useState<IConnectionData>();
  const [loading, setLoading] = useState<Record<'first' | 'next', boolean>>({ first: false, next: false });
  const [connView, setConnView] = useState<TConnectionsViews>('gallery')

  const handleGetConnections = () => {
    setLoading(p => ({ ...p, first: true }))
    TryGetConnections(token, selectedEnvironment.name)
      .catch(e => {

        const msg: string = e?.response?.data?.error?.message || '';
        const newUserId = extractId(msg);
        if (!msg || newUserId === msg) {
          console.error(e); setLoading(p => ({ ...p, first: false })); handleAlerts({
            add: {
              intent: 'error',
              createdDateTime: DateTime.now(),
              message: `Não foi possível obter o ID do usuário logado. Erro: ${JSON.stringify(msg || e?.response?.data?.error || e?.response?.data || e?.response || e)}`,
            }
          });
          return
        }

        GetConnections(token, selectedEnvironment.name, newUserId)
          .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
          .then(connsData => {

            const conns: IConnection[] = connsData?.data.value || [];

            GetConnectionsNames(token, selectedEnvironment.name, newUserId)
              .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
              .then(connNamesData => {
                const nextLink: string = connsData?.data.nextLink && conns.length ? connsData?.data.nextLink : '';
                const apiNames: IConnectionName[] = connNamesData?.data.value;
                const value: IConnectionSummary[] = summarizeConnection(conns, apiNames);
                const obtainedDate = DateTime.now().setLocale('pt-BR');
                setConnectionsData({ value, obtainedDate, nextLink, apiNames });
              })
              .finally(() => setLoading(p => ({ ...p, first: false })))
          })
      })
  }

  const handleGetMoreConnections = () => {
    if (!connectionsData?.nextLink || !connectionsData?.apiNames) return
    setLoading(p => ({ ...p, next: true }));

    GetWithNextLink(token, connectionsData.nextLink)
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
      .then(connsData => {
        const conns: IConnection[] = connsData?.data.value || [];
        const apiNames = connectionsData.apiNames as IConnectionName[];
        const nextLink: string = connsData?.data.nextLink && conns.length ? connsData?.data.nextLink : '';
        const value: IConnectionSummary[] = summarizeConnection(conns, apiNames);
        const obtainedDate = DateTime.now().setLocale('pt-BR');
        setConnectionsData({ value, obtainedDate, nextLink, apiNames });
      })
      .finally(() => setLoading(p => ({ ...p, next: false })))

  }

  useEffect(() => handleGetConnections(), []);

  const ConnectionsViews = () => {
    const [open, setOpen] = useState(false)
    const handleOpen = () => setOpen(p => !p);
    const views: IConnectionsView[] = [
      {
        id: 'gallery',
        title: 'Galeria',
        icon: <TbLayoutGrid />
      },
      {
        id: 'byStatus',
        title: 'Agrupar por status',
        icon: <TbLayoutGrid />
      },
      {
        id: 'groupByApp',
        title: 'Agrupar por aplicativo',
        icon: <TbLayoutGrid />
      },
      {
        id: 'table',
        title: 'Tabela',
        icon: <TbLayoutList />
      }
    ]
    return (
      <Menu open={open} onOpenChange={handleOpen}>

        <MenuTrigger>
          <Tooltip content="Visualização selecionada" relationship="label">
            <Button
              iconPosition='after' shape="circular"
              icon={open ? <HiChevronUp /> : <HiChevronDown />}>
              {views.filter(v => v.id === connView)[0].title}
            </Button>
          </Tooltip>
        </MenuTrigger>

        <MenuPopover >
          <MenuList checkedValues={{ view: [connView] }}>

            {views.map(v => (
              <MenuItem
                icon={v.icon} key={v.id} disabled={connView === v.id}
                onClick={() => connView === v.id ? undefined : setConnView(v.id)}>
                {v.title}
              </MenuItem>
            ))}

          </MenuList>
        </MenuPopover >
      </Menu >
    )
  }

  const ByAppView = () => {

    const connectionsTypes = Array.from(new Set(connectionsData?.value.map(conn => conn.apiName).sort()))

    return (
      <div className='w-100'>
        {connectionsTypes.map(connType => {
          const connDetails = connectionsData?.value.find(c => c.apiName === connType)
          return (
            <div key={connType} className='mt-3'>
              <h6 className='d-flex flex-row align-items-center'>
                <Badge
                  style={{ backgroundColor: connDetails?.apiIconBrandColor }}
                  size="small"
                  className='me-2'
                />
                {connType}
              </h6>
              <Divider />
              <div className="row">

                {connectionsData?.value.filter(conn => conn.apiName === connType)
                  .map(conn => {
                    return (
                      <div className='col-12 col-sm-6 col-md-4 col-xxl-3 mt-1' key={conn.name}>
                        <Connection conn={conn} />
                      </div>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const ByStatusView = () => {

    const allStatuses = Array.from(new Set(connectionsData?.value.map(conn => conn.status))).reverse()

    return (
      <div className='w-100'>
        {allStatuses.map(status => (
          <div key={status} className='mt-3'>

            <h6 className='d-flex flex-row align-items-center'>
              <PresenceBadge
                status={status === 'Connected' ? 'available' : (status === 'Error' ? 'busy' : 'out-of-office')}
                size="small"
                className='me-2'
              />
              {status}
            </h6>

            <Divider />
            <div className="row">

              {connectionsData?.value.filter(conn => conn.status === status).map(conn => (
                <div className='col-12 col-sm-6 col-md-4 col-xxl-3 mt-1' key={conn.name}>
                  <Connection conn={conn} />
                </div>))}

            </div>
          </div>
        ))}
      </div>
    )
  }

  const GalleryView = () => {
    return (
      <div className="row w-100">
        {connectionsData?.value.map(conn => (
          <div className='col-12 col-sm-6 col-md-4 col-xxl-3 h-100' key={conn.name}>
            <Connection conn={conn} />
          </div>
        )
        )}
      </div>
    )
  }

  const TableView = () => {
    const cols: IQuickTableColumn[] = [
      {
        title: '',
        acessor: 'presence',
        show: false
      },
      {
        title: '',
        acessor: 'createdBy.email',
        show: false,
      },
      {
        title: '',
        acessor: 'iconUri',
        filterable: false,
        render: (value, item) => {
          return (
            <div
              className='ms-2 py-1'>
              <Avatar
                shape="square"
                size={36}
                name={item['displayName']}
                image={{ src: value }}
                badge={{ status: item['presence'] }} />
            </div>
          )
        },
      },
      {
        title: 'Nome',
        acessor: 'displayName'
      },

      {
        title: 'Status',
        acessor: 'status'
      },
      {
        title: 'Conector',
        acessor: 'apiName'
      },
      {
        title: 'Conector personalizado?',
        acessor: 'isCustomApi',

      },
      {
        title: 'Criado por',
        acessor: 'createdBy.name',
        render: (value, item) => (
          <span title={item['createdBy.email']}>{value}</span>
        )
      },
      {
        title: 'Criado',
        acessor: 'createdTime',
        filterable: false,
        render: (value, item) => (
          <FriendlyDate date={DateTime.fromISO(value)} />
        )
      },
      {
        title: 'Modificado',
        acessor: 'lastModifiedTime',
        filterable: false,
        render: (value, item) => (
          <FriendlyDate date={DateTime.fromISO(value)} />
        )
      },
    ]

    return (
      <QuickTable
        style={tableStyleMini}
        data={connectionsData?.value || []}
        columns={cols}
        itensPerPage={50}
      />
    )
  }

  return (
    <div className='px-4 py-2 d-flex flex-column align-items-start'>

      <div className='mb-2 d-flex flex-row align-items-center'>

        <CompoundButton
          size='small'
          appearance='subtle'
          disabled={loading.first || loading.next}
          onClick={handleGetConnections}
          secondaryContent={connectionsData?.obtainedDate ? <>Obtido <FriendlyDate date={connectionsData?.obtainedDate as DateTime} /></> : undefined}
          icon={loading.first ? <Spinner size='tiny' /> : <TbLayoutGridAdd />}
        >
          {connectionsData?.obtainedDate ? (loading.first ? 'Atualizando' : 'Atualizar') : (loading.first ? 'Obtendo' : 'Obter')} conexões{loading.first ? '...' : ''}
        </CompoundButton>

        {connectionsData?.nextLink ?
          <>
            <CompoundButton
              size='small'
              appearance='subtle'
              disabled={loading.first || loading.next}
              onClick={handleGetMoreConnections}
              icon={loading.next ? <Spinner size='tiny' /> : <GoPlusSmall />}
            >
              {(loading.next ? 'Obtendo' : 'Obter')} mais conexões{loading.next ? '...' : ''}
            </CompoundButton>
          </> : null}

        <Divider vertical style={{ height: '100%' }} className='mx-3' />

        <ConnectionsViews />

      </div>

      {connView === 'gallery' && <GalleryView />}
      {connView === 'groupByApp' && <ByAppView />}
      {connView === 'byStatus' && <ByStatusView />}
      {connView === 'table' && <TableView />}

    </div >
  )
}

const Connection = ({ conn }: { conn: IConnectionSummary }) => (
  <div className={styles.Connections_Item}>
    <div className={styles.Connections_Item_Icon}>

      <Avatar
        shape="square"
        size={36}
        name={conn.displayName}
        image={{ src: conn.iconUri }}
        badge={{ status: conn.presence }} />

    </div>
    <div className={styles.Connections_Item_Content}>

      <div className={styles.Connections_Item_Content_Title}>
        <span>{conn.displayName}</span>
      </div>

      <div className={styles.Connections_Item_Content_Subtitle}>
        <span>{conn.createdBy.name}</span>
        <span>{conn.status}</span>
      </div>

    </div>
  </div>
)

function extractId(str: string) {
  const matches = str.match(/'(.*?)'/);
  return matches ? matches[1] : str;
}

function summarizeConnection(conns: IConnection[], apiNames: IConnectionName[]) {

  const connectionInfoHashId: Record<IConnectionName['id'], IConnectionName> = apiNames.reduce((a, v) => ({ ...a, [v.id]: v }), {})

  const connections: IConnectionSummary[] = conns.map(conn => {

    const connectionInfo = connectionInfoHashId[conn.properties.apiId];
    const statusText = conn.properties.statuses.map(s => s.status).join(' ');
    const is = {
      connected: statusText === 'Connected',
      error: statusText === 'Error',
      CustomApi: connectionInfo?.properties.isCustomApi
    }

    return {
      name: conn.name,
      iconUri: conn.properties.iconUri,
      presence: is.connected ? 'available' : (is.error ? 'busy' : 'out-of-office'),
      displayName: conn.properties.displayName,
      status: statusText,
      apiName: connectionInfo?.properties.displayName,
      apiIconBrandColor: connectionInfo?.properties.iconBrandColor,
      isCustomApi: is.CustomApi ? 'Sim' : 'Não',
      createdBy: {
        name: conn.properties.createdBy.displayName,
        email: conn.properties.createdBy.email || conn.properties.createdBy.userPrincipalName,
      },
      createdTime: conn.properties.createdTime,
      lastModifiedTime: conn.properties.lastModifiedTime,
    }
  });

  return connections;

}

const tableStyleMini: IQuickTableStyleDefinition = {
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
    fontSize: 12,
    padding: '0 2px',
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
  tBodyTr: {
    margin: 'auto 0',
  },
  td: {
    borderBottom: '1px solid #555',
    alignItems: 'center',
    verticalAlign: 'middle',
    margin: '5px 0'

  }
}