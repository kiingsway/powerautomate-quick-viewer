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

export default function FlowDetails(props: Props) {

  const [selectedFlowDetails, setFlowDetails] = useState<any>();
  const [alerts, setAlert] = useState<IAlert[]>([]);
  const [loadingFlow, setLoadingFlow] = useState(false);

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
        setFlowDetails(response?.data)
      })
      .finally(() => setLoadingFlow(false))

  }

  useEffect(() => handleGetFlowDetails(), [])

  const selFlow = selectedFlowDetails ? {
    name: selectedFlowDetails?.name,
    displayName: selectedFlowDetails?.properties.displayName,
    state: selectedFlowDetails?.properties.state,
    trigger: selectedFlowDetails?.properties.definitionSummary.triggers[0],
    actions: selectedFlowDetails?.properties.definitionSummary.actions,
    triggerName: selectedFlowDetails?.properties?.definition ? Object.keys(selectedFlowDetails?.properties.definition.triggers)[0] : null,
    envName: selectedFlowDetails?.properties.environment.name,
    uriTrigger: selectedFlowDetails?.properties?.flowTriggerUri,
    connectionReferences: Object.keys(selectedFlowDetails?.properties.connectionReferences ?? {}) as any[],
    // lastModifiedTime: selectedFlowDetails?.properties?.lastModifiedTime ? friendlyDate(selectedFlowDetails?.properties?.lastModifiedTime) : null,
    // createdTime: selectedFlowDetails?.properties?.createdTime ? friendlyDate(selectedFlowDetails?.properties?.createdTime) : null,
  } : null

  console.log(selFlow)

  return (
    <div className={classNames('py-0', 'px-3', styles.FadeIn)}>

      <FlowToolbar
        token={props.token}
        loadingFlow={loadingFlow}
        selFlow={selFlow}
      />

      {alerts.map(alert => (
        <Alert
          key={alert.id}
          intent={alert.intent}
          className={classNames('mb-2', styles.alerts)}
          action={
            <span
              onClick={() => setAlert(prev => prev.filter(a => a.id !== alert.id))}>
              Fechar <IoMdClose />
            </span>
          }>
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
  selFlow: {
    name: any;
    displayName: any;
    state: any;
    trigger: any;
    actions: any;
    triggerName: string | null;
    envName: any;
    uriTrigger: any;
    connectionReferences: any[];
  } | null;
  loadingFlow: boolean;
}

const FlowToolbar = (props: FlowToolbarProps) => {

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[]>([])

  const handleErrors = () => {

  }

  const RunModal = () => {

    if (props?.selFlow?.uriTrigger) return null

    const handleRunFlow = () => {

      setLoading(true)

      if (!props?.selFlow?.triggerName || !props?.selFlow?.uriTrigger) {
        console.error('Propriedade não encontrada...');
        return;
      }

      RunFlow(props.token, props.selFlow.uriTrigger)
        .catch(handleErrors)
        .then(() => {
          setErrors(prev => ([{ id: uuid(), msg: `Fluxo "${props?.selFlow?.displayName}" executado`, intent: 'success' }, ...prev]))
        })
        .finally(() => setLoading(prev => (false)))
    }

    return (
      <Dialog modalType="alert">
        <DialogTrigger>
          <ToolbarButton className={classNames({ ['details-info-links-warning']: props?.selFlow?.state !== 'Started' })}>
            {
              loading ?
                <><SiSpinrilla className={classNames('details-info-links-icon', styles.spin)} /> Executando...</>
                : <><BsFillPlayFill className={classNames('details-info-links-icon', { ['details-info-links-warning']: props?.selFlow?.state !== 'Started' })} />Executar</>
            }
          </ToolbarButton>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Conexões do fluxo</DialogTitle>
            <DialogContent>
              <div className='connections'>
                {!props?.selFlow?.connectionReferences?.length && 'Não há conexões para este fluxo.'}
                {props?.selFlow?.connectionReferences.map(connection => {
                  const conn = props?.selFlow?.connectionReferences?.[connection];
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

  return (
    <Toolbar className='mb-2'>
      {
        props.selFlow?.uriTrigger ?
          <Tooltip content='Executar fluxo' relationship="label" showDelay={100}>
            <ToolbarButton>
              Executar
            </ToolbarButton>
          </Tooltip> : null
      }
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