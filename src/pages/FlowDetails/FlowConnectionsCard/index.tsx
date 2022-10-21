import { useEffect, useState } from 'react'
import { GetFlowConnections } from '../../../services/requests';
import { IFlowConnection, IFlowDetailsSummary } from '../interfaces';
import { Card } from '@fluentui/react-components/unstable';
import { Avatar, Button, Divider, Spinner } from '@fluentui/react-components';
import styles from '../FlowDetails.module.scss'
import { BsArrowClockwise } from 'react-icons/bs';
import classNames from 'classnames';
import { IHandleAlerts } from '../../../interfaces';
import { DateTime } from 'luxon';

interface Props {
  flow: IFlowDetailsSummary;
  token: string;
  handleAlerts: IHandleAlerts;
}

export default function FlowConnectionsCard({ flow, token, handleAlerts }: Props) {

  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<IFlowConnection[]>();

  const handleGetFlowConnections = () => {
    setLoading(true);

    GetFlowConnections(token, flow.envName, flow.name)
      .then(resp => setConnections(resp.data))
      .catch(e => handleAlerts({ add: { message: e, intent: 'error', createdDateTime: DateTime.now() } }))
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
      <div className={classNames('row', styles.DetailsCard_Body)}>
        <div className={classNames("row", styles.Connections, styles.BlueScroll)}>
          {connections && !connections.length ?
            <div className='d-flex flex-column align-items-center'>Não há conexões para este fluxo.</div> : null}
          {connections?.map(conn => {

            return (
              <div className="col-6" key={conn.name}>
                <Connection conn={conn} />
              </div>
            )

          })}
        </div>
      </div>
    </Card>
  )
}

const Connection = ({ conn }: { conn: IFlowConnection }) => {

  type TStatus = 'Connected' | string;
  type presences = 'available' | 'away' | 'busy' | 'do-not-disturb' | 'offline' | 'out-of-office' | 'unknown';
  const status: TStatus = conn.properties.statuses.map(s => s.status).join(' ');
  const statusPresence: presences = status === 'Connected' ? 'available' : 'busy'

  return (
    <div className={styles.Connections_Item}>
      <div className={styles.Connections_Item_Icon}>

        <Avatar
          shape="square"
          size={36}
          name={conn.properties.displayName}
          image={{ src: conn.properties.iconUri }}
          badge={{ status: statusPresence }}
        />

        <img
          className='d-none'
          src={conn.properties.iconUri}
          alt={conn.properties.displayName} />

      </div>
      <div className={styles.Connections_Item_Content}>
        <div className={styles.Connections_Item_Content_Title}>
          <span>

            {conn.properties.displayName}

          </span>
        </div>
        <div className={styles.Connections_Item_Content_Subtitle}>
          <span>
            {conn.properties.createdBy.displayName}
          </span>
          <span>
            {status}
          </span>
        </div>
      </div>
    </div>
  )
}
