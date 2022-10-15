import { Avatar, Button, Divider, Label, PresenceBadge, Spinner, Tooltip } from '@fluentui/react-components';
import { Alert, Card, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Table, TableBody, TableCell, TableCellLayout, TableHeader, TableHeaderCell, TableRow, Toolbar, ToolbarButton, ToolbarDivider } from '@fluentui/react-components/unstable';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react'
import { AiOutlineFullscreen } from 'react-icons/ai';
import { BiDetail, BiHistory } from 'react-icons/bi';
import { BsFillPlayFill, BsPeople, BsArrowClockwise } from 'react-icons/bs';
import { HiOutlineExternalLink, HiOutlinePencilAlt } from 'react-icons/hi';
import { IoMdClose } from 'react-icons/io';
import { VscExport } from 'react-icons/vsc';
import uuid from 'react-uuid';
import { GetFlow, GetFlowConnections, GetFlowHistories, GetFlowRuns, RunFlow } from '../../services/requests';
import styles from './FlowDetails.module.scss'
import { IGetFlow } from './interfaces';

interface Props {
  token: string;
  selectFlow: React.Dispatch<any>;
  selectedFlow: any;
}

interface IAlert {
  id: string;
  message: string;
  intent: 'error' | 'warning' | 'info' | 'success'
}

interface IFlowDetails {
  name: string;
  displayName: string;
  state: string;
  flowSuspensionReason: string;
  description: string;
  trigger: any;
  triggerName: string | null;
  triggerSummary: any;
  triggerConditions: any;
  actions: any;
  actionsSummary: any;
  envName: any;
  uriTrigger: any;
  connectionReferences: any;
  connectionsNames: any[];
  lastModifiedTime: any;
  createdTime: any;
  flowFailureAlertSubscribed: any;
}

