import { Divider, Label, PresenceBadge } from '@fluentui/react-components';
import { Card } from '@fluentui/react-components/unstable';
import { DivCol } from '..';
import { IFlowDetailsSummary } from '../interfaces';
import styles from '../FlowDetails.module.scss'
import { FriendlyDate } from '../../../App';
import { DateTime } from 'luxon';
import classNames from 'classnames';

interface Props {
  flow: IFlowDetailsSummary;
}

export default function DetailsCard({ flow }: Props) {

  return (

    <Card className={styles.FlowInfoCard}>
      <div className={styles.FlowInfoCard_Header}>
        <span className={styles.FlowInfoCard_Header_Title}>Detalhes</span>
      </div>
      <Divider className={styles.FlowInfoCard_Header_Divider} />
      <div className={styles.FlowInfoCard_Body}>

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

      </div>
    </Card>
  )

}

const FlowTitle = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label className={styles.FlowInfoCard_Body_Details_Label}>Fluxo</Label>
    <span
      className={classNames(
        styles.FlowInfoCard_Body_Details_Text,
        styles.BlueScroll)}>
      {flow.displayName}
    </span>
  </div>
)

const FlowDesc = ({ flow }: { flow: IFlowDetailsSummary }) => {
  if (!flow?.description) return null
  return (
    <div>
      <Label className={styles.FlowInfoCard_Body_Details_Label}>Descrição</Label>
      <span
        className={classNames(
          styles.FlowInfoCard_Body_Details_Text,
          styles.BlueScroll)}>

        {flow.description}
      </span>
    </div>
  )
}

