import { Button, Spinner, Tooltip, Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Switch, Checkbox, Link, Label, Input, Textarea } from '@fluentui/react-components';
import styles from './FlowToolbar.module.scss'
import { Persona } from '@fluentui/react-components/unstable';
import React, { useEffect, useState } from 'react'
import { BiTrash } from 'react-icons/bi';
import { BsFillPlayFill, BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IFlowDetails, IFlowDetailsSummary } from '../interfaces';
import classNames from 'classnames';
import { DeleteFlow, GetConnections, GetFlowConnections, RunFlow, UpdateStateFlow } from '../../../services/requests';
import { IToken } from '../../../interfaces';
import { IAlert, IHandleAlerts, IHandleAlertsProps } from '../../Login/interfaces';
import { IFlowConnection, IHandleSetFlow, IHandleUpdateFlowsList } from '../../FlowsViewer/interfaces';
import uuid from 'react-uuid';
import { Alerts } from '../../Login';
// import CodeEditor from '@uiw/react-textarea-code-editor';

interface Props {
  flow: IFlowDetailsSummary;
  handleSetFlow: IHandleSetFlow;
  handleAlerts: IHandleAlerts;
  token: IToken['text'];
  handleUpdateFlowsList: IHandleUpdateFlowsList;
}

export default function FlowToolbar({ flow, token, handleSetFlow, handleUpdateFlowsList }: Props) {

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

    if (removeAll) setAlerts(() => [])
  }

  return (
    <div className='d-flex flex-column' style={{ gap: 5 }}>
      <div className='d-flex flex-row align-items-center' style={{ gap: 5 }}>

        <RunFlowButton
          flow={flow}
          token={token}
          loadingAny={loadingAny}
          setLoadingAny={setLoadingAny}
          handleAlerts={handleAlerts}
          handleUpdateFlowsList={handleUpdateFlowsList}
        />

        <EditFlowButton
          flow={flow}
          token={token}
          loadingAny={loadingAny}
          setLoadingAny={setLoadingAny}
          handleAlerts={handleAlerts}
          handleUpdateFlowsList={handleUpdateFlowsList}
        />

        <TurnFlowButton
          flow={flow}
          token={token}
          loadingAny={loadingAny}
          setLoadingAny={setLoadingAny}
          handleAlerts={handleAlerts}
          handleUpdateFlowsList={handleUpdateFlowsList}
        />

        <DeleteFlowButton
          flow={flow}
          token={token}
          loadingAny={loadingAny}
          setLoadingAny={setLoadingAny}
          handleAlerts={handleAlerts}
          handleUpdateFlowsList={handleUpdateFlowsList}
        />

      </div>

      <Alerts
        alerts={alerts}
        handleAlerts={handleAlerts}
        maxHeight={200} />
    </div>
  )
}

interface ToolbarProps {
  flow: IFlowDetailsSummary
  token: IToken['text'];
  loadingAny: boolean;
  handleAlerts: IHandleAlerts;
  setLoadingAny: React.Dispatch<React.SetStateAction<boolean>>;
  handleUpdateFlowsList: IHandleUpdateFlowsList;
}

