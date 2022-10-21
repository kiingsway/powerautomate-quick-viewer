import React, { useEffect, useState } from 'react'
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

  const [updateRuns, setUpdateRuns] = useState(false);
  const handleUpdateRuns = () => setUpdateRuns(prev => !prev)

  const flowTriggerName = Object.keys(selectedFlow.properties.definition.triggers)[0];

  console.log(selectedFlow)

  const flow: IFlowDetailsSummary = {
    name: selectedFlow.name,
    displayName: selectedFlow.properties.displayName,
    description: selectedFlow.properties.definition.description,
    definition: selectedFlow.properties.definition,
    state: selectedFlow.properties.state,
    envName: selectedFlow.properties.environment.name,
    lastModifiedTime: selectedFlow.properties.lastModifiedTime,
    createdTime: selectedFlow.properties.createdTime,
    flowFailureAlertSubscribed: selectedFlow.properties.flowFailureAlertSubscribed,
    flowSuspensionReason: selectedFlow.properties.flowSuspensionReason,
    flowSuspensionTime: selectedFlow.properties?.flowSuspensionTime,
    trigger: {
      uri: selectedFlow.properties.flowTriggerUri,
      name: flowTriggerName,
      summary: selectedFlow.properties.definitionSummary.triggers[0],
      conditions: selectedFlow.properties.definition.triggers?.[flowTriggerName]?.conditions?.map((c: any) => c.expression),
    },
    actions: {
      summary: selectedFlow.properties.definitionSummary.actions.map(a => a.swaggerOperationId ? a.swaggerOperationId : a.type),
      value: selectedFlow.properties.definition.actions,
    },
    connections: {
      names: Object.keys(selectedFlow.properties.connectionReferences),
      references: selectedFlow.properties.connectionReferences,
    }

  }

  const urlFlowInitial = `https://make.powerautomate.com/environments/${flow.envName}/flows/${flow.name}`

  const urlFlow = {
    edit: `${urlFlowInitial}`,
    details: `${urlFlowInitial}/details`,
    owners: `${urlFlowInitial}/owners`,
    export: `${urlFlowInitial}/export`,
    runs: `${urlFlowInitial}/runs`,
  }

  return (
    <div
      className={classNames('py-0 px-3 row', styles.FadeIn)}
      style={{ rowGap: 20 }}>

      <div className="col-12">
        <FlowToolbar
          flow={flow}
          token={token}
          handleAlerts={handleAlerts}
          handleSetFlow={handleSetFlow}
          handleUpdateFlowsList={handleUpdateFlowsList}
          handleUpdateRuns={handleUpdateRuns}
        />
      </div>

      <div className='col-8'>
        <DetailsCard flow={flow} />
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