const FlowTrigger = ({ flow }: { flow: IFlowDetailsSummary }) => {

  const trigger = flow.definition.triggers[flow.trigger.name];
  const kind = flow.trigger.summary?.kind;
  const type = flow.trigger.summary?.type;
  const swop = flow.trigger.summary?.swaggerOperationId;

  const getTrigger = () => {


    if (type === 'Recurrence') {
      const recurrence = trigger.recurrence ? (trigger.recurrence.interval + ' ' + trigger.recurrence.frequency) : '-'
      const weekDays = trigger.recurrence.schedule?.weekDays?.join(', ')
      const hours = trigger.recurrence.schedule?.hours?.join(', ')
      const minutes = trigger.recurrence.schedule?.minutes?.join(', ')
      const startTime = trigger.recurrence.startTime
      const timeZone = trigger.recurrence.timeZone
      return (
        <span>
          Recorrência:
          <br />
          Frequência: {recurrence}
          <br />
          Início: <FriendlyDate date={DateTime.fromISO(startTime)} /> - {timeZone}
          <br />
          {weekDays ? `Dias da semana: ${weekDays}` : null}
          <br />
          {hours ? `Horas: ${hours}` : null}
          <br />
          {minutes ? `Minutos: ${minutes}` : null}
        </span>
      )
    }
    if (type === 'Request') {
      if (kind === 'Button') return <span>Botão</span>;
    }

    if (type === 'ApiConnection') {
      const path = flow.definition.triggers[flow.trigger.name].inputs.path;
      const recurrence = trigger.recurrence ? (trigger.recurrence.interval + ' ' + trigger.recurrence.frequency) : '-'

      if (swop === 'GetOnNewItems')
        return (
          <span>
            Item criado em lista
            <br />
            Path: {path}
            <br />
            Recorrência: {recurrence}
          </span>
        )
    }

    if (type === "OpenApiConnection") {
      const site = trigger.inputs.parameters.dataset || '-';
      const table = trigger.inputs.parameters.table || '-';
      const recurrence = trigger.recurrence ? (trigger.recurrence.interval + ' ' + trigger.recurrence.frequency) : '-'

      if (swop === "GetOnNewItems") {
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
      if (swop === "GetOnUpdatedFileItems") {
        return (
          <span>
            Quando um arquivo é criado ou modificado (somente propriedades)
            <br />
            Site: {site}
            <br />
            Lista: {table}
            <br />
            Recorrência: {recurrence}
          </span>
        )
      }
      if (swop === "GetOnUpdatedItems") {
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

    console.log(flow);

    return null;
  }

  const txts = {
    type: type ? type : '',
    kind: kind ? kind : '',
    swaggerOperationId: swop ? swop : '',
  }

  let txt: string = txts?.type;
  txt = txts.kind.length ? `${txt} - ${txts.kind}` : txt;
  txt = txts.swaggerOperationId.length ? `${txt} - ${txts.swaggerOperationId}` : txt;

  return <div>
    <Label className={styles.FlowInfoCard_Body_Details_Label}>Gatilho</Label>
    <span
      className={classNames(
        styles.FlowInfoCard_Body_Details_Text,
        styles.BlueScroll)}>
      {getTrigger() ? getTrigger() : txt}
    </span>
  </div>
}

const FlowTriggerCond = ({ flow }: { flow: IFlowDetailsSummary }) => {
  if (!flow.trigger?.conditions) return null
  return (
    <div>
      <Label className={styles.FlowInfoCard_Body_Details_Label}>Condição do gatilho</Label>
      {flow.trigger.conditions.map(cond => (
        <span
          key={cond}
          className={classNames(
            styles.FlowInfoCard_Body_Details_Text,
            styles.BlueScroll)}>
          {cond}
        </span>
      ))}
    </div>
  )
}

const FlowActionsSumm = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label className={styles.FlowInfoCard_Body_Details_Label}>Resumo das ações</Label>
    <span
      className={classNames(
        styles.FlowInfoCard_Body_Details_Text,
        styles.BlueScroll)}>
      {flow.actions.summary.join(', ')}
    </span>
  </div>
)

const FlowStatus = ({ flow }: { flow: IFlowDetailsSummary }) => {
  const isStarted = flow.state === 'Started';
  const isSuspended = flow.state === 'Suspended';
  const isStopped = flow.state === 'Stopped';
  return (
    <div>
      <Label className={styles.FlowInfoCard_Body_Details_Label}>Status</Label>
      <span
        className={classNames(
          styles.FlowInfoCard_Body_Details_Text,
          styles.BlueScroll)}>
        <PresenceBadge outOfOffice status={isStarted ? 'available' : (isSuspended ? 'away' : 'offline')} />
        {isStarted ? 'Ativado' : (isSuspended ? 'Suspenso' : 'Parado')}
        {isSuspended && flow?.flowSuspensionTime ?
          <> desde <FriendlyDate date={DateTime.fromISO(flow.flowSuspensionTime)} /></>
          : null
        }
      </span>
    </div>
  )
}

const FlowModified = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label className={styles.FlowInfoCard_Body_Details_Label}>Modificado</Label>
    <span
      className={classNames(
        styles.FlowInfoCard_Body_Details_Text,
        styles.BlueScroll)}>
      <FriendlyDate date={DateTime.fromISO(flow.lastModifiedTime)} />
    </span>
  </div>
)

const FlowCreated = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label className={styles.FlowInfoCard_Body_Details_Label}>Criado</Label>
    <span
      className={classNames(
        styles.FlowInfoCard_Body_Details_Text,
        styles.BlueScroll)}>
      <FriendlyDate date={DateTime.fromISO(flow.createdTime)} />
    </span>
  </div>
)

const FlowSuspensionReason = ({ flow }: { flow: IFlowDetailsSummary }) => {
  if (!flow?.flowSuspensionReason || flow.state !== 'Suspended') return null
  return (
    <div>
      <Label className={styles.FlowInfoCard_Body_Details_Label}>Razão da Suspensão</Label>
      <span className={styles.DetailsCard_TextValue}>
        {flow.flowSuspensionReason}
      </span>
    </div>
  )
}

const FlowFailureAlertSubscribed = ({ flow }: { flow: IFlowDetailsSummary }) => (
  <div>
    <Label className={styles.FlowInfoCard_Body_Details_Label}>Receber alertas de falhas do fluxo</Label>
    <span
      className={classNames(
        styles.FlowInfoCard_Body_Details_Text,
        styles.BlueScroll)}>
      {flow.flowFailureAlertSubscribed ? 'Sim' : 'Não'}
    </span>
  </div>
)