const RunFlowButton = ({ flow, token, loadingAny, handleAlerts, setLoadingAny }: ToolbarProps) => {

  const [runModalOpen, setRunModal] = useState(false);
  const [connections, setConnections] = useState<IFlowConnection[]>();
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
      <Dialog open={runModalOpen} >
        <DialogTrigger>
          {children}
        </DialogTrigger>
        <DialogSurface >
          <DialogBody>
            <DialogTitle>Conexões do fluxo</DialogTitle>
            <DialogContent className={classNames('row', styles.Toolbar_Dialog_Run, styles.BlueScroll)}>
              <div className="col-12">

                {!connections?.length && connections !== undefined ? 'Não há conexões para este fluxo.' : ''}
              </div>
              {connections?.map(conn => {
                const status = conn.properties.statuses.map(s => s.status).join(' ');
                return (
                  <div className="col-12 col-sm-6" key={conn.name}>

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

const EditFlowButton = ({ flow, token, loadingAny, handleAlerts, setLoadingAny, handleUpdateFlowsList }: ToolbarProps) => {
  const [dialogOpen, setDialog] = useState(false);
  const [turningState, turnState] = useState(false);

  const handleEditFlow = () => {
    setLoadingAny(true);
    turnState(true);
    setDialog(false);
    console.log([token, flow.envName, flow.name])
    // handleUpdateFlowsList(flow.name, { edit: { title: 'new Flow Title', description: 'New Description', definition: 'New Definition' } })
    // .then(() => handleUpdateFlowsList(flow.name, { remove: true }))
    // .catch(e => handleAlerts({ add: { message: e, intent: 'error' } }))
    // .finally(() => { setLoadingAny(false); turnState(false) })
  }

  const DialogEdit = ({ children }: { children: JSX.Element }) => {

    interface draftFlow {
      name: string;
      desc: string;
      def: any;
    }

    const [draftFlowDetails, drawFlowDetails] = useState<draftFlow>({
      name: flow.displayName,
      desc: flow.description,
      def: flow.definition
    });

    const handleNewDetails = ({ name, desc, def }: Partial<draftFlow>) => {
      if (name) drawFlowDetails(prev => ({ ...prev, name }))
      if (desc) drawFlowDetails(prev => ({ ...prev, desc }))
      if (def) drawFlowDetails(prev => ({ ...prev, def }))

    }



    const uriFlow = `https://make.powerautomate.com/environments/${flow.envName}/flows/${flow.name}/details`;

    return (
      <Dialog open={dialogOpen}>
        <DialogTrigger>
          {children}
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Editar fluxo <Link href={uriFlow} target='__blank'>{flow.displayName}</Link></DialogTitle>
            <DialogContent>

              <div className="row w-100" style={{ gap: 5 }}>

                <div className="col-12 mt-2">
                  <Label htmlFor="txtFlowDisplayName">Nome:</Label>
                </div>

                <div className="col-12">
                  <Input
                    value={draftFlowDetails.name}
                    onChange={e => handleNewDetails({ name: e.target.value })}
                    id="txtFlowDisplayName"
                    className='w-100'
                    defaultValue={flow.displayName} />
                </div>

                <div className="col-12 mt-3">
                  <Label htmlFor="txtFlowDescription">Descrição:</Label>
                </div>

                <div className="col-12">
                  <Textarea
                    textarea={{ style: { height: 150 }, className: styles.BlueScroll }}
                    id="txtFlowDescription"
                    className={classNames('w-100')}
                    defaultValue={flow.description} />
                </div>

                <div className="col-12 mt-3">
                  <Label htmlFor='txtFlowDefinition'>Definição <span style={{ fontSize: 11 }}>(A descrição do fluxo é considerado no campo Descrição acima)</span>:</Label>
                </div>

                <div className="col-12">
                  <Textarea
                    textarea={{ style: { height: 150 }, className: styles.BlueScroll }}
                    id="txtFlowDescription"
                    className={classNames('w-100')}
                    defaultValue={JSON.stringify(flow.definition, null, 2)} />

                  {/* <CodeEditor
                    value={JSON.stringify(flow.definition, null, 2)}
                    language="json"
                    placeholder="Please enter JS code."
                    // onChange={(evn) => setCode(evn.target.value)}
                    padding={15}
                    className={styles.BlueScroll}
                    style={{
                      height: 300,
                      overflow: 'auto',
                      boxSizing: 'border-box',
                      fontSize: 12,
                      fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    }}
                  /> */}
                </div>
              </div>

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
              // onClick={() => handleTurnOnOffFlow(isFlowOn ? 'turnOff' : 'turnOn')}
              >

              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    )
  }
  return (
    <DialogEdit>
      <Button
        appearance='subtle'
        onClick={() => setDialog(true)}
        disabled={loadingAny || turningState}
        icon={turningState ? <Spinner size='tiny' /> : <HiOutlinePencilAlt />}>
        {turningState ? 'Editando...' : 'Editar'}
      </Button>
    </DialogEdit>
  )
}

const TurnFlowButton = ({ flow, token, loadingAny, handleAlerts, setLoadingAny, handleUpdateFlowsList }: ToolbarProps) => {

  const [dialogOpen, setDialog] = useState(false);
  const [turningState, turnState] = useState(false);

  const handleTurnOnOffFlow = (turn: 'turnOn' | 'turnOff') => {
    setLoadingAny(true);
    turnState(true);
    setDialog(false);
    UpdateStateFlow(token, flow.envName, flow.name, turn)
      .then(() => handleUpdateFlowsList(flow.name, { edit: { state: turn === 'turnOn' ? 'Started' : 'Stopped' } }))
      .catch(e => handleAlerts({ add: { message: e, intent: 'error' } }))
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

const DeleteFlowButton = ({ flow, token, loadingAny, handleAlerts, setLoadingAny, handleUpdateFlowsList }: ToolbarProps) => {
  // CLicar para deletar, quando deletar, deselecionar fluxo e remover da lista.
  const [dialogOpen, setDialog] = useState(false);
  const [turningState, turnState] = useState(false);

  const handleDeleteFlow = () => {
    setLoadingAny(true);
    turnState(true);
    setDialog(false);
    DeleteFlow(token, flow.envName, flow.name)
      .then(() => handleUpdateFlowsList(flow.name, { remove: true }))
      .catch(e => handleAlerts({ add: { message: e, intent: 'error' } }))
      .finally(() => { setLoadingAny(false); turnState(false) })
  }

  const DialogDelete = ({ children }: { children: JSX.Element }) => {
    const [confirm, setConfirm] = useState(false);
    const handleConfirm = (e: any) => console.log(e.target.value)
    return (
      <Dialog open={dialogOpen}>
        <DialogTrigger>
          {children}
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Excluir o fluxo</DialogTitle>
            <DialogContent>
              Tem certeza que dejesa excluir o fluxo?
              <br />

              <div className='m-1'>

                <Checkbox
                  shape="circular"
                  checked={confirm}
                  onChange={() => setConfirm(prev => !prev)}
                  label="Sim, tenho certeza!" />
              </div>

              <div className='d-flex justify-content-between mt-4'>
                <Button
                  appearance="secondary"
                  onClick={() => setDialog(false)}>
                  Fechar
                </Button>
                <Button
                  style={{ backgroundColor: confirm ? 'red' : 'black' }}
                  icon={turningState ? <Spinner size='tiny' /> : null}
                  disabled={loadingAny || turningState || !confirm}
                  appearance="primary"
                  onClick={handleDeleteFlow}>
                  {turningState ? 'Excluindo...' : `Excluir`}
                </Button>
              </div>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    )
  }
  return (
    <DialogDelete>
      <Button
        onClick={() => setDialog(true)}
        disabled={loadingAny || turningState}
        appearance='subtle'
        icon={turningState ? <Spinner size='tiny' /> : <BiTrash className='text-danger' />}>
        {turningState ? 'Excluindo... Adeus 😢' : 'Excluir'}
      </Button>
    </DialogDelete>
  )
}