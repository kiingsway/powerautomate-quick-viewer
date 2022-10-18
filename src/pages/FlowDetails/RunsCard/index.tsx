import React from 'react'
import { IHandleAlerts } from '../../Login/interfaces';
import { IFlowDetailsSummary } from '../interfaces';

interface Props {
  flow: IFlowDetailsSummary;
  token: string;
  handleAlerts: IHandleAlerts;
}

export default function RunsCard({ flow, token, handleAlerts }: Props) {
  return (
    <div>RunsCard</div>
  )
}
