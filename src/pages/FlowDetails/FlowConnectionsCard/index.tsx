import React, { useEffect, useState } from 'react'
import { GetFlowConnections } from '../../../services/requests';
import { IHandleAlerts } from '../../Login/interfaces';
import { IFlowDetailsSummary } from '../interfaces';
import { Card } from '@fluentui/react-components/unstable';
import { Button, Divider, Spinner } from '@fluentui/react-components';
import styles from '../FlowDetails.module.scss'
import { BsArrowClockwise } from 'react-icons/bs';

interface Props {
  flow: IFlowDetailsSummary;
  token: string;
  handleAlerts: IHandleAlerts;
}

export default function FlowConnectionsCard({ flow, token, handleAlerts }: Props) {

  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>();

  useEffect(() => console.log(connections), [connections])

  const handleGetFlowConnections = () => {
    setLoading(true);

    GetFlowConnections(token, flow.envName, flow.name)
      .then(resp => setConnections(resp.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => handleGetFlowConnections(), [])

  return (
    <Card className={styles.DetailsCard}>
      <div className={styles.DetailsCard_Header}>
        <span className={styles.DetailsCard_Header_Title}>Conexões</span>
        <Button
          onClick={handleGetFlowConnections}
          size='small'
          disabled={loading}
          icon={loading ? <Spinner size='tiny' /> : <BsArrowClockwise />}
          appearance='subtle' />
      </div>
      <Divider className={styles.DetailsCard_Header_Divider} />
      <div className={styles.DetailsCard_Body}>
        {connections?.map(conn => (
          <span key={conn.name}>{conn.name}</span>
        ))}
      </div>
    </Card>
  )
}
