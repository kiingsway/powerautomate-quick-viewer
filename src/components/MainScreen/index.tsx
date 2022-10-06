import { Avatar, AvatarNamedColor, Badge, Button, Divider, MenuItem, MenuList, PresenceBadge, Textarea, Title3, Tooltip } from '@fluentui/react-components'
import styles from './MainScreen.module.scss'
import { BiDetail, BiHistory, BiLogOut, BiPowerOff, BiTrash } from 'react-icons/bi'
import { Card, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Overflow, Toolbar, ToolbarButton, ToolbarDivider, } from '@fluentui/react-components/unstable';
import { useEffect, useState } from 'react';
import { GetFlows } from '../../services/requests';
import { AiFillStop } from 'react-icons/ai';
import { BiCloudDownload } from 'react-icons/bi';
import { HiOutlineExternalLink, HiOutlinePencilAlt } from 'react-icons/hi';
import { BsCheckCircleFill, BsFillStopCircleFill, BsFillStopFill, BsPeople, BsPlayFill } from 'react-icons/bs';
import { SiSpinrilla } from 'react-icons/si';
import { VscExport } from 'react-icons/vsc';


import classNames from 'classnames'
import { DateTime } from 'luxon'
import './MainScreen.css'


/*
TAREFAS
- ações da toolbar
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
      <Avatar icon={<BiLogOut />} aria-label="Guest" size={40} className={styles.navbar_logout} onClick={pr.handleLogout} />
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

  console.log(pr.flowsList)

  return (
    <Card className={styles.side_menu_content}>
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
                <MenuList className={styles.flowsList + ' ' + styles.modern_scroll}>
                  {
                    pr.flowsList.map(flow => {

                      const friendlyDate = (date: string) => {
                        const now = DateTime.now().setLocale('pt-BR');
                        const dateTime = DateTime.fromISO(date, { locale: 'pt-BR' })
                        const friendlyDates = {
                          today: `hoje às ${dateTime.toFormat('HH:mm')}`,
                          yesterday: `ontem às ${dateTime.toFormat('HH:mm')}`,
                          week: `${dateTime.toFormat('cccc (dd)')} às ${dateTime.toFormat('HH:mm')}`,
                          year: `${dateTime.toFormat('dd LLL')} às ${dateTime.toFormat('HH:mm')}`,
                          default: dateTime.toFormat('dd LLL yyyy HH:mm')
                        }

                        if (dateTime.hasSame(now, 'day'))
                          return friendlyDates.today

                        if (dateTime.hasSame(now.minus({ days: 1 }), 'day'))
                          return friendlyDates.yesterday

                        if (dateTime.hasSame(now, 'week'))
                          return friendlyDates.week

                        if (dateTime.hasSame(now, 'year'))
                          return friendlyDates.year

                        return friendlyDates.default
                      }

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
                                <BsCheckCircleFill className={styles.state_started} title={flow.properties.state} /> : (
                                  flow.properties.state === 'Stopped' ?
                                    <BsFillStopCircleFill className={styles.state_stopped} title={flow.properties.state} />
                                    :
                                    <AiFillStop className={styles.state_suspended} title={flow.properties.state} />
                                )
                            }
                            <span>{friendlyDate(flow.properties.lastModifiedTime)}</span>
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

const Main = (pr: { selectedFlow: any }) => {




  const Status = () => {
    const state = pr.selectedFlow.properties.state;
    const status = state === 'Suspended' ? 'Suspenso'
      : (state === 'Stopped' ? 'Desligado'
        : (state === 'Stated' ? 'Ligado'
          : state))

    return <LabelText label={'Status:'}>{status}</LabelText>
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

    const dateTime = DateTime.fromISO(pr.dateIso, { locale: 'pt-BR' });

    return (
      <LabelText label={pr.label}>
        {dateTime.toFormat('dd LLL yy ')} às {dateTime.toFormat(' HH:mm')}
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

  type TFlowActions = 'turnOn' | 'turnOff' | 'download' | 'delete' | 'modifyFlow';
  const handleFlowActions = (action: TFlowActions) => {

    const txt = `Óbvio que não tá funcionando kkkk tá muito bonitinho pra ser tão funcional assim.`
    // const txt = `Óbvio que não tá funcionando kkkk tá muito bonitinho pra ser verdade. ${action}`

    if (action === 'turnOn' ||
      action === 'turnOff' ||
      action === 'delete' ||
      action === 'download' ||
      action === 'modifyFlow') { alert(txt); return }

  }

  const EditModal = () => {

    return (

      <Dialog modalType="alert">
        <DialogTrigger>
          <ToolbarButton>
            <HiOutlinePencilAlt className='details-info-links-icon' />
            Editar fluxo
          </ToolbarButton>
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edição do fluxo</DialogTitle>
            <DialogContent>

              <Textarea
                className={classNames('cards-triggerActions-txtarea', styles.modern_scroll, 'h-100')}
                resize="vertical"
                value={JSON.stringify(pr.selectedFlow.properties?.definitionSummary, null, 4)} />

            </DialogContent>
            <DialogActions>
              <DialogTrigger>
                <Button appearance="outline">Cancelar</Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                onClick={() => handleFlowActions('modifyFlow')}
              >
                Salvar
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    )
  }

  const state = pr.selectedFlow.properties.state;

  const FlowToolbar = () => {

    const isFlowRunning = state === 'Started';

    return (

      <Toolbar className={styles.details_page_toolbar}>

        <Tooltip
          content={isFlowRunning ? 'Desligar fluxo' : 'Ligar fluxo'}
          relationship="label"
        >
          <ToolbarButton onClick={() => handleFlowActions(isFlowRunning ? 'turnOff' : 'turnOn')}>
            {
              isFlowRunning ?
                <><BsFillStopFill className='details-info-links-icon' /> Desligar fluxo</>
                :
                <><BsPlayFill className='details-info-links-icon' />Ligar fluxo</>
            }
          </ToolbarButton>
        </Tooltip>


        <Tooltip
          content='Abre uma janela para edição da definição JSON do fluxo. A verificação de erros é feita no servidor, então qualquer erro na definição você será informado e o fluxo não será salvo.'
          relationship="label">
          <EditModal />
        </Tooltip>

        <Tooltip
          content='Fazer o download do pacote legado (.zip) do fluxo. Os detalhes do pacote serão preenchidos com inforamações já preenchidas no fluxo'
          relationship="label">

          <ToolbarButton  onClick={() => handleFlowActions('download')}>
            <BiCloudDownload className='details-info-links-icon' />
            Baixar fluxo
          </ToolbarButton>

        </Tooltip>

        <Tooltip content='Exclua o fluxo' relationship="label">

          <ToolbarButton  onClick={() => handleFlowActions('delete')}>
            <BiTrash className='details-info-links-icon details-info-links-danger' />
            Excluir fluxo
          </ToolbarButton>

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

            {pr.selectedFlow.properties.state === 'Started' ?
              <PresenceBadge title={pr.selectedFlow.properties.state} /> : (
                pr.selectedFlow.properties.state === 'Stopped' ?
                  <BsFillStopCircleFill className={styles.state_stopped} title={pr.selectedFlow.properties.state} />
                  :
                  <AiFillStop className={styles.state_suspended} title={pr.selectedFlow.properties.state} />
              )}

            {pr.selectedFlow.properties.displayName}
          </Title3>

          <FlowToolbar />

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

      <div className="cards-triggerActions">

        <Card className='cards-triggerActions-trigger'>

          <LabelText label={'Gatilho (properties.definitionSummary.triggers):'}>
            <Textarea
              className={'cards-triggerActions-txtarea ' + styles.modern_scroll}
              resize="vertical"
              value={JSON.stringify(pr.selectedFlow.properties?.definitionSummary?.triggers[0], null, 2)} />
          </LabelText>

        </Card>

        <Card className='cards-triggerActions-actions'>
          <LabelText label={'Ações (properties.definitionSummary.actions):'}>
            <Textarea
              className={classNames('cards-triggerActions-txtarea', styles.modern_scroll)}
              resize="vertical"
              value={JSON.stringify(pr.selectedFlow.properties?.definitionSummary?.actions, null, 2)} />
          </LabelText>

        </Card>

      </div>
    </div>
  )
}
const LabelText = (pr: { children: any, label: string | JSX.Element }) => {

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