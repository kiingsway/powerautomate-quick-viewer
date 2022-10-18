import React, { useEffect, useState } from 'react'
import { GetFlowConnections, GetFlowHistories } from '../../../services/requests';
import { IHandleAlerts } from '../../Login/interfaces';
import { IFlowDetailsSummary } from '../interfaces';
import { Card } from '@fluentui/react-components/unstable';
import { Button, Divider, Spinner, Tooltip } from '@fluentui/react-components';
import styles from '../FlowDetails.module.scss'
import { BsArrowClockwise } from 'react-icons/bs';
import { AiOutlineFullscreen } from 'react-icons/ai';
import QuickTable from '../../../components/QuickTable';
import { FriendlyDate } from '../../../App';
import { DateTime } from 'luxon';
import { tableStyle } from '../../FlowsViewer';

interface Props {
  flow: IFlowDetailsSummary;
  token: string;
  handleAlerts: IHandleAlerts;
}

export default function HistoriesCard({ flow, token, handleAlerts }: Props) {

  const [loading, setLoading] = useState(true);
  const [histories, setHistories] = useState<any[]>();

  useEffect(() => console.log(histories), [histories])

  const handleGetFlowConnections = () => {
    setLoading(true);

    GetFlowHistories(token, flow.envName, flow.name, flow.trigger.name)
      .then(resp => setHistories(resp.data.value))
      .finally(() => setLoading(false))
  }

  useEffect(() => handleGetFlowConnections(), [])

  const Table = ({ preview }: { preview: boolean }) => {

    if (!histories || !histories.length) return null;

    const cols_old = ['Início', 'Status', 'Erro', 'Disparado?']

    return (
      <QuickTable
        style={tableStyle}
        data={preview ? histories.slice(0, 20) : histories}
        columns={[
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
                  <span style={{ fontSize: 12 }}>{value}</span>
                  {code ? <span style={{ fontSize: 12 }}>{code}</span> : null}
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
                <>{value ? 'Sim' : 'Não'}</>
              )

            },
          },
        ]}
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
              onClick={handleGetFlowConnections}
              size='small'
              disabled={loading}
              icon={loading ? <Spinner size='tiny' /> : <BsArrowClockwise />}
              appearance='subtle' />
          </Tooltip>
          <Tooltip content={'Expandir janela de execuções...'} relationship={'label'}>
            <Button
              size='small'
              className='m-0 px-0 py-1'
              disabled={loading}
              icon={<AiOutlineFullscreen />}
              appearance='subtle' />
          </Tooltip>
        </div>
      </div>
      <Divider className={styles.DetailsCard_Header_Divider} />
      <div className={styles.DetailsCard_Body}>
        <Table preview />
        {/* {histories?.slice(0, 20).map(history => (
          <span key={history.name}>{history.name}</span>
        ))} */}
      </div>
    </Card>
  )
}
