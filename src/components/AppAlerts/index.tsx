import React from 'react'
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { BiInfoCircle } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { BsCheckCircle } from 'react-icons/bs';
import { TbAlertTriangle } from 'react-icons/tb';
import { IAlert, IHandleAlerts } from '../../interfaces';
import styles from './AppAlerts.module.scss'
import classNames from 'classnames';
import { Button } from '@fluentui/react-components';
import { VscCloseAll } from 'react-icons/vsc';
import { GiCancel } from 'react-icons/gi';

interface Props {
  alerts: IAlert[];
  handleAlerts: IHandleAlerts;
}

export default function AppAlerts({ alerts, handleAlerts }: Props) {

  if (!alerts.length) return null

  return (
    <div className={classNames(styles.Alerts, styles.BlueScroll)}>

      {alerts.length > 1 ?
        <div className={styles.Alerts_Header}>
          <Button
            onClick={() => handleAlerts({ removeAll: true })}
            appearance='outline'
            size='small'
            className={styles.Alerts_CloseAll}
            icon={<VscCloseAll />}>
            Fechar {alerts.length} alertas
          </Button>

        </div> : null}

      <div className={styles.Alerts_Container}>
        {alerts.map(alert => {

          const bgColors: Record<IAlert['intent'], React.CSSProperties['backgroundColor']> = {
            success: '#7AA56F',
            warning: '#332B00',
            error: '#290000',
            info: '#454545',
          }

          return (
            <div
              key={alert.id}
              className={styles.Alerts_Item}
              style={{ backgroundColor: bgColors[alert.intent] }}>
              <div className='d-flex flex-row align-items-center justify-content-start' style={{ gap: 8 }}>
                <IntentIcon intent={alert.intent} />
                <span className={styles.Alerts_Item_Time}>
                  {alert.createdDateTime.toFormat('HH:mm:ss.S')}
                </span>
                <span className={styles.Alerts_Item_Message}>
                  {alert.message}
                </span>
              </div>
              <div
                onClick={() => handleAlerts({ remove: alert.id })}
                className={classNames(styles.Alerts_Item_Close)}>
                <IoMdClose />
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}

const IntentIcon = ({ intent }: { intent: IAlert['intent'] }) => {
  if (intent === 'success')
    return <BsCheckCircle className='flex-shrink-0' style={{ fontSize: 16 }} />

  if (intent === 'info')
    return <BiInfoCircle className='flex-shrink-0' style={{ fontSize: 16 }} />

  if (intent === 'warning')
    return <TbAlertTriangle className='flex-shrink-0' style={{ fontSize: 16 }} />

  if (intent === 'error')
    return <GiCancel className='flex-shrink-0' style={{ fontSize: 16 }} />

  return <AiOutlineQuestionCircle />
}