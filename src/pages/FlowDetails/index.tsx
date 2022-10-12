import { Button, Divider, Label, Link, Title2, Title3 } from '@fluentui/react-components';
import { Alert, Card } from '@fluentui/react-components/unstable';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react'
import { IoMdClose } from 'react-icons/io';
import uuid from 'react-uuid';
import { GetFlow } from '../../services/requests';
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

  const handleErrors = (e: any) => {
    const alert: IAlert = { intent: 'error', message: JSON.stringify(e), id: uuid() };
    setAlert(prev => prev?.length ? ([alert, ...prev]) : [alert])
    console.error(e);
  }

  const handleGetFlowDetails = () => {
    console.log(props.selectedFlow)
    GetFlow(props.token, props.selectedFlow['properties.environment.name'], props.selectedFlow.name)
      .catch(handleErrors)
      .then(response => {
        setFlowDetails(response?.data)
      })

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

  const Breadcrumb = () => (
    <ul className={styles.breadcrumb}>
      <li>
        <Link
          onClick={() => props.selectFlow(null)}
          appearance="default">
          Fluxos
        </Link>
      </li>
      <li>
        <Link
          className={styles.breadcrumb_selected}
          appearance="subtle">
          <span className={styles.breadcrumb_selected}>{props.selectedFlow['properties.displayName']}</span>

        </Link>
      </li>
    </ul>
  )

  return (
    <div>
      <Breadcrumb />

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