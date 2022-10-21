import { BadgeColors, FlowStatus, IFlowDetailsSummary, IFlowRun, IFlowRunStatuses } from '../interfaces';
import { useEffect, useState } from 'react'
import { CancelFlowRun, GetFlowRuns, ResubmitFlowRun } from '../../../services/requests';
import { Card } from '@fluentui/react-components/unstable';
import { Badge, Button, Divider, Menu, MenuGroup, MenuGroupHeader, MenuItem, MenuList, MenuPopover, MenuTrigger, Spinner, Tooltip } from '@fluentui/react-components';
import styles from '../FlowDetails.module.scss'
import { BsArrowClockwise } from 'react-icons/bs';
import { AiOutlineEllipsis, AiOutlineFullscreen } from 'react-icons/ai';
import QuickTable, { IQuickTableStyleDefinition } from '../../../components/QuickTable';
import { FriendlyDate } from '../../../App';
import { DateTime } from 'luxon';
import { IQuickTableColumn } from '../../../components/QuickTable/interfaces';
import classNames from 'classnames';
import { MdOutlineCancel } from 'react-icons/md';
import { TbExternalLink } from 'react-icons/tb';
import { IHandleAlerts } from '../../../interfaces';

interface Props {
  flow: IFlowDetailsSummary;
  token: string;
  handleAlerts: IHandleAlerts;
  updateRuns: boolean;
  handleUpdateRuns: () => void;
}



