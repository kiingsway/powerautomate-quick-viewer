import { useEffect, useState } from 'react'
import { IEnvironment, IHandleAlerts, IToken } from '../../interfaces';
import { GetConnections, GetConnectionsNames, GetWithNextLink, TryGetConnections } from '../../services/requests';
import { IConnection, IConnectionName } from './interfaces';
import styles from './Connections.module.scss';
import { Avatar, Badge, CompoundButton, Divider, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger, PresenceBadge, Spinner } from '@fluentui/react-components';
import { TbLayoutGridAdd } from 'react-icons/tb';
import QuickTable, { IQuickTableStyleDefinition } from '../../components/QuickTable';
import { IQuickTableColumn } from '../../components/QuickTable/interfaces';
import { FriendlyDate } from '../../App';
import { DateTime } from 'luxon';
import any from 'react/jsx-runtime';

interface Props {
  selectedEnvironment: IEnvironment;
  token: IToken['text'];
  handleAlerts: IHandleAlerts;
}

type TConnectionsViews = 'gallery' | 'groupByApp' | 'byStatus' | 'table'


interface IConnectionData {
  value: IConnectionSummary[];
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

export default function Connections({ selectedEnvironment, token }: Props) {

  const [connectionsData, setConnectionsData] = useState<IConnectionData>();
  const [loading, setLoading] = useState<boolean>(false);
  const [connView, setConnView] = useState<TConnectionsViews>('gallery')

  const handleGetConnections = () => {
    setLoading(true)
    TryGetConnections(token, selectedEnvironment.name)
      .catch(e => {
        const newUserId = extractId(e?.response?.data?.error?.message as string)

        GetConnections(token, selectedEnvironment.name, newUserId)
          .then(connsData => {
            GetConnectionsNames(token, selectedEnvironment.name, newUserId)
              .then(connNamesData => {

                const conns = connsData.data.value as IConnection[];
                const apiNames = connNamesData.data.value as IConnectionName[];
                const nextLink = connsData.data.nextLink ? connsData.data.nextLink : undefined;
                const value: IConnectionSummary[] = conns.map(conn => {
                  const statusText = conn.properties.statuses.map(s => s.status).join(' ');
                  const connectionInfo = apiNames?.filter(c => c.id === conn.properties.apiId)?.[0] || null;

                  return {
                    name: conn.name,
                    iconUri: conn.properties.iconUri,
                    presence: statusText === 'Connected' ? 'available' : (statusText === 'Error' ? 'busy' : 'out-of-office'),
                    displayName: conn.properties.displayName,
                    status: statusText,
                    apiName: connectionInfo.properties.displayName,
                    apiIconBrandColor: connectionInfo.properties.iconBrandColor,
                    isCustomApi: connectionInfo.properties.isCustomApi ? 'Sim' : 'Não',
                    createdBy: {
                      name: conn.properties.createdBy.displayName,
                      email: conn.properties.createdBy.email || conn.properties.createdBy.userPrincipalName,
                    },
                    createdTime: conn.properties.createdTime,
                    lastModifiedTime: conn.properties.lastModifiedTime,
                  }
                });

                setConnectionsData({ value, nextLink, apiNames });

              })
              .finally(() => setLoading(false))
          })
          .catch(e => console.error(e?.data))
      })
  }

  const handleGetMoreConnections = () => {
    if (!connectionsData?.nextLink || !connectionsData?.apiNames) return

    setLoading(true)
    GetWithNextLink(token, connectionsData.nextLink)
      .then(resp => {
        const newConnections = resp.data.value as IConnection[];
        const apiNames = connectionsData.apiNames as IConnectionName[];
        const nextLink = resp.data.nextLink ? resp.data.nextLink : undefined;

        const value: IConnectionSummary[] = newConnections.map(conn => {
          const statusText = conn.properties.statuses.map(s => s.status).join(' ');
          const connectionInfo = apiNames.filter(c => c.id === conn.properties.apiId)?.[0] || null;

          return {
            name: conn.name,
            iconUri: conn.properties.iconUri,
            presence: statusText === 'Connected' ? 'available' : (statusText === 'Error' ? 'busy' : 'out-of-office'),
            displayName: conn.properties.displayName,
            status: statusText,
            apiName: connectionInfo.properties.displayName,
            apiIconBrandColor: connectionInfo.properties.iconBrandColor,
            isCustomApi: connectionInfo.properties.isCustomApi ? 'Sim' : 'Não',
            createdBy: {
              name: conn.properties.createdBy.displayName,
              email: conn.properties.createdBy.email || conn.properties.createdBy.userPrincipalName,
            },
            createdTime: conn.properties.createdTime,
            lastModifiedTime: conn.properties.lastModifiedTime,
          }
        });

        setConnectionsData(prev => {
          const prevValue = prev?.value || [];
          return {
            ...prev, nextLink, value: [...prevValue, ...value]
          }
        });
      })
      .catch(e => console.error(e?.response?.data?.error ? e.response.data.error : e))
      .finally(() => setLoading(false))

  }

  useEffect(() => handleGetConnections(), [])

  const connViewBr: Record<TConnectionsViews, string> = {
    gallery: 'Galeria',
    byStatus: 'Agrupar por status',
    groupByApp: "Agrupar por aplicativo",
    table: 'Tabela'
  }

  const ConnectionsViews = () => {
    return (
      <Menu>
        <MenuTrigger>
          <MenuButton shape="circular">
            {connViewBr[connView]}
          </MenuButton>
        </MenuTrigger>

        <MenuPopover>
          <MenuList checkedValues={{ view: [connView] }}>

            {['gallery', 'byStatus', 'groupByApp', 'table'].map(v => (
              <MenuItem
                key={v}
                name='view'
                value={v}
                disabled={connView === v}
                onClick={() => setConnView(v as TConnectionsViews)}>
                {connViewBr[v as TConnectionsViews]}
              </MenuItem>
            ))}

          </MenuList>
        </MenuPopover>
      </Menu>
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

    const allStatuses = Array.from(new Set(connectionsData?.value.map(conn => conn.status).reverse()))

    return (
      <div className='w-100'>
        {allStatuses.map(status => {

          return (
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

                {connectionsData?.value.filter(conn => conn.status === status)
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
          onClick={handleGetConnections}
          disabled={loading}
          icon={loading ? <Spinner size='tiny' /> : <TbLayoutGridAdd />}>
          {loading ? 'Obtendo' : 'Obter'} conexões...
        </CompoundButton>
        <Divider vertical style={{ height: '100%' }} className='mx-3' />
        <ConnectionsViews />
      </div>

      {connView === 'gallery' ? <GalleryView /> : null}
      {connView === 'groupByApp' ? <ByAppView /> : null}
      {connView === 'byStatus' ? <ByStatusView /> : null}
      {connView === 'table' ? <TableView /> : null}

      {connectionsData?.nextLink ?
        <div className='mt-2'>
          <CompoundButton
            onClick={handleGetMoreConnections}
            disabled={loading}
            icon={loading ? <Spinner size='tiny' /> : <TbLayoutGridAdd />}>
            {loading ? 'Obtendo' : 'Obter'} mais conexões
          </CompoundButton>
        </div> : null}

    </div>
  )
}

const Connection = ({ conn }: { conn: IConnectionSummary }) => {

  return (
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
          <span>

            {conn.displayName}

          </span>
        </div>
        <div className={styles.Connections_Item_Content_Subtitle}>
          <span>
            {conn.createdBy.name}
          </span>
          <span>
            {conn.status}
          </span>
        </div>
      </div>
    </div>
  )
}

function extractId(str: string) {
  const matches = str.match(/'(.*?)'/);
  return matches ? matches[1] : str;
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