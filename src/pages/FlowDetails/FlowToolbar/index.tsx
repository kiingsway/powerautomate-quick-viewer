import { Button, Spinner, Tooltip, Dialog, DialogTrigger, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Checkbox, Link, Label, Input, Textarea } from '@fluentui/react-components';
import styles from './FlowToolbar.module.scss'
import { Persona } from '@fluentui/react-components/unstable';
import { useEffect, useState } from 'react'
import { BiTrash } from 'react-icons/bi';
import { BsFillPlayFill, BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { IFlowDetailsSummary, IFlowSave, RunFlowToolbarProps, ToolbarProps } from '../interfaces';
import classNames from 'classnames';
import { DeleteFlow, EditFlow, GetFlowConnections, RunFlow, UpdateStateFlow } from '../../../services/requests';
import { IHandleAlerts, IToken } from '../../../interfaces';
import { ICloudFlow, IFlowConnection, IHandleSetFlow, IHandleUpdateFlowsList } from '../../FlowsViewer/interfaces';
import { DateTime } from 'luxon';

interface Props {
  flow: IFlowDetailsSummary;
  token: IToken['text'];
  handleSetFlow: IHandleSetFlow;
  handleAlerts: IHandleAlerts;
  handleUpdateFlowsList: IHandleUpdateFlowsList;
  handleUpdateRuns: () => void;
}

export default function FlowToolbar({ flow, token, handleAlerts, handleUpdateFlowsList, handleUpdateRuns }: Props) {

  const [loadingAny, setLoadingAny] = useState(false);

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
          handleUpdateRuns={handleUpdateRuns}
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
    </div>
  )
}

const RunFlowButton = ({ flow, token, loadingAny, handleAlerts, setLoadingAny, handleUpdateRuns }: RunFlowToolbarProps) => {

  const [runModalOpen, setRunModal] = useState(false);
  const [connections, setConnections] = useState<IFlowConnection[]>();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!flow.trigger.uri) return

    GetFlowConnections(token, flow.envName, flow.name)
      .then(r => { setConnections(r.data) })
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))

  }, [])

  if (!flow.trigger.uri) return null

  const isFlowOn = flow.state === 'Started';

  const runFlow = () => {
    setLoadingAny(true)
    setRunning(true)
    RunFlow(token, flow.trigger.uri)
      .then(() => handleAlerts({ add: { message: `Fluxo "${flow.displayName}" executado`, intent: 'success', createdDateTime: DateTime.now() } }))
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
      .finally(() => { setLoadingAny(false); setRunModal(false); setRunning(false); handleUpdateRuns() })
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
  const [editing, setEditing] = useState(false);
  const [newFlowProps, setNewFlowProps] = useState<IFlowSave>({
    properties: {
      definition: {
        ...flow.definition,
        description: flow.description
      },
      displayName: flow.displayName,
    }
  });

  const handleEditFlow = () => {
    setLoadingAny(true);
    setEditing(true)

    EditFlow(token, flow.envName, flow.name, newFlowProps)
      .then(resp => {
        setDialog(false);
        handleAlerts({ add: { message: 'Fluxo alterado com sucesso!', intent: 'success', createdDateTime: DateTime.now() } })
        const newFlow = resp.data as ICloudFlow;
        handleUpdateFlowsList(flow.name, {
          edit: {
            state: newFlow.properties.state,
            title: newFlow.properties.displayName,
            lastModifiedTime: newFlow.properties.lastModifiedTime,
            definition: newFlow.properties.definition,
          }
        })
      })
      .catch(e => {
        handleAlerts({ add: { message: e?.response?.data?.message ? e.response.data.message : e, intent: 'error', createdDateTime: DateTime.now() } })
      })
      .finally(() => { setLoadingAny(false); setEditing(false) })
  }

  const uriFlow = `https://make.powerautomate.com/environments/${flow.envName}/flows/${flow.name}/details`;

  return (
    <Dialog open={dialogOpen}>
      <DialogTrigger>

        <Button
          appearance='subtle'
          onClick={() => setDialog(true)}
          disabled={loadingAny || editing}
          icon={editing ? <Spinner size='tiny' /> : <HiOutlinePencilAlt />}>
          {editing ? 'Editando...' : 'Editar'}
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>

          <DialogTitle>
            Editar fluxo <Link href={uriFlow} target='__blank'> {flow.displayName} </Link>
          </DialogTitle>

          <DialogContent>

            <div className="row w-100" style={{ gap: 5 }}>

              <div className="col-12 mt-2">
                <Label htmlFor="txtFlowDisplayName">Nome:</Label>
              </div>

              <div className="col-12">
                <Input
                  maxLength={255}
                  disabled={editing}
                  value={newFlowProps.properties.displayName}
                  onChange={e => setNewFlowProps(prev => ({
                    ...prev,
                    properties: {
                      ...prev.properties,
                      displayName: e.target.value
                    }
                  }))}
                  id="txtFlowDisplayName"
                  className='w-100'
                  defaultValue={flow.displayName} />
              </div>

              <div className="col-12 mt-3">
                <Label htmlFor="txtFlowDescription">Descrição:</Label>
              </div>

              <div className="col-12">
                <Textarea
                  maxLength={1023}
                  disabled={editing}
                  className={classNames('w-100')}
                  id="txtFlowDescription"
                  textarea={{ style: { height: 150 }, className: styles.BlueScroll }}
                  value={newFlowProps.properties.definition.description}
                  onChange={e => setNewFlowProps(prev => ({
                    ...prev,
                    properties: {
                      ...prev.properties,
                      definition: {
                        ...prev.properties.definition,
                        description: e.target.value,
                      }
                    }
                  }))}
                />
              </div>

              <div className="col-12 mt-3">
                <Label htmlFor='txtFlowDefinition'>Definição <span style={{ fontSize: 11 }}>(A descrição do fluxo é considerado no campo Descrição acima)</span>:</Label>
              </div>

              <div className="col-12">
                <Textarea
                  disabled={editing}
                  textarea={{ style: { height: 150 }, className: styles.BlueScroll }}
                  id="txtFlowDescription"
                  className={classNames('w-100')}
                  value={JSON.stringify(newFlowProps.properties.definition, null, 2)}
                  onChange={e => setNewFlowProps(prev => {
                    if (!isJsonString(e.target.value)) return prev
                    return {
                      ...prev,
                      properties: {
                        ...prev.properties,
                        definition: {
                          ...JSON.parse(e.target.value),
                          description: prev.properties.definition.description,
                        }
                      }
                    }
                  })}
                />
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
              icon={editing ? <Spinner size='tiny' /> : null}
              disabled={loadingAny || editing}
              appearance="primary"
              onClick={handleEditFlow}
            >
              Editar
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
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
      .then(() => {
        handleUpdateFlowsList(flow.name, {
          edit: {
            state: turn === 'turnOn' ? 'Started' : 'Stopped'
          }
        })
      })
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
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
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
      .finally(() => { setLoadingAny(false); turnState(false) })
  }

  const DialogDelete = ({ children }: { children: JSX.Element }) => {

    const [confirm, setConfirm] = useState(false);

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

function isJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}