export default function FlowDetails(props: Props) {

  const [alerts, setAlert] = useState<IAlert[]>([]);
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [selectedFlowDetails, setFlowDetails] = useState<IFlowDetails>();

  // useEffect(() => console.log(selectedFlowDetails), [selectedFlowDetails])

  const handleErrors = (e: any) => {
    const alert: IAlert = { intent: 'error', message: JSON.stringify(e), id: uuid() };
    setAlert(prev => prev?.length ? ([alert, ...prev]) : [alert])
    console.error(e);
  }

  const handleGetFlowDetails = () => {
    setLoadingFlow(true)

    GetFlow(props.token, props.selectedFlow['properties.environment.name'], props.selectedFlow.name)
      .catch(handleErrors)
      .then(response => {

        const r = response?.data as IGetFlow;
        const rp = r.properties;
        // console.log(r)

        const states = {
          Started: 'Iniciado',
          Suspended: 'Suspenso',
          Stopped: 'Parado'
        }

        let newDetails = {
          name: r.name,
          displayName: rp.displayName,
          state: states[rp.state as keyof typeof states],
          flowSuspensionReason: rp.flowSuspensionReason,
          description: rp.definitionSummary.description,
          trigger: rp.definition.triggers,
          triggerName: Object.keys(rp.definition.triggers)[0],
          triggerSummary: rp.definitionSummary.triggers[0],
          triggerConditions: null,
          actions: rp.definition.actions,
          actionsSummary: rp.definitionSummary.actions?.map(a => a.type).join(', '),
          envName: rp.environment.name,
          uriTrigger: rp.flowTriggerUri,
          connectionReferences: rp.connectionReferences,
          connectionsNames: Object.keys(rp.connectionReferences ?? {}) as any[],
          lastModifiedTime: friendlyDate(DateTime.fromISO(rp.lastModifiedTime)),
          createdTime: friendlyDate(DateTime.fromISO(rp.createdTime)),
          flowFailureAlertSubscribed: rp.flowFailureAlertSubscribed ? 'Sim' : 'Não'
        }

        newDetails.triggerConditions = newDetails.trigger[newDetails.triggerName as keyof typeof newDetails.trigger]?.conditions?.map((c: any) => c.expression).join(' && ')

        setFlowDetails(newDetails)

      })
      .finally(() => setLoadingFlow(false))

  }

  useEffect(() => handleGetFlowDetails(), [])

  const urlFlowInitial = `https://make.powerautomate.com/environments/${selectedFlowDetails?.envName}/flows/${selectedFlowDetails?.name}`

  const urlFlow = {
    edit: `${urlFlowInitial}`,
    details: `${urlFlowInitial}/details`,
    owners: `${urlFlowInitial}/owners`,
    export: `${urlFlowInitial}/export`,
    runs: `${urlFlowInitial}/runs`,
  }

  const StateBadges = {
    Ativado: 'available',
    Parado: 'offline',
    Suspenso: 'away'
  }

  return (
    <div className={classNames('py-0', 'px-3', styles.FadeIn)}>

      <FlowToolbar
        token={props.token}
        loadingFlow={loadingFlow}
        selFlow={selectedFlowDetails}
        handleErrors={handleErrors}
        handleGetFlowDetails={handleGetFlowDetails}
      />

      {alerts.map(alert => (
        <Alert
          key={alert.id}
          intent={alert.intent}
          className={classNames('mb-2', styles.alerts)}
          action={<span
            onClick={() => setAlert(prev => prev.filter(a => a.id !== alert.id))}>
            Fechar <IoMdClose />
          </span>}>
          {alert.message}
        </Alert>
      ))}

      <div className="row">

        <DivCol xxl={10} xl={9} lg={8} md={8} size={12} className='mb-3'>
          <Card className={classNames(styles.card, styles.card_details)}>
            <span className={styles.card_title}>Detalhes</span>
            <Divider />
            <div className="row">
              <DivCol size={12} sm={8} xxl={9} className='d-flex flex-column' style={{ gap: 12 }}>
                <div>
                  <Label>Fluxo</Label>
                  {props.selectedFlow['properties.displayName']}
                </div>

                {
                  selectedFlowDetails?.description ?
                    <div>
                      <Label>Descrição</Label>
                      {selectedFlowDetails?.description}
                    </div> : null
                }
                <div>
                  <Label>Gatilho</Label>

                  {loadingFlow && !selectedFlowDetails?.trigger ?
                    <ProgressLoading />
                    :
                    <Triggers
                      type={selectedFlowDetails?.triggerSummary?.type}
                      kind={selectedFlowDetails?.triggerSummary?.kind}
                      swaggerOperationId={selectedFlowDetails?.triggerSummary?.swaggerOperationId}
                      trigger={selectedFlowDetails?.trigger}
                    />
                  }
                </div>

                {
                  selectedFlowDetails?.triggerConditions ?
                    <div>
                      <Label>Condição do gatilho</Label>
                      {selectedFlowDetails.triggerConditions}
                    </div> : null
                }
                <div>
                  <Label>Resumo das ações</Label>
                  {loadingFlow && !selectedFlowDetails?.actionsSummary ?
                    <ProgressLoading /> :
                    selectedFlowDetails?.actionsSummary
                  }
                </div>

              </DivCol>
              <DivCol size={12} sm={4} xxl={3} className='d-flex flex-column' style={{ gap: 12 }}>
                <div>
                  <Label>Status</Label>
                  <span className='d-flex align-items-center' style={{ gap: '5px' }}>
                    <PresenceBadge outOfOffice status={StateBadges[props.selectedFlow['properties.state'] as keyof typeof StateBadges] as 'available' | 'offline' | 'away'} />
                    {props.selectedFlow['properties.state']}
                  </span>
                </div>
                <div>
                  <Label>Modificado</Label>
                  <span>
                    {loadingFlow && !selectedFlowDetails?.lastModifiedTime ?
                      <ProgressLoading />
                      : selectedFlowDetails?.lastModifiedTime}
                  </span>
                </div>
                <div>
                  <Label>Criado</Label>
                  <span>
                    {loadingFlow && !selectedFlowDetails?.createdTime ?
                      <ProgressLoading />
                      : selectedFlowDetails?.createdTime}
                  </span>
                </div>


                {selectedFlowDetails?.flowSuspensionReason && selectedFlowDetails.state === 'Suspenso' ?
                  <div>
                    <Label>Razão da suspensão:</Label>
                    <span className='d-flex align-items-center' style={{ gap: '5px' }}>
                      {selectedFlowDetails.flowSuspensionReason}
                    </span>
                  </div> : null
                }
                <div>
                  <Label>Receber alertas de falhas do fluxo:</Label>
                  <span>
                    {loadingFlow && !selectedFlowDetails?.flowFailureAlertSubscribed ?
                      <ProgressLoading />
                      : selectedFlowDetails?.flowFailureAlertSubscribed}
                  </span>
                </div>

              </DivCol>
            </div>
          </Card>

        </DivCol>

        <DivCol xxl={2} xl={3} lg={4} md={4} size={12} className='mb-3'>

          <Card className={styles.card}>
            <span className={styles.card_title}>Links para o Power Automate <HiOutlineExternalLink /></span>
            <Divider />
            <div className="row" style={{ rowGap: 10 }}>

              <div className="col-12">
                <Button as='a' href={urlFlow.details} target='__blank'
                  className={styles.card_links}
                  icon={<BiDetail />}>
                  Detalhes do fluxo
                </Button>
              </div>

              <div className="col-12">
                <Button as='a' href={urlFlow.edit} target='__blank'
                  className={styles.card_links} icon={<HiOutlinePencilAlt />}>
                  Edição do fluxo
                </Button>
              </div>
              <div className="col-12">
                <Button as='a' href={urlFlow.owners} target='__blank'
                  className={styles.card_links} icon={<BsPeople />}>
                  Proprietários do fluxo
                </Button>
              </div>
              <div className="col-12">
                <Button as='a' href={urlFlow.export} target='__blank'
                  className={styles.card_links} icon={<VscExport />}>
                  Exportar fluxo
                </Button>
              </div>
              <div className="col-12 w-100">
                <Button as='a' href={urlFlow.runs} target='__blank'
                  className={styles.card_links} icon={<BiHistory />}>
                  Execuções do fluxo
                </Button>
              </div>

            </div>
          </Card>
        </DivCol>

      </div>
      {selectedFlowDetails?.name && selectedFlowDetails?.envName ?
        <>
          <div className="row">
            <DivCol size={12} className='mb-3'>

              <FlowConnectionsCard
                flowName={selectedFlowDetails.name}
                envName={selectedFlowDetails.envName}
                token={props.token} />

            </DivCol>
          </div>
          <div className="row">
            <DivCol md={8} size={12} className='mb-3'>

              <FlowRunsCard
                flowName={selectedFlowDetails.name}
                envName={selectedFlowDetails.envName}
                token={props.token} />

            </DivCol>
            <DivCol md={4} size={12} className='mb-3'>

              <FlowHistoriesCard
                flowName={selectedFlowDetails.name}
                envName={selectedFlowDetails.envName}
                token={props.token}
                trigger={selectedFlowDetails.triggerName || undefined}
              />

            </DivCol>
          </div>
        </> : null
      }
    </div >
  )
}