export default function RunsCard({ flow, token, handleAlerts, updateRuns, handleUpdateRuns }: Props) {

  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<IFlowRun[]>()

  const handleGetFlowRuns = () => {
    setLoading(true);
    GetFlowRuns(token, flow.envName, flow.name)
      .then(resp => setRuns(resp.data.value))
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
      .finally(() => setLoading(false))
  }

  const delayHandleGetRuns = (delay: number) => { setTimeout(() => handleGetFlowRuns(), delay); return }

  useEffect(() => delayHandleGetRuns(1000), [updateRuns])

  const handleRunActions = ({ runName, action }: { runName: string, action: 'resubmit' | 'cancel' }) => {

    if (action === 'cancel') {
      CancelFlowRun(token, flow.envName, flow.name, runName)
        .then(() => {
          delayHandleGetRuns(500);
          handleAlerts({ add: { message: 'Execução cancelada com sucesso!', intent: 'success', createdDateTime: DateTime.now() } });
        })
        .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
      return
    } else if (action === 'resubmit') {
      ResubmitFlowRun(token, flow.envName, flow.name, runName, flow.trigger.name)
        .then(() => {
          delayHandleGetRuns(500);
          handleAlerts({ add: { message: 'Execução reiniciada com sucesso!', intent: 'success', createdDateTime: DateTime.now() } });
        })
        .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
      return
    }

  }

  const Table = ({ preview }: { preview: boolean }) => {

    if (!runs || !runs.length) return null;

    const runsCols: IQuickTableColumn[] = [
      {
        title: 'Início',
        acessor: 'properties.startTime',
        filterable: false,
        render: (value, item) => {
          const url = `https://make.powerautomate.com/environments/${flow.envName}/flows/${flow.name}/runs/${item['name']}`;
          return (
            <Button as='a' target="__blank" href={url} appearance='transparent'>
              <FriendlyDate date={DateTime.fromISO(value)} />
            </Button>
          )

        },
      },
      {
        title: '',
        acessor: 'name',
        filterable: false,
        sorteable: false,
        render: (value, item) => {
          const status = item['properties.status'] as IFlowRunStatuses;
          const isRunning = status === 'Running';
          const url = `https://make.powerautomate.com/environments/${flow.envName}/flows/${flow.name}/runs/${item['name']}`;


          const statusBr: Record<IFlowRunStatuses, string> = {
            Cancelled: "Cancelado",
            Failed: "Falha",
            Running: "Em execução...",
            Succeeded: "Êxito"

          }

          return (

            <Menu>
              <Tooltip content="Abrir menu da execução" relationship="description">
                <MenuTrigger>
                  <Button icon={<AiOutlineEllipsis />} appearance='transparent' />
                </MenuTrigger>
              </Tooltip>

              <MenuPopover>
                <MenuList>

                  <MenuGroup>
                    <MenuGroupHeader>
                      <span className='pe-1'>Execução de </span>
                      <FriendlyDate date={DateTime.fromISO(item['properties.startTime'])} />
                      <span className='ps-1'> - {statusBr[status]}</span>
                    </MenuGroupHeader>

                    {
                      isRunning ?
                        <MenuItem
                          icon={<MdOutlineCancel />}
                          onClick={() => handleRunActions({ runName: value, action: 'cancel' })} >
                          Cancelar execução
                        </MenuItem>
                        :
                        <MenuItem
                          icon={<BsArrowClockwise />}
                          onClick={() => handleRunActions({ runName: value, action: 'resubmit' })} >
                          Executar novamente
                        </MenuItem>

                    }
                  </MenuGroup>
                  <MenuGroup>
                    <MenuGroupHeader>Links externos</MenuGroupHeader>
                    <MenuItem icon={<TbExternalLink />}  >
                      <Button as='a' target="__blank" href={url} appearance='transparent' className='ps-0 pe-1' >
                        Abrir execução no Power Automate
                      </Button>
                    </MenuItem>
                  </MenuGroup>



                </MenuList>
              </MenuPopover>
            </Menu>
          )

        },
      },
      {
        title: 'Duração',
        acessor: 'properties.endTime',
        filterable: false,
        render: (value, item) => {
          const startTime = DateTime.fromISO(item['properties.startTime'])
          const endTime = item?.['properties.endTime'] ? DateTime.fromISO(item?.['properties.endTime']) : DateTime.now();
          const duration = endTime.diff(startTime, ['hours', 'minutes', 'seconds']).toFormat('hh:mm:ss')
          const isRunning = Boolean(item?.['properties.endTime']);
          return (
            <div className='d-flex flex-column px-2' style={{ lineHeight: 1 }}>
              <Badge
                appearance="ghost"
                className={classNames({ 'text-muted': !isRunning })}
                color={isRunning ? 'informative' : 'subtle'}>
                {duration}
              </Badge>
            </div >
          )
        },
      },
      {
        title: 'Status',
        acessor: 'properties.status',
        filterable: !preview,
        render: (value, item) => {

          const stateColors: Record<FlowStatus, BadgeColors> = {
            Running: 'informative',
            Cancelled: 'warning',
            Failed: 'danger',
            Succeeded: 'success'
          }

          const statusBr: Record<IFlowRunStatuses, string> = {
            Cancelled: "Cancelado",
            Failed: "Falha",
            Running: "Em execução...",
            Succeeded: "Êxito"

          }
          return (
            <div className='d-flex flex-column px-2' style={{ lineHeight: 1 }}>
              <Badge appearance="ghost" color={stateColors[value as FlowStatus]}>
                {statusBr[value as IFlowRunStatuses]}
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
        title: 'errorMsg',
        acessor: 'properties.error.message',
        filterable: false,
        show: false,
      },
      {
        title: 'Erro',
        acessor: 'properties.error.code',
        filterable: false,
        render: (value, item) => {
          const code = value;
          const msg = item?.['properties.error.message'];
          if (!code && !msg) return <></>

          let txtsArray = [value, item['properties.error.message']]
          txtsArray = txtsArray.filter(v => Boolean(v))

          return (
            <div className='d-flex flex-column' style={{ lineHeight: 1 }}>
              <span style={{ fontSize: 12 }}>{txtsArray.join(' - ')}</span>
            </div>
          )

        },
      },
    ]

    return (
      <QuickTable
        style={tableStyleMini}
        data={preview ? runs.slice(0, 20) : runs}
        columns={runsCols}
        counter={!preview}
        itensPerPage={50}
        globalSearchable={false}
      />
    )
  }

  return (
    <Card className={styles.DetailsCard}>
      <div className={styles.DetailsCard_Header}>
        <span className={styles.DetailsCard_Header_Title}>Histórico de execuções</span>
        <div>
          <Tooltip content={'Atualizar verificações...'} relationship={'label'}>
            <Button
              onClick={handleGetFlowRuns}
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
        {runs && !runs.length ? 'Nenhuma execução nos últimos 28 dias.' : null}
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