import { Divider, Label, PresenceBadge } from '@fluentui/react-components';
import { Card } from '@fluentui/react-components/unstable';
import classNames from 'classnames';
import React from 'react'
import { DivCol } from '..';
import { IFlowDetailsSummary } from '../interfaces';
import styles from '../FlowDetails.module.scss'
import { FriendlyDate } from '../../../App';
import { DateTime } from 'luxon';

interface Props {
  flow: IFlowDetailsSummary;
}

export default function DetailsCard({ flow }: Props) {

  return (
    <Card className={styles.DetailsCard}>
      <span className={styles.DetailsCard_Title}>Detalhes</span>
      <Divider />

      <div className="row">

        <DivCol size={12} sm={8} xxl={9} className='d-flex flex-column' style={{ rowGap: 10 }}>
          <FlowTitle flow={flow} />
          <FlowDesc flow={flow} />
          <FlowTrigger flow={flow} />
          <FlowTriggerCond flow={flow} />
          <FlowActionsSumm flow={flow} />
        </DivCol>

        <DivCol size={12} sm={4} xxl={3} className='d-flex flex-column' style={{ rowGap: 10 }}>
          <FlowStatus flow={flow} />
          <FlowModified flow={flow} />
          <FlowCreated flow={flow} />
          <FlowSuspensionReason flow={flow} />
          <FlowFailureAlertSubscribed flow={flow} />
        </DivCol>

      </div>
    </Card>
  )
}

const FlowTitle = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label>Fluxo</Label>
    <span className={styles.DetailsCard_TextValue}>{flow.displayName}</span>
  </div>
)

const FlowDesc = ({ flow }: { flow: IFlowDetailsSummary }) => {
  if (!flow?.description) return null
  return (
    <div>
      <Label>Descrição</Label>
      <span className={styles.DetailsCard_TextValue}>{flow.description}</span>
    </div>
  )
}

const FlowTrigger = ({ flow }: { flow: IFlowDetailsSummary }) => {
  return <div>
    <Label>Gatilho</Label>
    <span className={styles.DetailsCard_TextValue}>Trigger...</span>
  </div>

  /*const trigger: any = null;

  if (flow.trigger.summary.type === 'Request')
    if (flow.trigger.summary.kind === 'Button')
      return <span>Botão</span>

  if (flow.trigger.summary.type === "OpenApiConnection") {
    const tg = trigger[Object.keys(trigger)[0]];
    const site = tg?.inputs.parameters.dataset || 'perai...';
    const table = tg?.inputs.parameters.table || 'perai...';
    const recurrence = tg?.recurrence ? (tg?.recurrence.interval + ' ' + tg?.recurrence.frequency) : 'perai...'

    if (flow.trigger.summary?.swaggerOperationId === "GetOnNewItems") {
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
    if (flow.trigger.summary?.swaggerOperationId === "GetOnUpdatedItems") {
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
    type: flow.trigger.summary.type ? flow.trigger.summary.type : '',
    kind: flow.trigger.summary.kind ? flow.trigger.summary.kind : '',
    swaggerOperationId: flow.trigger.summary?.swaggerOperationId ? flow.trigger.summary?.swaggerOperationId : '',
  }

  let txt: string = txts?.type;
  txt = txts.kind.length ? `${txt} - ${txts?.kind}` : txt;
  txt = txts.swaggerOperationId.length ? `${txt} - ${txts?.swaggerOperationId}` : txt;

  return (
    <div>
      <Label>Gatilho</Label>
      {txt}
    </div>
  )*/
}

const FlowTriggerCond = ({ flow }: { flow: IFlowDetailsSummary }) => {
  if (!flow.trigger?.conditions) return null
  return (
    <div>
      <Label>Condição do gatilho</Label>
      {flow.trigger.conditions.map(cond => (
        <span className={styles.DetailsCard_TextValue} key={cond}>{cond}</span>
      ))}
    </div>
  )
}

const FlowActionsSumm = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label>Resumo das ações</Label>
    <span className={styles.DetailsCard_TextValue}>
      {flow.actions.summary.join(', ')}
    </span>
  </div>
)

const FlowStatus = ({ flow }: { flow: IFlowDetailsSummary }) => {
  return (
    <div>
      <Label>Status</Label>
      <span className={styles.DetailsCard_TextValue}>
        <PresenceBadge outOfOffice status={flow.state === 'Started' ? 'available' : (flow.state === 'Suspended' ? 'away' : 'offline')} />
        {flow.state === 'Started' ? 'Ativado' : (flow.state === 'Suspended' ? 'Suspenso' : 'Parado')}
      </span>
    </div>
  )
}

const FlowModified = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label>Modificado</Label>
    <span className={styles.DetailsCard_TextValue}>
      <FriendlyDate date={DateTime.fromISO(flow.lastModifiedTime)} />
    </span>
  </div>
)

const FlowCreated = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label>Criado</Label>
    <span className={styles.DetailsCard_TextValue}>
      <FriendlyDate date={DateTime.fromISO(flow.createdTime)} />
    </span>
  </div>
)

const FlowSuspensionReason = ({ flow }: { flow: IFlowDetailsSummary }) => {
  if (!flow?.flowSuspensionReason || flow.state !== 'Suspended') return null
  return (
    <div>
      <Label>Razão da Suspensão</Label>
      <span className={styles.DetailsCard_TextValue}>
        {flow.flowSuspensionReason}
      </span>
    </div>
  )
}

const FlowFailureAlertSubscribed = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label>Receber alertas de falhas do fluxo</Label>
    <span className={styles.DetailsCard_TextValue}>
      {flow.flowFailureAlertSubscribed ? 'Sim' : 'Não'}
    </span>
  </div>
)