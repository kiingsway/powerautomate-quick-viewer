import { Avatar, AvatarNamedColor, Badge, Button, CompoundButton, Divider, Input, Label, MenuItem, MenuList, PresenceBadge, PresenceBadgeStatus, Textarea, Title3, Tooltip } from '@fluentui/react-components'
import styles from './MainScreen.module.scss'
import { BiDetail, BiHistory, BiLogOut, BiTrash } from 'react-icons/bi'
import { Alert, Card, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, TableBody, TableCell, TableCellLayout, TableHeader, TableHeaderCell, TableRow, Toolbar, ToolbarButton, ToolbarDivider, } from '@fluentui/react-components/unstable';
import { useEffect, useState } from 'react';
import { DeleteFlow, GetFlow, GetFlowHistories, GetFlowRuns, GetFlows, RunFlow, UpdateFlow, UpdateStateFlow } from '../../services/requests';
import { AiFillCloseCircle } from 'react-icons/ai';
import { BiCloudDownload } from 'react-icons/bi';
import { HiOutlineExternalLink, HiOutlinePencilAlt } from 'react-icons/hi';
import { BsFillPlayFill, BsFillStopFill, BsPeople, BsPlayFill, BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { SiSpinrilla } from 'react-icons/si';
import { VscExport } from 'react-icons/vsc';
import classNames from 'classnames'
import { DateTime } from 'luxon'
import './MainScreen.css'
import uuid from 'react-uuid';
import { Table } from '@fluentui/react-components/unstable';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another


/*
TAREFAS
- ações da toolbar 🆗
- Toolbar: Botão para executar fluxos de botão 🆗
- Toolbar: Compartilhar fluxo, abrir modal para inserção do email
- Toolbar: Download do fluxo
- Filtro nos fluxos igual era no antigo
- Gatilho e Ações mais bonitinho - pegar da api
- Execuções do fluxo - pegar da api
- Ações das execuções do fluxo
- Tentar compartilhar com email específico? - se tiver que fazer requuisições extras, deixa quieto
- Obter conexões e proprietários de cada fluxo
*/



interface Props {
  environments: any[];
  handleLogout: () => void;
  token: string
}

interface ILoadings {
  flows: boolean
}

export default function MainScreen(props: Props) {

  const [flowsList, setFlowsList] = useState<any[]>();
  const [loadings, setLoadings] = useState<ILoadings>({ flows: false });
  const [selectedFlow, selectFlow] = useState<any>();

  // useEffect(() => console.log(selectedFlow), [selectedFlow])

  useEffect(() => {
    if (selectedFlow?.name && !selectedFlow?.properties?.definition) {
      const selEnv = selectedFlow.properties.environment.name;

      setLoadings(prev => ({ ...prev, flows: true }))
      GetFlow(props.token, selEnv, selectedFlow.name)
        .then((flowData: any) => {
          const trigg = Object.keys(flowData.data.properties.definition.triggers)[0];
          GetFlowRuns(props.token, selEnv, selectedFlow.name)
            .then((runsData: any) =>
              GetFlowHistories(props.token, selEnv, selectedFlow.name, trigg)
                .then((historiesData: any) => {
                  const runs = runsData.data;
                  const histories = historiesData.data;
                  selectFlow({ ...flowData.data, runs, histories });
                })
            )
        }
        )
        .catch(e => { alert(e); console.log(e) })
        .finally(() => setLoadings(prev => ({ ...prev, flows: false })))
    }

  }, [selectedFlow])

  const handleGetFlows = (sharedType: 'personal' | 'team') => {
    setLoadings(prev => ({ ...prev, flows: true }))

    if (props.environments.length) {

      const defaultEnvName = props.environments.filter(env => env.properties.isDefault)[0].name
      GetFlows(props.token, defaultEnvName, sharedType)
        .then(flowsData => setFlowsList(flowsData.data?.value))
        .catch(e => { alert(e); console.log(e) })
        .finally(() => setLoadings(prev => ({ ...prev, flows: false })))
    }
  }

  return (
    <div className={styles.main}>

      <div className={styles.navbar}>
        <NavBar handleLogout={props.handleLogout} environmentsCount={props.environments.length} />
      </div>

      <div className={styles.screen}>
        <div className={classNames(styles.side_menu, styles.modern_scroll)}>
          <SideMenu
            handleGetFlows={handleGetFlows}
            environments={props.environments}
            flowsList={flowsList || []}
            loadings={loadings}
            selectedFlow={selectedFlow}
            selectFlow={selectFlow}
          />

        </div>
        <div className={styles.details_page}>
          {
            selectedFlow ?
              <Main
                setFlowsList={setFlowsList}
                selectFlow={selectFlow}
                token={props.token}
                selectedFlow={selectedFlow}
              /> : null
          }

        </div>
      </div>

    </div>
  )
}

const NavBar = (pr: { handleLogout: () => void; environmentsCount: number }) => {

  return (
    <div className={styles.navbar_content}>
      <Badge appearance="ghost" color="informative">
        {pr.environmentsCount} ambientes encontrados
      </Badge>
      <Avatar icon={<BiLogOut />} aria-label="Log-out" size={40} className={styles.navbar_logout} onClick={pr.handleLogout} />
    </div>
  )
}

const SideMenu = (pr: {
  environments: any[];
  handleGetFlows: (sharedType: 'personal' | 'team') => void;
  flowsList: any[];
  loadings: ILoadings;
  selectedFlow: any;
  selectFlow: React.Dispatch<any>;
}) => {

  const [searchFlow, setSearchFlow] = useState('');


  const colors: AvatarNamedColor[] = [
    'blue', 'pink', 'red',
    'dark-red', 'cranberry',
    'pumpkin', 'peach', 'marigold',
    'gold', 'brass', 'brown', 'forest',
    'seafoam', 'dark-green', 'light-teal',
    'teal', 'steel', 'royal-blue',
    'cornflower', 'navy', 'lavender',
    'purple', 'grape', 'lilac', 'pink',
    'magenta', 'plum', 'beige', 'mink',
    'platinum', 'anchor']


  let filteredFlows = searchFlow ? pr.flowsList.filter(flow => (flow.properties.displayName as string).toLowerCase().includes(searchFlow)) : pr.flowsList;
  filteredFlows = filteredFlows.sort((a, b) => (a.properties.lastModifiedTime > b.properties.lastModifiedTime) ? -1 : 1)

  return (
    <Card className={styles.side_menu_content} key={pr.selectedFlow?.name || 'null'}>
      <Title3>Ambientes</Title3>
      <div className={styles.environment_list + ' ' + styles.modern_scroll}>
        {
          pr.environments.map((env, index) => (
            <div className={styles.environment_list_env} key={env.name}>
              <Avatar
                badge={env.properties.isDefault ? { status: 'available' } : undefined}
                initials={env.properties.displayName.slice(0, 2).toUpperCase()}
                color={colors[index]}
                title={env.properties.isDefault ? 'Ambiente padrão selecionado - ' + env.properties.displayName : env.properties.displayName}
                name={env.properties.displayName} />
              {env.properties.displayName}
            </div>

          ))
        }
      </div>
      <Divider />
      <Title3>Obter fluxos</Title3>

      {pr.environments.length &&
        <>
          <div className={styles.side_menu_buttons}>
            <Button
              onClick={() => pr.handleGetFlows('personal')}
              disabled={pr.loadings.flows}
            >
              {pr.loadings.flows ?
                <SiSpinrilla className={styles.spin} />
                :
                'Meus'}
            </Button>
            {
              !pr.loadings.flows &&
              <Button
                onClick={() => pr.handleGetFlows('team')}
                disabled={pr.loadings.flows}
              >
                {pr.loadings.flows ?
                  <SiSpinrilla className={styles.spin} />
                  :
                  'Compartilhados'}
              </Button>
            }
          </div>


          {
            pr.flowsList.length ?
              <>
                <Divider />
                <Title3>Fluxos</Title3>
                <Input
                  value={searchFlow}
                  onChange={e => setSearchFlow(e.target.value)}
                  id="searchFlow"
                  placeholder='Pesquisar...'
                  type='search' />

                <MenuList className={styles.flowsList + ' ' + styles.modern_scroll}>
                  {
                    filteredFlows.map(flow => {
                      return (
                        <MenuItem
                          key={flow.properties.name}
                          title={flow.properties.displayName}
                          onClick={() => pr.selectFlow(flow)}
                          className={classNames(
                            styles.flowsList_flow,
                            { [styles.flowsList_flow_selected]: flow.name === pr.selectedFlow?.name }
                          )}>
                          {flow.properties.displayName}
                          <br />
                          <div className={styles.mini_muted}>
                            {
                              flow.properties.state === 'Started' ?
                                <PresenceBadge title={flow.properties.state} className={styles.state_started} /> : (
                                  flow.properties.state === 'Stopped' ?
                                    <PresenceBadge outOfOffice status="offline" className={styles.state_stopped} title={flow.properties.state} />
                                    :
                                    <PresenceBadge outOfOffice status="busy" className={styles.state_suspended} title={flow.properties.state} />
                                )
                            }
                            <span>{friendlyDate(DateTime.fromISO(flow.properties.lastModifiedTime))}</span>
                          </div>
                        </MenuItem>
                      )
                    })
                  }
                </MenuList>
              </> : null
          }
        </>
      }
    </Card>
  )
}

const Main = (pr: { selectedFlow: any, token: string, selectFlow: React.Dispatch<any>, setFlowsList: React.Dispatch<any> }) => {

  const loadingDefault = {
    running: false,
    state: false,
    edit: false,
    download: false,
    delete: false
  }

  interface IError {
    id: any;
    msg: any;
    intent?: "info" | "success" | "error" | "warning";
  }

  const [loadins, setLoading] = useState(loadingDefault);
  const [errors, setErrors] = useState<IError[]>([]);
  const [editFlowProperties, setFlowProperties] = useState<any>(pr.selectedFlow.properties);
  const [isEditModalOpen, modalMustBeOpened] = useState(false);
  const [flowRuns, setFlowRuns] = useState<any[]>([]);
  useEffect(() => setFlowProperties(pr.selectedFlow.properties), [pr.selectedFlow.properties])
  useEffect(() => Array.isArray(pr.selectedFlow?.runs) ? setFlowRuns(pr.selectedFlow.runs) : undefined, [pr.selectedFlow])

  if (!pr.selectedFlow) return null

  const selFlow = {
    name: pr.selectedFlow.name,
    displayName: pr.selectedFlow.properties.displayName,
    state: pr.selectedFlow.properties.state,
    trigger: pr.selectedFlow.properties.definitionSummary.triggers[0],
    actions: pr.selectedFlow.properties.definitionSummary.actions,
    triggerName: pr.selectedFlow.properties?.definition ? Object.keys(pr.selectedFlow.properties.definition.triggers)[0] : null,
    envName: pr.selectedFlow.properties.environment.name,
    uriTrigger: pr.selectedFlow.properties?.flowTriggerUri,
    connectionReferences: Object.keys(pr.selectedFlow.properties.connectionReferences ?? {}) as any[],
  }

  const Status = () => {
    const states = {
      Suspended: 'Suspenso',
      Stopped: 'Desativado',
      Started: 'Ativado'
    }
    return <LabelText label={'Status:'}>{states[pr.selectedFlow.properties.state as keyof typeof states]}</LabelText>
  }

  const Description = () => {

    const desc = pr.selectedFlow.properties.definitionSummary.description;
    if (!desc) return null

    return (
      <LabelText label={'Descrição:'}>
        {pr.selectedFlow.properties.definitionSummary.description}
      </LabelText>
    )
  }

  const FlowFailureAlertSubscribed = () => {

    const flowFailureAlertSubscribed = pr.selectedFlow.properties.flowFailureAlertSubscribed;
    if (!flowFailureAlertSubscribed) return null

    return (
      <LabelText label={'Receber alertas de falhas do fluxo:'}>
        {pr.selectedFlow.properties.flowFailureAlertSubscribed ? 'Sim' : 'Não'}
      </LabelText>
    )
  }

  const Date = (pr: { label: string, dateIso: string }) => {

    if (!pr.dateIso) return null

    return (
      <LabelText label={pr.label}>
        {friendlyDate(DateTime.fromISO(pr.dateIso))}
      </LabelText>
    )
  }

  const FlowSuspensionReason = () => {


    const flowSuspensionReason = pr.selectedFlow.properties?.flowSuspensionReason && pr.selectedFlow.properties?.flowSuspensionReason !== 'None' && pr.selectedFlow.properties.state === 'Suspended' ?
      pr.selectedFlow.properties?.flowSuspensionReason
      : null

    if (!flowSuspensionReason) return null

    const suspensionReasons = {
      NeverTriggeringDetected: 'Nunca engatilhado',
      AlwaysFailingDetected: 'Falhando sempre',
      AllActionsFailingDetected: 'Ações falhando'
    }

    const flowSuspensionTime = pr.selectedFlow.properties?.flowSuspensionTime;
    const dateTime = DateTime.fromISO(flowSuspensionTime, { locale: 'pt-BR' });

    return (
      <LabelText label={'Razão de suspensão do fluxo:'}>
        {suspensionReasons[flowSuspensionReason as keyof typeof suspensionReasons]}
        <span style={{ marginLeft: 5 }}>
          ({flowSuspensionReason})
        </span>
        <span style={{ marginLeft: 5 }}>
          ({dateTime.toFormat('dd LLL yy ')} às {dateTime.toFormat(' HH:mm')})
        </span>
      </LabelText>
    )
  }

  const urlFlowInitial = `https://make.powerautomate.com/environments/${pr.selectedFlow.properties.environment.name}/flows/${pr.selectedFlow.name}`

  const urlFlow = {
    edit: `${urlFlowInitial}`,
    details: `${urlFlowInitial}/details`,
    owners: `${urlFlowInitial}/owners`,
    export: `${urlFlowInitial}/export`,
    runs: `${urlFlowInitial}/runs`,
  }

  type TFlowActions = 'turnOn' | 'turnOff' | 'download' | 'delete' | 'modifyFlow' | 'runFlow';
  const handleFlowActions = (action: TFlowActions) => {

    const txt = `Óbvio que não tá funcionando kkkk tá muito bonitinho pra ser tão funcional assim.`
    // const txt = `Óbvio que não tá funcionando kkkk tá muito bonitinho pra ser verdade. ${action}`

    const handleErrors = (e: any) => {
      console.error(e);

      const data = e.response.data;
      const dataError = data?.error;
      let msg = JSON.stringify(data)

      const errorIsString = typeof dataError === 'string' || dataError instanceof String
      const errorIsObject = typeof dataError === 'object' && !Array.isArray(dataError) && dataError !== null

      if (errorIsString && data?.message)
        msg = `(${dataError}) ${data.message}`

      if (errorIsObject && dataError?.code && dataError?.message)
        msg = `(${dataError.code}) ${dataError.message}`


      setErrors(prev => ([{ id: uuid(), msg }, ...prev]))
    }

    if (action === 'turnOn' || action === 'turnOff') {
      setLoading(prev => ({ ...prev, state: true }))

      UpdateStateFlow(pr.token, pr.selectedFlow.properties.environment.name, pr.selectedFlow.name, action)
        .catch(handleErrors)
        .then(() => {
          let newSelectedFlow = pr.selectedFlow;
          newSelectedFlow.properties.state = action === 'turnOn' ? 'Started' : 'Stopped';
          pr.selectFlow(newSelectedFlow)

        })
        .finally(() => setLoading(prev => ({ ...prev, state: false })))

      return
    }

    if (action === 'delete') {
      setLoading(prev => ({ ...prev, delete: true }))

      DeleteFlow(pr.token, pr.selectedFlow.properties.environment.name, pr.selectedFlow.name)
        .catch(handleErrors)
        .then(() => {
          pr.setFlowsList((prev: any) => prev.filter((flow: any) => flow.name !== pr.selectedFlow.name))
          pr.selectFlow(null)
        })
        .finally(() => setLoading(prev => ({ ...prev, delete: false })))

      return

    }

    if (action === 'modifyFlow') {
      setLoading(prev => ({ ...prev, edit: true }))
      const newFlowProperties = {
        properties: {
          definition: editFlowProperties.definition,
          // connectionReferences: editFlowProperties.connectionReferences,
          // parameters: editFlowProperties.parameters,
          displayName: editFlowProperties.displayName,
          // templateName: editFlowProperties.templateName,
          // environment: editFlowProperties.environment,
        }
      }


      UpdateFlow(pr.token, pr.selectedFlow.properties.environment.name, pr.selectedFlow.name, newFlowProperties)
        .then((resp: any) => {
          const savedFlow = resp?.data;
          const newFlowDName = savedFlow.properties.displayName
          const displayNameChanged = selFlow.displayName !== newFlowDName
          modalMustBeOpened(false);
          const msg = `Fluxo "${newFlowDName}" atualizado${displayNameChanged ? ` - Nome anterior "${selFlow.displayName}"` : ''}`;
          setErrors(prev => [{ id: uuid(), msg, intent: 'success' }, ...prev])
          pr.selectFlow((prev: any) => prev.properties.flowTriggerUri ? { ...savedFlow, properties: { ...savedFlow.properties, flowTriggerUri: prev.properties.flowTriggerUri } } : savedFlow);
          pr.setFlowsList((prev: any[]) => {
            const selectedFlowIndex = prev.map(f => f.name).indexOf(savedFlow.name);
            let newList = prev;
            newList[selectedFlowIndex] = savedFlow;
            return newList
          })
        })
        .catch(handleErrors)
        .finally(() => setLoading(prev => ({ ...prev, edit: false })))

      return
    }

    if (action === 'runFlow') {
      setLoading(prev => ({ ...prev, running: true }))

      console.log(pr.selectedFlow)

      if (!selFlow.triggerName || !selFlow.uriTrigger) {
        console.log(pr.selectedFlow)
        setErrors(prev => ([{ id: uuid(), msg: 'Propriedade não encontrada...' }, ...prev]))
        setLoading(prev => ({ ...prev, running: false }))
        return;
      }


      RunFlow(pr.token, selFlow.name, selFlow.envName, selFlow.triggerName, selFlow.uriTrigger)
        .catch(handleErrors)
        .then(() => {
          setErrors(prev => ([{ id: uuid(), msg: `Fluxo "${selFlow.displayName}" executado`, intent: 'success' }, ...prev]))
        })
        .finally(() => setLoading(prev => ({ ...prev, running: false })))

      return
    }

    alert(txt); return

  }

  const EditModal = () => {

    return (

      <Dialog modalType="alert" open={isEditModalOpen}>
        <DialogTrigger>
          <ToolbarButton onClick={() => modalMustBeOpened(true)}>
            <HiOutlinePencilAlt className='details-info-links-icon' />Editar</ToolbarButton>
        </DialogTrigger>

        <DialogSurface className='edit-flow-modal'>
          <DialogBody>
            <DialogTitle>Edição do fluxo</DialogTitle>
            <DialogContent>
              <div className='edit-flow-modal-body'>
                <Label htmlFor="txtFlowDisplayName" className='edit-flow-modal-label'>Nome do fluxo:</Label>
                <Input
                  disabled={loadins.edit}
                  id="txtFlowDisplayName"
                  onChange={e => setFlowProperties((prev: any) => ({ ...prev, displayName: e.target.value }))}
                  value={editFlowProperties.displayName} />

                <Label htmlFor="txtFlowDescription" className='edit-flow-modal-label'>Descrição do fluxo:</Label>
                <Textarea
                  disabled={loadins.edit}
                  id='txtFlowDescription'
                  className={classNames('cards-triggerActions-txtarea', styles.modern_scroll_txa)}
                  resize="vertical"
                  onChange={e => setFlowProperties((prev: any) => ({ ...prev, definition: { ...prev.definition, description: e.target.value } }))}
                  value={editFlowProperties.definition?.description} />

                <Label htmlFor="txtFlowDefinition" className='edit-flow-modal-label'>Definição do fluxo
                  <small className='tip'> (a descrição do fluxo é definido no campo acima)</small>:</Label>
                <Textarea
                  disabled={loadins.edit}
                  id='txtFlowDefinition'
                  className={classNames('cards-triggerActions-txtarea txa_code', styles.modern_scroll_txa)}
                  resize="vertical"
                  onChange={e => setFlowProperties((prev: any) => ({ ...prev, definition: { ...JSON.parse(e.target.value), description: prev.definition.description } }))}
                  value={JSON.stringify(editFlowProperties.definition, null, 2)} />
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger>
                <Button appearance="outline" onClick={() => modalMustBeOpened(false)}>Cancelar</Button>
              </DialogTrigger>
              <Button
                disabled={loadins.edit}
                appearance="primary"
                onClick={() => handleFlowActions('modifyFlow')}
              >
                {
                  loadins.edit ?
                    <><SiSpinrilla className={classNames('details-info-links-icon', styles.spin)} /> Salvando...</>
                    : 'Salvar'
                }

              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    )
  }

  const DeleteButton = () => {

    return (
      <Dialog modalType="alert">
        <DialogTrigger>
          <ToolbarButton>
            {
              loadins.delete ?
                <><SiSpinrilla className={classNames('details-info-links-icon details-info-links-danger', styles.spin)} /> Excluindo...</>
                : <><BiTrash className='details-info-links-icon details-info-links-danger' />Excluir</>
            }
          </ToolbarButton>

        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Tem certeza que deseja excluir esse fluxo?</DialogTitle>
            <DialogContent>
              <p>Você terá 28 dias para restaurar o fluxo.</p>
              <p>Veja também:</p>
              <Button
                appearance='subtle'
                icon={<HiOutlineExternalLink />}
                as='a'
                href='https://learn.microsoft.com/en-us/power-automate/how-tos-restore-deleted-flow'
                target='__blank'>
                Como restaurar fluxo excluído

              </Button>
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => handleFlowActions('delete')}>Excluir</Button>
              <DialogTrigger><Button appearance="secondary">Cancelar</Button></DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    )
  }

  const RunModal = () => {

    if (!selFlow.uriTrigger) return null

    console.log(pr.selectedFlow)

    return (
      <Dialog modalType="alert">
        <DialogTrigger>
          <ToolbarButton className={classNames({ ['details-info-links-warning']: selFlow.state !== 'Started' })}>
            {
              loadins.running ?
                <><SiSpinrilla className={classNames('details-info-links-icon', styles.spin)} /> Executando...</>
                : <><BsFillPlayFill className={classNames('details-info-links-icon', { ['details-info-links-warning']: selFlow.state !== 'Started' })} />Executar</>
            }
          </ToolbarButton>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Conexões do fluxo</DialogTitle>
            <DialogContent>
              <div className='connections'>
                {!selFlow.connectionReferences.length && 'Não há conexões para este fluxo.'}
                {selFlow.connectionReferences.map(connection => {
                  const conn = pr.selectedFlow.properties.connectionReferences[connection];
                  return (
                    <div className='connection'>
                      <Avatar
                        size={40}
                        style={{ marginRight: 8 }}
                        name={conn.displayName}
                        image={{ src: conn.iconUri }}
                      />
                      <div className='connection-text'>
                        <span>{conn.displayName}</span>
                        <span className='connection-text-small'>{conn.connectionName}</span>
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
                disabled={loadins.running || selFlow.state !== 'Started'}
                onClick={() => handleFlowActions('runFlow')}>
                {loadins.running ? 'Executando...' : (selFlow.state !== 'Started' ? 'Fluxo desligado' : 'Executar')}
              </Button>

            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog >
    )
  }

  const FlowToolbar = () => {

    const isFlowStarted = selFlow.state === 'Started';

    return (

      <Toolbar className={styles.details_page_toolbar}>

        <Tooltip content='Executar fluxo' relationship="label">
          <RunModal />
        </Tooltip>

        <Tooltip
          content={isFlowStarted ? 'Desligar fluxo' : 'Ligar fluxo'}
          relationship="label"
        >
          <ToolbarButton onClick={() => handleFlowActions(isFlowStarted ? 'turnOff' : 'turnOn')}>

            {
              loadins.state ?
                <><SiSpinrilla className={classNames('details-info-links-icon', styles.spin)} /> {isFlowStarted ? 'Desligando...' : 'Ligando...'}</>
                : (
                  isFlowStarted ?
                    <><BsToggleOn className='details-info-links-icon' /> Desligar</>
                    :
                    <><BsToggleOff className='details-info-links-icon' />Ligar</>
                )
            }

          </ToolbarButton>
        </Tooltip>

        <Tooltip
          content='Abre uma janela para edição da definição JSON do fluxo. A verificação de erros é feita no servidor, então qualquer erro na definição você será informado e o fluxo não será salvo.'
          relationship="label">
          <EditModal />
        </Tooltip>

        <Tooltip content='Exclua o fluxo' relationship="label">
          <DeleteButton />
        </Tooltip>

        <ToolbarDivider />
      </Toolbar>
    )
  }


  return (
    <div className={styles.details_page}>

      <Card className='details-main'>
        <div>

          <Title3 title={pr.selectedFlow.properties.displayName} className={styles.details_page_topic}>


            {
              pr.selectedFlow.properties.state === 'Started' ?
                <PresenceBadge title={pr.selectedFlow.properties.state} className={styles.state_started} /> : (
                  pr.selectedFlow.properties.state === 'Stopped' ?
                    <PresenceBadge outOfOffice status="offline" className={styles.state_stopped} title={pr.selectedFlow.properties.state} />
                    :
                    <PresenceBadge outOfOffice status="busy" className={styles.state_suspended} title={pr.selectedFlow.properties.state} />
                )
            }

            {pr.selectedFlow.properties.displayName}
          </Title3>

          <FlowToolbar />

          {errors.map(error => (
            <Alert
              key={error.id}
              style={{ marginBottom: 5, display: 'flex', alignItems: 'center', flexDirection: 'row' }}
              intent={error?.intent ? error.intent : 'error'}
              action={<span
                onClick={() => setErrors(prev => prev.filter(e => e.id !== error.id))}>
                <span>Fechar</span>
                <AiFillCloseCircle style={{ marginLeft: 5 }} />
              </span>}
            >
              <span style={{ maxWidth: 600, overflow: 'auto', wordBreak: 'break-word', fontSize: 10, lineHeight: 1, fontFamily: 'Consolas' }}>
                {String(error.msg).replace(/pr.token/gi, '**sanitized**')}

              </span>
            </Alert>
          ))}

        </div>

        <Divider />
        <div className="details-info">
          <div className="details-info-main">
            <Status />
            <Description />
            <FlowSuspensionReason />
          </div>

          <div className="details-info-more">
            <Date label='Modificado:' dateIso={pr.selectedFlow.properties.lastModifiedTime} />
            <Date label='Criado:' dateIso={pr.selectedFlow.properties.createdTime} />
            <FlowFailureAlertSubscribed />
          </div>
          <div className="details-info-links">
            <Title3>Links para o Power Automate <HiOutlineExternalLink className='details-info-links-icon' /></Title3>

            <Button as='a' href={urlFlow.details} target='__blank'
              className='details-info-links-button' icon={<BiDetail />}>
              Detalhes do fluxo
            </Button>

            <Button as='a' href={urlFlow.edit} target='__blank'
              className='details-info-links-button' icon={<HiOutlinePencilAlt />}>
              Edição do fluxo
            </Button>

            <Button as='a' href={urlFlow.owners} target='__blank'
              className='details-info-links-button' icon={<BsPeople />}>
              Proprietários do fluxo
            </Button>

            <Button as='a' href={urlFlow.export} target='__blank'
              className='details-info-links-button' icon={<VscExport />}>
              Exportar fluxo
            </Button>

            <Button as='a' href={urlFlow.runs} target='__blank'
              className='details-info-links-button' icon={<BiHistory />}>
              Execuções do fluxo
            </Button>

          </div>
        </div>

      </Card>

      <Card style={{ margin: '15px 0' }}>
        <LabelText label='Histórico de execução' labelOnly />
        <Table>
          <TableHeader>
            <TableRow>
              {['Início', 'Duração', 'Status'].map(col => (
                <TableHeaderCell key={col}>{col}</TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {flowRuns?.map((run: any) => (
              <TableRow key={run.name}>
                <TableCell>
                  {DateTime
                    .fromISO(run.properties.startTime, { locale: 'pt-BR' })
                    .toFormat('dd LLL yy HH:mm:ss')}
                </TableCell>
                <TableCell>{'duração...'}</TableCell>
                <TableCell>{run.properties.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </Card>

      <div className="cards-triggerActions">

        <Card className='cards-triggerActions-trigger'>
          <LabelText label={'Gatilho:'}>
            <TriggerActionsText trigger={selFlow.trigger} />
          </LabelText>
        </Card>

        <Card className='cards-triggerActions-actions'>
          <LabelText label={'Resumo das ações:'}>
            <TriggerActionsText actions={selFlow.actions} />
          </LabelText>
        </Card>

      </div>
    </div>
  )
}

const friendlyDate = (date: DateTime) => {
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


const LabelText = (pr: { children?: any, label: string | JSX.Element; labelOnly?: boolean }) => {

  if (pr.labelOnly) return <div className={styles.labelText}> <span className={styles.labelText_Label}> {pr.label} </span></div>

  return (
    <div className={styles.labelText}>
      <span className={styles.labelText_Label}>
        {pr.label}
      </span>
      <span className={styles.labelText_Text}>
        {pr.children}
      </span>
    </div>
  )
}

const CodeEditor = (pr: { code: string }) => <Editor
  value={JSON.stringify(JSON.parse(pr.code), null, 2)}
  onValueChange={() => null}
  highlight={code => highlight(code, languages.js)}
  padding={10}
  style={{
    fontFamily: '"Fira code", "Fira Mono", monospace',
    fontSize: 12,
  }}
/>

const TriggerActionsText = (pr: { trigger?: any, actions?: any[] }) => {

  const LabelText2 = (p: { title: string, value?: string }) => {

    if (!p.value) return null

    return <p style={{ marginTop: 3 }}>
      <span style={{ fontWeight: 600, paddingRight: 5 }}>{p.title}</span>
      {p.value}
    </p>
  }

  if (pr.actions?.length) {
    const actionsSummary = pr.actions.map(act => act.swaggerOperationId ? act.swaggerOperationId : act.type)
    return (
      <>
        {actionsSummary.join(', ')}
      </>
    )
  }

  return (
    <>
      <LabelText2 title='Tipo:' value={pr.trigger?.type} />
      <LabelText2 title='Espécie:' value={pr.trigger?.kind} />
      <LabelText2 title='Operação:' value={pr.trigger?.swaggerOperationId} />
    </>
  )
}
