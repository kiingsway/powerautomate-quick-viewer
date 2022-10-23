import { useEffect, useState } from 'react'
import { GetFlowHistories } from '../../../services/requests';
import { IFlowDetailsSummary } from '../interfaces';
import { Card } from '@fluentui/react-components/unstable';
import { Badge, Button, Divider, Spinner, Tooltip } from '@fluentui/react-components';
import styles from '../FlowDetails.module.scss'
import { BsArrowClockwise } from 'react-icons/bs';
import { AiOutlineFullscreen } from 'react-icons/ai';
import QuickTable, { IQuickTableStyleDefinition } from '../../../components/QuickTable';
import { FriendlyDate } from '../../../App';
import { DateTime } from 'luxon';
import { IQuickTableColumn } from '../../../components/QuickTable/interfaces';
import { IHandleAlerts } from '../../../interfaces';

interface Props {
  flow: IFlowDetailsSummary;
  token: string;
  handleAlerts: IHandleAlerts;
  updateRuns: boolean;
  handleUpdateRuns: () => void;
}

export default function HistoriesCard({ flow, token, handleAlerts, updateRuns }: Props) {

  const [loading, setLoading] = useState(true);
  const [histories, setHistories] = useState<any[]>();

  const handleGetFlowHistories = () => {
    setLoading(true);

    GetFlowHistories(token, flow.envName, flow.name, flow.trigger.name)
      .then(resp => setHistories(resp.data.value))
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
      .finally(() => setLoading(false))
  }


  useEffect(() => {
    setTimeout(() => handleGetFlowHistories(), 1000)
  }, [updateRuns])

  useEffect(() => handleGetFlowHistories(), [])

  const Table = ({ preview }: { preview: boolean }) => {

    if (!histories || !histories.length) return null;

    const cols: IQuickTableColumn[] = [
      {
        title: 'Início',
        acessor: 'properties.startTime',
        filterable: false,
        render: (value, item) => {
          const url = `https://make.powerautomate.com/environments/${flow.envName}/flows/${flow.name}/checks/${item['name']}`;
          return (
            <Button as='a' target="__blank" href={url} appearance='transparent'>
              <FriendlyDate date={DateTime.fromISO(value)} />
            </Button>
          )

        },
      },
      {
        title: 'Status',
        acessor: 'properties.status',
        filterable: false,
        render: (value, item) => {
          const code = item?.['properties.code'];
          return (
            <div className='d-flex flex-column' style={{ lineHeight: 1 }}>
              <Badge appearance="ghost" color={value === 'Failed' ? 'danger' : (value === 'Succeeded' ? 'success' : "important")} className='d-flex flex-row' style={{ gap: 10 }}>
                <span style={{ fontSize: 12 }}>{value}</span>
                {code ? <span style={{ fontSize: 12 }}>{code}</span> : null}
              </Badge>
            </div>
          )

        },
      },
      {
        title: 'Código',
        acessor: 'properties.code',
        filterable: false,
        show: false,
      },
      {
        title: 'RunName',
        acessor: 'name',
        filterable: false,
        show: false,
      },
      {
        title: 'Disparado',
        acessor: 'properties.fired',
        filterable: false,
        render: (value, item) => {
          return (
            <div className='d-flex flex-column' style={{ lineHeight: 1 }}>
              <Badge appearance='ghost' color={value ? 'brand' : 'informative'}>
                <>{value ? 'Sim' : 'Não'}</>
              </Badge>
            </div>
          )

        },
      },
    ]

    return (
      <QuickTable
        style={tableStyleMini}
        data={preview ? histories.slice(0, 20) : histories}
        columns={cols}
        counter={!preview}
        itensPerPage={50}
        globalSearchable={false}
      />
    )
  }

  return (
    <Card className={styles.DetailsCard}>
      <div className={styles.DetailsCard_Header}>
        <span className={styles.DetailsCard_Header_Title}>Histórico de verificação</span>
        <div>
          <Tooltip content={'Atualizar verificações...'} relationship={'label'}>
            <Button
              onClick={handleGetFlowHistories}
              size='small'
              disabled={loading}
              icon={loading ? <Spinner size='tiny' /> : <BsArrowClockwise />}
              appearance='subtle' />
          </Tooltip>
          {true ? null :
            <Tooltip content={'Expandir janela de execuções...'} relationship={'label'}>
              <Button
                size='small'
                className='m-0 px-0 py-1'
                disabled={loading}
                icon={<AiOutlineFullscreen />}
                appearance='subtle' />
            </Tooltip>
          }
        </div>
      </div>
      <Divider className={styles.DetailsCard_Header_Divider} />
      <div className={styles.DetailsCard_Body}>
        {histories && !histories.length ? 'Nenhuma verificação nos últimos 28 dias.' : null}
        <Table preview />
      </div>
    </Card>
  )
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
  tBodyTr: {
    margin: 'auto 0',
  },
  td: {
    borderBottom: '1px solid #555',
    alignItems: 'center',
    verticalAlign: 'middle'

  }
}