interface IFlowMoreDetails {
  token: string;
  envName: string;
  flowName: string;
  trigger?: string;
}

const FlowConnectionsCard = ({ token, envName, flowName }: IFlowMoreDetails) => {

  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<any[]>();

  // useEffect(() => console.log(connections), [connections])

  const handleConnections = () => {
    setLoading(true)
    GetFlowConnections(token, envName, flowName)
      .then(resp => {
        const conns = resp.data;
        setConnections(conns)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => handleConnections(), [])

  const NoConnections = () => {

    // Undefined é o primeiro estado, quando não é nem carregado.
    if (connections === undefined) return null

    // Quando possuir alguma conexão.
    if (connections.length) return null

    return (
      <DivCol size={12}>
        Não há conexões para este fluxo.
      </DivCol>
    )
  }

  return (

    <Card className={classNames(styles.card)} style={{ paddingTop: 6 }}>
      <div className="d-flex flex-row align-items-center" style={{ gap: 5 }}>
        <span className={styles.card_title}>Conexões</span>
        <Tooltip content={'Atualizar conexões...'} relationship={'label'}>
          <Button
            onClick={handleConnections}
            size='small'
            className='m-0 px-0 py-1'
            disabled={loading}
            icon={loading ? <Spinner size='tiny' /> : <BsArrowClockwise />}
            appearance='subtle' />
        </Tooltip>
      </div>
      <Divider />
      <div className='row'>

        <NoConnections />

        {connections?.map(conn => {
          const authenticatedUser = conn.properties.displayName;
          const connectionAuthor = conn.properties.createdBy.displayName;
          const iconUri = conn.properties.iconUri;
          const status = conn.properties.statuses.map((st: any) => st.status).join(' ');
          const badgesText = {
            Connected: 'Conectado',
            Error: 'Erro',
          }
          return (
            <Tooltip
              key={conn.name}
              content={<>{authenticatedUser} - {badgesText[status as keyof typeof badgesText]}</>}
              relationship='label'>
              <div className="col-12 col-md-3 d-flex flex-row align-items-center mt-2" style={{ gap: 8 }}>
                <Avatar
                  size={48}
                  name={authenticatedUser}
                  image={{ src: iconUri }}
                  badge={{ status: status === 'Connected' ? 'available' : 'busy' }}
                />
                <div className='d-flex flex-column justify-content-start'>
                  <span>{authenticatedUser}</span>
                  <span className={styles.card_connections_author}>{connectionAuthor}</span>
                </div>
              </div>
            </Tooltip>
          )
        })}
      </div>

    </Card >
  )
}

const FlowRunsCard = ({ token, envName, flowName }: IFlowMoreDetails) => {

  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<any[]>();
  const [nextLink, setNextLink] = useState('');

  useEffect(() => console.log(runs), [runs])

  const handleConnections = () => {
    setLoading(true)
    GetFlowRuns(token, envName, flowName)
      .then(resp => {
        const runsData = resp.data;
        setNextLink(runsData.nextLink);
        setRuns(runsData.value);
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => handleConnections(), [])

  const NoRuns = () => {

    // Undefined é o primeiro estado, quando não é nem carregado.
    if (runs === undefined) return null

    // Quando possuir alguma conexão.
    if (runs.length) return null

    return (
      <DivCol size={12}>
        <Tooltip content={'O GDPR (Regulamento Geral sobre a Proteção de Dados) exige a manutenção dos logs de execução por no máximo 28 dias. Para manter um histórico mais longo, você precisará capturar os históricos de execuções manualmente antes que eles sejam excluídos.'} relationship='label'>
          <span>Nenhuma execução em 28 dias.</span>
        </Tooltip>
      </DivCol>
    )
  }

  return (

    <Card className={classNames(styles.card)} style={{ paddingTop: 6 }}>
      <div className="d-flex flex-row align-items-center justify-content-between">
        <div className='d-flex flex-row' style={{ gap: 5 }}>
          <span className={styles.card_title}>
            Histórico de execuções
          </span>
          <Tooltip content={'Atualizar histórico...'} relationship={'label'}>
            <Button
              onClick={handleConnections}
              size='small'
              className='m-0 px-0 py-1'
              disabled={loading}
              icon={loading ? <Spinner size='tiny' /> : <BsArrowClockwise />}
              appearance='subtle' />
          </Tooltip>
        </div>
        <Tooltip content={'Expandir janela de execuções...'} relationship={'label'}>
          <Button
            size='small'
            className='m-0 px-0 py-1'
            disabled={loading}
            icon={<AiOutlineFullscreen />}
            appearance='subtle' />
        </Tooltip>

      </div>
      <Divider />
      <div className='row'>

        <NoRuns />

        <RunsTable runs={runs} />


      </div>

    </Card >
  )
}

const RunsTable = ({ runs, histories }: { runs?: any[], histories?: boolean }) => {

  if (!runs?.length) return null

  const cols = histories ?
    ['Início', 'Duração', 'Status', 'Erro', 'Disparado?']
    :
    ['Início', 'Duração', 'Status', 'Erro']

  return (

    <Table size="small">
      <TableHeader>
        <TableRow>
          {cols.map(column => (
            <TableHeaderCell key={column}>{column}</TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs?.map(run => {
          const rp = run.properties;

          return (
            <TableRow key={run.name}>
              <TableCell>
                <TableCellLayout>
                  {friendlyDate(DateTime.fromISO(rp.startTime))}
                </TableCellLayout>
              </TableCell>
              <TableCell>
                <TableCellLayout>
                  {friendlyDate(DateTime.fromISO(rp.endTime))}
                </TableCellLayout>
              </TableCell>
              <TableCell>{rp.status}</TableCell>

              <TableCell>
                <TableCellLayout>{JSON.stringify(rp?.error)}</TableCellLayout>
              </TableCell>

              {histories ?
                <TableCell>
                  <TableCellLayout>{rp.fired ? 'Sim' : 'Não'}</TableCellLayout>
                </TableCell> : null
              }

            </TableRow>
          )
        })}
        <TableRow>
          <TableCell>
            <TableCellLayout>{'e agora'}</TableCellLayout>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

const FlowRunsCard_old = ({ token, envName, flowName }: IFlowMoreDetails) => {

  const [runs, setRuns] = useState<any[]>();

  return (

    <Card className={classNames(styles.card)} style={{ paddingTop: 6 }}>
      <div className="d-flex flex-row align-items-center" style={{ gap: 5 }}>
        <span className={styles.card_title}>Histórico de Execução</span>
        <Tooltip content={'Atualizar histórico de execução...'} relationship={'label'}>
          <Button size='small' className='m-0 px-0 py-1' icon={<BsArrowClockwise />} appearance='subtle' />
        </Tooltip>
      </div>
      <Divider />

    </Card>
  )
}

const FlowHistoriesCard = ({ token, envName, flowName, trigger }: IFlowMoreDetails) => {

  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<any[]>();
  const [nextLink, setNextLink] = useState('');

  useEffect(() => console.log(runs), [runs])

  const handleConnections = () => {
    if (!trigger) return
    setLoading(true)
    GetFlowHistories(token, envName, flowName, trigger)
      .then(resp => {
        const runsData = resp.data;
        setNextLink(runsData.nextLink);
        setRuns(runsData.value);
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => handleConnections(), [trigger])
  // useEffect(() => handleConnections(), [])

  const NoRuns = () => {

    // Undefined é o primeiro estado, quando não é nem carregado.
    if (runs === undefined) return null

    // Quando possuir alguma conexão.
    if (runs.length) return null

    return (
      <DivCol size={12}>
        <Tooltip content={'O GDPR (Regulamento Geral sobre a Proteção de Dados) exige a manutenção dos logs de execução por no máximo 28 dias. Para manter um histórico mais longo, você precisará capturar os históricos de execuções manualmente antes que eles sejam excluídos.'} relationship='label'>
          <span>Nenhum histórico em 28 dias.</span>
        </Tooltip>
      </DivCol>
    )
  }
  return (

    <Card className={classNames(styles.card)} style={{ paddingTop: 6 }}>
      <div className="d-flex flex-row align-items-center justify-content-between">
        <div className='d-flex flex-row' style={{ gap: 5 }}>
          <span className={styles.card_title}>
            Histórico de execuções
          </span>
          <Tooltip content={'Atualizar histórico...'} relationship={'label'}>
            <Button
              onClick={handleConnections}
              size='small'
              className='m-0 px-0 py-1'
              disabled={loading}
              icon={loading ? <Spinner size='tiny' /> : <BsArrowClockwise />}
              appearance='subtle' />
          </Tooltip>
        </div>
        <Tooltip content={'Expandir janela de execuções...'} relationship={'label'}>
          <Button
            size='small'
            className='m-0 px-0 py-1'
            disabled={loading}
            icon={<AiOutlineFullscreen />}
            appearance='subtle' />
        </Tooltip>

      </div>
      <Divider />
      <div className='row'>

        <NoRuns />
        <RunsTable runs={runs} histories />

      </div>

    </Card >
  )
}

const FlowHistoriesCard_old = ({ token, envName, flowName }: IFlowMoreDetails) => {

  const [histories, setHistories] = useState<any[]>();

  return (

    <Card className={classNames(styles.card)} style={{ paddingTop: 6 }}>
      <div className="d-flex flex-row align-items-center" style={{ gap: 5 }}>
        <span className={styles.card_title}>Histórico de Verificação</span>
        <Tooltip content={'Atualizar histórico de verificação'} relationship={'label'}>
          <Button size='small' className='m-0 px-0 py-1' icon={<BsArrowClockwise />} appearance='subtle' />
        </Tooltip>
      </div>
      <Divider />

    </Card>
  )
}


interface IDivCol {
  children?: any;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}

const DivCol = ({ children, className, style, size, sm, md, lg, xl, xxl }: IDivCol) => (
  <div
    style={style}
    className={classNames(
      { [`col-${size}`]: size },
      { [`col-sm-${sm}`]: sm },
      { [`col-md-${md}`]: md },
      { [`col-lg-${lg}`]: lg },
      { [`col-xl-${xl}`]: xl },
      { [`col-xxl-${xxl}`]: xxl },
      className
    )
    }>
    {children}
  </div>
)

interface FlowToolbarProps {
  token: string;
  selFlow: IFlowDetails | undefined;
  loadingFlow: boolean;
  handleErrors: (e: any) => void;
  handleGetFlowDetails: () => void;
}

const FlowToolbar = (props: FlowToolbarProps) => {

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([])

  const RunModal = () => {

    if (props?.selFlow?.uriTrigger) return null

    const handleRunFlow = () => {

      setLoading(true)

      if (!props?.selFlow?.triggerName || !props?.selFlow?.uriTrigger) {
        console.error('Propriedade não encontrada...');
        return;
      }

      RunFlow(props.token, props.selFlow.uriTrigger)
        .catch(props.handleErrors)
        .then(() => {
          setErrors(prev => ([{ id: uuid(), msg: `Fluxo "${props?.selFlow?.displayName}" executado`, intent: 'success' }, ...prev]))
        })
        .finally(() => setLoading(false))
    }

    const ToolbarRunFlowButton = () => {

      return (
        <Tooltip content='Executar fluxo' relationship="label" showDelay={100}>

          <ToolbarButton className={classNames({ ['details-info-links-warning']: props?.selFlow?.state !== 'Started' })}>
            {
              loading ?
                <><Spinner /> Executando...</>
                : <><BsFillPlayFill className={classNames('details-info-links-icon', { ['details-info-links-warning']: props?.selFlow?.state !== 'Started' })} />Executar</>
            }
          </ToolbarButton>

        </Tooltip>
      )
    }

    return (
      <Dialog modalType="alert">
        <DialogTrigger>
          <ToolbarRunFlowButton />
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Conexões do fluxo</DialogTitle>
            <DialogContent>
              <div className='connections'>
                {!props?.selFlow?.connectionReferences?.length && 'Não há conexões para este fluxo.'}
                {[] || props?.selFlow?.connectionReferences.map((connection: any) => {
                  const conn = props?.selFlow?.connectionReferences?.[connection];
                  return (
                    <div className='connection'>
                      <Avatar
                        size={40}
                        style={{ marginRight: 8 }}
                        name={conn?.displayName}
                        image={{ src: conn?.iconUri }}
                      />
                      <div className='connection-text'>
                        <span>{conn?.displayName}</span>
                        <span className='connection-text-small'>{conn?.connectionName}</span>
                      </div>
                    </div>
                  )
                })}
              </div>


            </DialogContent>
            <DialogActions>
              <DialogTrigger><Button appearance="secondary">Cancelar</Button></DialogTrigger>

              <Button
                appearance="primary"
                disabled={loading || props?.selFlow?.state !== 'Started'}
                onClick={handleRunFlow}>
                {loading ? 'Executando...' : (props?.selFlow?.state !== 'Started' ? 'Fluxo desligado' : 'Executar')}
              </Button>

            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog >
    )
  }

  const ToolbarRunFlow = () => {

    const [loadingRun, setLoadingRun] = useState(false);

    if (!Boolean(props?.selFlow?.uriTrigger)) return null;

    const handleRunFlow = () => {
      setLoadingRun(true);
      alert('Ainda a implementar. Carregamento fake será acionado (não se preocupe, não estará executando)');
      setTimeout(() => setLoadingRun(false), 3000);
    }

    return (

      <Dialog>
        <DialogTrigger>

          <ToolbarButton
            disabled={loadingRun}
            icon={loadingRun ? <Spinner size='tiny' /> : <BsFillPlayFill />}
            className={classNames({ ['details-info-links-warning']: props?.selFlow?.state !== 'Started' })}>
            {loadingRun ? 'Executando...' : 'Executar'}
          </ToolbarButton>

        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Conexões do fluxo</DialogTitle>
            <DialogContent>
              <div className='connections'>
                {!props?.selFlow?.connectionsNames?.length && 'Não há conexões para este fluxo.'}
                {(props?.selFlow?.connectionsNames || []).map((connection: string) => {
                  const conn = props?.selFlow?.connectionReferences[connection];
                  return (
                    <div className='connection'>
                      <Avatar
                        size={40}
                        style={{ marginRight: 8 }}
                        name={conn?.displayName}
                        image={{ src: conn?.iconUri }}
                      />
                      <div className='connection-text'>
                        <span>{conn?.displayName}</span>
                        <span className='connection-text-small'>{conn?.connectionName}</span>
                      </div>
                    </div>
                  )
                })}
              </div>


            </DialogContent>
            <DialogActions>
              <DialogTrigger><Button appearance="secondary">Fechar</Button></DialogTrigger>

              <Button
                appearance="primary"
                icon={loadingRun ? <Spinner size='tiny' /> : undefined}
                disabled={loadingRun || props?.selFlow?.state !== 'Started'}
                onClick={handleRunFlow}>
                {loadingRun ? 'Executando...' : (props?.selFlow?.state !== 'Started' ? 'Fluxo desligado' : 'Executar')}
              </Button>

            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog >
    )

    return (
      <ToolbarButton
        disabled={loadingRun}
        icon={loadingRun ? <Spinner size='tiny' /> : <BsFillPlayFill />}
        className={classNames({ ['details-info-links-warning']: props?.selFlow?.state !== 'Started' })}>
        {loadingRun ? 'Executando...' : 'Executar'}
      </ToolbarButton>
    )
  }

  const ToolbarStatusFlow = () => {

    const [loadingStatus, setLoadingStatus] = useState(true);

    if (!Boolean(props?.selFlow?.uriTrigger)) return null;

    return (
      <ToolbarButton
        disabled={loadingStatus}
        icon={loadingStatus ? <Spinner size='tiny' /> : <BsFillPlayFill />}
        className={classNames({ ['details-info-links-warning']: props?.selFlow?.state !== 'Started' })}>
        {loadingStatus ? 'Executando...' : 'Executar'}
      </ToolbarButton>
    )
  }

  return (
    <Toolbar className='mb-2'>

      <Tooltip content='Executar fluxo' relationship="label" showDelay={100}>
        <ToolbarRunFlow />
      </Tooltip>

      <ToolbarButton>
        Desligar
      </ToolbarButton>
      <ToolbarButton>
        Editar
      </ToolbarButton>
      <ToolbarButton>
        Excluir
      </ToolbarButton>
      <ToolbarDivider />

      {props.loadingFlow ?
        <ToolbarButton
          className='d-flex align-items-center'
          icon={<Spinner size='tiny' />}
          style={{ cursor: 'default', gap: '4px' }}>
          Carregando...
        </ToolbarButton>
        : null
      }

    </Toolbar>
  )
}

const friendlyDate = (date: DateTime) => {
  if (!date) return null
  const now = DateTime.now().setLocale('pt-BR');
  const dateTime = date.setLocale('pt-BR');
  const isDateHasSameMonth = date.hasSame(now, 'month');
  const friendlyDates = {
    today: `hoje às ${dateTime.toFormat('HH:mm')}`,
    yesterday: `ontem às ${dateTime.toFormat('HH:mm')}`,
    week: `${dateTime.toFormat(`cccc (dd${isDateHasSameMonth ? '' : ' LLL'})`)} às ${dateTime.toFormat('HH:mm')}`,
    year: `${dateTime.toFormat('dd LLL')} às ${dateTime.toFormat('HH:mm')}`,
    fullDate: dateTime.toFormat('dd LLL yy HH:mm')
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

const ProgressLoading = () => {

  return (
    <div className="progress">
      <div
        className={classNames("progress-bar progress-bar-striped progress-bar-animated w-100", styles.Card_Details_Loading)}
        role="progressbar"
        aria-label="Animated striped example" />
    </div>
  )
}

interface ITriggers {
  type: string;
  kind?: string;
  swaggerOperationId?: string;
  trigger?: any;
}

const Triggers = ({ type, kind, swaggerOperationId, trigger }: ITriggers) => {

  if (type === 'Request')
    if (kind === 'Button')
      return <span>Botão</span>

  if (type === "OpenApiConnection") {
    const tg = trigger[Object.keys(trigger)[0]];
    const site = tg.inputs.parameters.dataset;
    const table = tg.inputs.parameters.table;
    const recurrence = tg.recurrence.interval + ' ' + tg.recurrence.frequency

    if (swaggerOperationId === "GetOnNewItems") {
      return (
        <span>
          Item criado em lista
          <br />
          Site: {site}
          <br />
          Lista: {table}
          <br />
          Recorrência: {recurrence}
        </span>
      )
    }
    if (swaggerOperationId === "GetOnUpdatedItems") {
      return (
        <span>
          Item criado e modificado em lista
          <br />
          Site: {site}
          <br />
          Lista: {table}
          <br />
          Recorrência: {recurrence}
        </span>
      )
    }
  }

  const txts = {
    type: type ? type : '',
    kind: kind ? kind : '',
    swaggerOperationId: swaggerOperationId ? swaggerOperationId : '',
  }

  let txt: string = txts.type;
  txt = txts.kind.length ? `${txt} - ${txts.kind}` : txt;
  txt = txts.swaggerOperationId.length ? `${txt} - ${txts.swaggerOperationId}` : txt;

  return <>{txt}</>;

}