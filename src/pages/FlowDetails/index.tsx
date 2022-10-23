import React, { useState } from 'react'
import styles from './FlowDetails.module.scss'
import DetailsCard from './DetailsCard';
import FlowToolbar from './FlowToolbar';

import { IHandleAlerts, IToken } from '../../interfaces';
import { IFlowDetailsSummary } from './interfaces';
import { IFlow, IHandleSetFlow, IHandleUpdateFlowsList } from '../FlowsViewer/interfaces';

import classNames from 'classnames';
import ExternalLinksCard from './ExternalLinksCard';
import HistoriesCard from './HistoriesCard';
import RunsCard from './RunsCard';
import FlowConnectionsCard from './FlowConnectionsCard';


interface Props {
  token: IToken['text'];
  selectedFlow: IFlow;
  handleAlerts: IHandleAlerts;
  handleSetFlow: IHandleSetFlow;
  handleUpdateFlowsList: IHandleUpdateFlowsList
}

export default function FlowDetails({ token, selectedFlow, handleAlerts, handleSetFlow, handleUpdateFlowsList }: Props) {

  // const [flow, setFlow] = useState<IFlowDetailsSummary>(summarizeFlow(selectedFlow))
  const [updateRuns, setUpdateRuns] = useState(false);

  const flow: IFlowDetailsSummary = summarizeFlow(selectedFlow); 
  

  const handleUpdateRuns = () => setUpdateRuns(prev => !prev)

  return (
    <div
      className={classNames('py-0 px-3 row', styles.FadeIn)}
      style={{ rowGap: 20 }}>

      <div className="col-12 d-flex flex-row align-items-center justify-content-start">
        <FlowToolbar
          flow={flow}
          token={token}
          handleAlerts={handleAlerts}
          handleSetFlow={handleSetFlow}
          handleUpdateFlowsList={handleUpdateFlowsList}
          handleUpdateRuns={handleUpdateRuns} />
      </div>

      <div className='col-8'>
        <DetailsCard handleSetFlow={handleSetFlow} flow={flow} />
      </div>

      <div className='col-4 row' style={{ rowGap: 20 }}>
        <div className="col-12">
          <FlowConnectionsCard
            flow={flow}
            token={token}
            handleAlerts={handleAlerts} />
        </div>

        <div className="col-12">
          <ExternalLinksCard flow={flow} />
        </div>
      </div>

      <div className="col-8">
        <RunsCard
          flow={flow}
          token={token}
          updateRuns={updateRuns}
          handleAlerts={handleAlerts}
          handleUpdateRuns={handleUpdateRuns} />
      </div>

      <div className="col-4">
        <HistoriesCard
          flow={flow}
          token={token}
          updateRuns={updateRuns}
          handleAlerts={handleAlerts}
          handleUpdateRuns={handleUpdateRuns} />
      </div>

    </div>
  )

}

function summarizeFlow(flow: IFlow) {

  const flowTriggerName = Object.keys(flow.properties.definition.triggers)[0];

  const flowSumm: IFlowDetailsSummary = {
    name: flow.name,
    displayName: flow.properties.displayName,
    description: flow.properties.definition.description,
    definition: flow.properties.definition,
    state: flow.properties.state,
    envName: flow.properties.environment.name,
    lastModifiedTime: flow.properties.lastModifiedTime,
    createdTime: flow.properties.createdTime,
    flowFailureAlertSubscribed: flow.properties.flowFailureAlertSubscribed,
    flowSuspensionReason: flow.properties.flowSuspensionReason,
    flowSuspensionTime: flow.properties?.flowSuspensionTime,
    trigger: {
      uri: flow.properties.flowTriggerUri,
      name: flowTriggerName,
      summary: flow.properties.definitionSummary.triggers[0],
      conditions: flow.properties.definition.triggers?.[flowTriggerName]?.conditions?.map((c: any) => c.expression),
    },
    actions: {
      summary: flow.properties.definitionSummary.actions.map(a => a.swaggerOperationId ? a.swaggerOperationId : a.type),
      value: flow.properties.definition.actions,
    },
    connections: {
      names: Object.keys(flow.properties.connectionReferences),
      references: flow.properties.connectionReferences,
    }
  }

  return flowSumm
}

interface IDivCol {
  children?: any;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  xxl?: number;
}

export const DivCol = ({ children, className, style, size, sm, md, lg, xl, xxl }: IDivCol) => (
  <div
    style={style}
    className={classNames(
      { [`col-${size}`]: size },
      { [`col-sm-${sm}`]: sm },
      { [`col-md-${md}`]: md },
      { [`col-lg-${lg}`]: lg },
      { [`col-xl-${xl}`]: xl },
      { [`col-xxl-${xxl}`]: xxl },
      className
    )
    }>
    {children}
  </div>
)