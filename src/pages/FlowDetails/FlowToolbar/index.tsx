import { Button, Spinner, Tooltip, Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions } from '@fluentui/react-components';
import styles from './FlowToolbar.module.scss'
import { Persona } from '@fluentui/react-components/unstable';
import React, { useEffect, useState } from 'react'
import { BiTrash } from 'react-icons/bi';
import { BsFillPlayFill, BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IFlowDetails, IFlowDetailsSummary } from '../interfaces';
import classNames from 'classnames';
import { GetConnections, GetFlowConnections, RunFlow, UpdateStateFlow } from '../../../services/requests';
import { IToken } from '../../../interfaces';
import { IAlert, IHandleAlerts, IHandleAlertsProps } from '../../Login/interfaces';
import { IFlowConnection, IHandleSetFlow, IHandleUpdateFlowsList } from '../../FlowsViewer/interfaces';
import uuid from 'react-uuid';
import { Alerts } from '../../Login';

interface Props {
  flow: IFlowDetailsSummary;
  handleSetFlow: IHandleSetFlow;
  handleAlerts: IHandleAlerts;
  token: IToken['text'];
  handleUpdateFlowsList: IHandleUpdateFlowsList;
}

interface ILoadingDefinition {
  state: boolean;
  actions: {
    run: boolean;
    edit: boolean;
    state: boolean;
    delete: boolean;
  };
}

const loadingDef: ILoadingDefinition = {
  state: false,
  actions: {
    run: false,
    edit: false,
    state: false,
    delete: false,
  }
}

export default function FlowToolbar({ flow, token, handleSetFlow, handleUpdateFlowsList }: Props) {

  const [loadingAction, setLoadingAction] = useState<ILoadingDefinition>(loadingDef);
  const [loadingAny, setLoadingAny] = useState(false);
  const [alerts, setAlerts] = useState<IAlert[]>([]);

  const handleAlerts = ({ add, remove, removeAll }: IHandleAlertsProps) => {
    if (!add && !remove && !removeAll) return

    if (add) {
      const id = add.id ? add.id : uuid();
      const intent = add.intent;
      let message: any = add.message?.response?.data?.error;

      if (message) {
        message = `${message?.code}: ${message?.message}`;
      } else message = String(add.message);

      setAlerts(prev => [{ id, message, intent }, ...prev])
    }

    if (remove) setAlerts(prev => prev.filter(a => a.id !== remove))

    if (removeAll) setAlerts(prev => [])
  }

  const isFlowOn = flow.state === 'Started';

  return (
    <div className='d-flex flex-column' style={{ gap: 5 }}>
      <div className='d-flex flex-row align-items-center' style={{ gap: 5 }}>

        <RunFlowButton
          loadingAny={loadingAny}
          setLoadingAny={setLoadingAny}
          flow={flow}
          loadingAction={loadingAction}
          setLoadingAction={setLoadingAction}
          token={token}
          handleAlerts={handleAlerts} />

        <EditFlowButton />
        <TurnFlowButton
          loadingAny={loadingAny}
          setLoadingAny={setLoadingAny}
          token={token}
          flow={flow}
          handleAlerts={handleAlerts}
          handleSetFlow={handleSetFlow}
          handleUpdateFlowsList={handleUpdateFlowsList}
        />
        <DeleteFlowButton />

      </div>

      <Alerts
        alerts={alerts}
        handleAlerts={handleAlerts}
        maxHeight={200} />
    </div>
  )
}


