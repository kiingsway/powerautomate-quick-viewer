import { Avatar, Button, Divider, Label, Link, Spinner, Title2, Title3, Tooltip } from '@fluentui/react-components';
import { Alert, Card, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Toolbar, ToolbarButton, ToolbarDivider, ToolbarToggleButton } from '@fluentui/react-components/unstable';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react'
import { BsFillPlayFill } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { SiSpinrilla } from 'react-icons/si';
import uuid from 'react-uuid';
import { GetFlow, RunFlow } from '../../services/requests';
import styles from './FlowDetails.module.scss'

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
  name: any;
  displayName: any;
  state: any;
  trigger: any;
  actions: any;
  triggerName: string | null;
  envName: any;
  uriTrigger: any;
  connectionReferences: any;
  connectionsNames: any[];
}

export default function FlowDetails(props: Props) {

  const [alerts, setAlert] = useState<IAlert[]>([]);
  const [loadingFlow, setLoadingFlow] = useState(false);
  const [selectedFlowDetails, setFlowDetails] = useState<IFlowDetails>();

  useEffect(() => console.log(selectedFlowDetails), [selectedFlowDetails])

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

        const newDetails = {
          name: response?.data?.name,
          displayName: response?.data?.properties?.displayName,
          state: response?.data?.properties?.state,
          trigger: response?.data?.properties?.definitionSummary.triggers[0],
          actions: response?.data?.properties.definitionSummary.actions,
          triggerName: response?.data?.properties?.definition ? Object.keys(response?.data?.properties.definition.triggers)[0] : null,
          envName: response?.data?.properties.environment.name,
          uriTrigger: response?.data?.properties?.flowTriggerUri,
          connectionReferences: response?.data?.properties.connectionReferences,
          connectionsNames: Object.keys(response?.data?.properties.connectionReferences ?? {}) as any[],
          // lastModifiedTime: response?.data?.properties?.lastModifiedTime ? friendlyDate(response?.data?.properties?.lastModifiedTime) : null,
          // createdTime: response?.data?.properties?.createdTime ? friendlyDate(response?.data?.properties?.createdTime) : null,
        }

        setFlowDetails(newDetails)
      })
      .finally(() => setLoadingFlow(false))

  }

  useEffect(() => handleGetFlowDetails(), [])

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
        <div className="col-8">
          <Card className={styles.card_details}>
            <span className={styles.card_details_title}>Detalhes</span>
            <Divider />
            <div className="row">
              <div className="col-6">
                <Label>Fluxo</Label>
                <span>{props.selectedFlow['properties.displayName']}</span>
              </div>
              <div className="col-3">
                <Label>Modificado</Label>
                {/* <span>{selFlow?.lastModifiedTime}</span> */}
              </div>
            </div>
          </Card>

        </div>
        <div className="col-4">

        </div>
      </div>
    </div>
  )
}

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
        .finally(() => setLoading(prev => (false)))
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