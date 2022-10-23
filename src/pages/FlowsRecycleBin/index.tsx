import { Button } from '@fluentui/react-components';
import { Card } from '@fluentui/react-components/unstable';
import { DateTime } from 'luxon';
import { useEffect } from 'react'
import uuid from 'react-uuid';
import { IAlert, IEnvironment, IHandleAlerts, IToken } from '../../interfaces'
// import { GetDeletedFlows } from '../../services/requests';

interface Props {
  selectedEnvironment: IEnvironment;
  token: IToken['text'];
  handleAlerts: IHandleAlerts;
}

export default function FlowsRecycleBin({ handleAlerts }: Props) {
  // const [deletedFlows, setDeletedFlows] = useState<any[]>();

  const handleForceAlert = (intent: IAlert['intent']) => {
    handleAlerts({ add: { message: `Ainda não implementado 😢 - ${uuid()} Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, aliquid modi! Minus sed vitae voluptates deserunt eligendi placeat! Quae possimus optio exercitationem accusamus recusandae similique eligendi! Saepe obcaecati molestiae est. Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, aliquid modi! Minus sed vitae voluptates deserunt eligendi placeat! Quae possimus optio exercitationem accusamus recusandae similique eligendi! Saepe obcaecati molestiae est. Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, aliquid modi! Minus sed vitae voluptates deserunt eligendi placeat! Quae possimus optio exercitationem accusamus recusandae similique eligendi! Saepe obcaecati molestiae est. Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, aliquid modi! Minus sed vitae voluptates deserunt eligendi placeat! Quae possimus optio exercitationem accusamus recusandae similique eligendi! Saepe obcaecati molestiae est. Lorem ipsum dolor sit amet consectetur adipisicing elit. Cumque, aliquid modi! Minus sed vitae voluptates deserunt eligendi placeat! Quae possimus optio exercitationem accusamus recusandae similique eligendi! Saepe obcaecati molestiae est. `, intent, createdDateTime: DateTime.now() } })

  }


  useEffect(() => {
    handleAlerts({ add: { message: "Ainda não implementado 😢 - Resta descobrir a requisição correta para obter os fluxos excluídos.", intent: 'info', createdDateTime: DateTime.now() } })
    // GetDeletedFlows(token, selectedEnvironment.name)
    //   .then(resp => { })
    //   .catch(e => { })
    return
  }, [])

  return (
    <div className='px-4'>
      <Card
        style={{ backgroundColor: '#333' }}
        className='d-flex flex-row align-items-center justify-content-center'
      >
        Ainda não implementado 😢
        Resta descobrir a requisição correta para obter os fluxos excluídos.
        <Button onClick={() => handleForceAlert('info')}>
          Info Alert
        </Button>
        <Button onClick={() => handleForceAlert('error')}>
          error Alert
        </Button>
        <Button onClick={() => handleForceAlert('success')}>
          success Alert
        </Button>
        <Button onClick={() => handleForceAlert('warning')}>
          warning Alert
        </Button>
      </Card>
    </div>
  )
}