interface RunFlowButtonProps {
  flow: IFlowDetailsSummary;
  loadingAction: ILoadingDefinition;
  setLoadingAction: React.Dispatch<React.SetStateAction<ILoadingDefinition>>;
  token: IToken['text'];
  handleAlerts: IHandleAlerts;
  loadingAny: boolean;
  setLoadingAny: React.Dispatch<React.SetStateAction<boolean>>;
}
const RunFlowButton = ({ flow, token, handleAlerts, setLoadingAny, loadingAny }: RunFlowButtonProps) => {

  const [runModalOpen, setRunModal] = useState(false);
  const [connections, setConnections] = useState<IFlowConnection[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!flow.trigger.uri) return

    GetFlowConnections(token, flow.envName, flow.name)
      .then(r => { console.log(r.data); setConnections(r.data) })
      .catch(e => handleAlerts({ add: { message: e, intent: 'error' } }))

  }, [])

  if (!flow.trigger.uri) return null

  const isFlowOn = flow.state === 'Started';

  const runFlow = () => {
    setLoadingAny(true)
    setRunning(true)
    RunFlow(token, flow.trigger.uri)
      .then(() => handleAlerts({ add: { message: `Fluxo "${flow.displayName}" executado`, intent: 'success' } }))
      .catch(e => handleAlerts({ add: { message: e, intent: 'error' } }))
      .finally(() => { setLoadingAny(false); setRunModal(false); setRunning(false) })
  }

  const DialogRun = ({ children }: { children: JSX.Element }) => {
    return (
      <Dialog open={runModalOpen}>
        <DialogTrigger>
          {children}
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Conexões do fluxo</DialogTitle>
            <DialogContent className={classNames('row', styles.Toolbar_Dialog_Run, styles.BlueScroll)}>

              {connections.map(conn => {
                const status = conn.properties.statuses.map(s => s.status).join(' ');
                return (
                  <div className="col-12 col-sm-6 col-md-4" key={conn.name}>

                    <Persona
                      name={conn.properties.displayName}
                      avatar={{ image: { src: conn.properties.iconUri } }}
                      presence={{ status: status === 'Connected' ? 'available' : 'offline' }}
                      secondaryText={<span title={conn.properties.createdBy.userPrincipalName}>{conn.properties.createdBy.displayName}</span>}
                      quaternaryText={status}
                    />

                  </div>
                )
              })}


            </DialogContent>
            <DialogActions>
              <DialogTrigger>
                <Button appearance="secondary"
                  onClick={() => setRunModal(false)}>Fechar</Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                onClick={runFlow}
                disabled={loadingAny || running}
                icon={running ? <Spinner size='tiny' /> : undefined}
              >
                {running ? 'Executando...' : 'Executar'}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    )
  }

  return (
    <DialogRun>
      <Tooltip content={isFlowOn ? 'Clique para executar o fluxo...' : "Ative o fluxo antes de executá-lo"} relationship="label" >
        <Button
          onClick={() => setRunModal(true)}
          disabled={!isFlowOn || running || loadingAny}
          appearance={isFlowOn ? 'primary' : 'subtle'}
          icon={running ? <Spinner size='tiny' /> : <BsFillPlayFill />}
        >
          {running ? 'Executando...' : 'Executar'}
        </Button>
      </Tooltip>
    </DialogRun>
  )
}
const EditFlowButton = () => {
  return (
    <Button
      appearance='subtle'
      icon={<HiOutlinePencilAlt />}>
      Editar
    </Button>
  )
}
interface TurnFlowButtonProps {
  token: IToken['text'];
  flow: IFlowDetailsSummary
  handleAlerts: IHandleAlerts;
  handleSetFlow: IHandleSetFlow;
  loadingAny: boolean;
  setLoadingAny: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateFlowsList: IHandleUpdateFlowsList
}
const TurnFlowButton = ({ flow, token, handleAlerts, handleSetFlow, setLoadingAny, loadingAny, handleUpdateFlowsList }: TurnFlowButtonProps) => {

  const [dialogOpen, setDialog] = useState(false);
  const [turningState, turnState] = useState(false);

  const handleTurnOnOffFlow = (turn: 'turnOn' | 'turnOff') => {
    setLoadingAny(true);
    turnState(true);
    setDialog(false);
    UpdateStateFlow(token, flow.envName, flow.name, turn)
      .then(() => {
        handleUpdateFlowsList(flow.name, { edit: { state: turn === 'turnOn' ? 'Started' : 'Stopped' } })
        // handleSetFlow(flow.name)
        //   ?.then(() => handleAlerts({ add: { message: `Fluxo "${flow.displayName}" ${turn === 'turnOn' ? 'ligado' : 'desligado'}`, intent: 'success' } }))
        //   ?.finally(() => { setLoadingAny(false); turnState(false) })
      })
      .finally(() => { setLoadingAny(false); turnState(false) })
  }

  const isFlowOn = flow.state === 'Started';

  const DialogTurn = ({ children }: { children: JSX.Element }) => {
    return (
      <Dialog open={dialogOpen}>
        <DialogTrigger>
          {children}
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{isFlowOn ? 'Desligar' : 'Ligar'} o fluxo</DialogTitle>
            <DialogContent>
              Tem certeza que dejesa {isFlowOn ? 'desligar' : 'ligar'} o fluxo?
            </DialogContent>
            <DialogActions>
              <DialogTrigger>
                <Button appearance="secondary" onClick={() => setDialog(false)}>
                  Fechar
                </Button>
              </DialogTrigger>
              <Button
                icon={turningState ? <Spinner size='tiny' /> : null}
                disabled={loadingAny || turningState}
                appearance="primary"
                onClick={() => handleTurnOnOffFlow(isFlowOn ? 'turnOff' : 'turnOn')}>
                {turningState ? (isFlowOn ? 'Desligando...' : 'Ligando...') : `Sim, ${isFlowOn ? 'desligar' : 'ligar'}`}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    )
  }

  return (
    <DialogTurn>
      <Button
        disabled={loadingAny || turningState}
        onClick={() => setDialog(true)}
        appearance='subtle'
        icon={turningState ? <Spinner size='tiny' /> : (isFlowOn ? <BsToggleOn /> : <BsToggleOff />)}>
        {isFlowOn ? (turningState ? 'Desligando...' : 'Desligar') : (turningState ? 'Ligando...' : 'Ligar')}
      </Button>
    </DialogTurn>
  )
}
const DeleteFlowButton = () => {
  // CLicar para deletar, quando deletar, deselecionar fluxo e remover da lista.
  return (
    <Button
      appearance='subtle'
      icon={<BiTrash className='text-danger' />}>
      Excluir
    </Button>
  )
}