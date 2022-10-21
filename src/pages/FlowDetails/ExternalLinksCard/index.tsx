import { IFlowDetailsSummary } from '../interfaces';
import { Card } from '@fluentui/react-components/unstable';
import { Button, Divider } from '@fluentui/react-components';
import styles from '../FlowDetails.module.scss'
import { BsPeople } from 'react-icons/bs';
import { BiDetail, BiHistory } from 'react-icons/bi';
import { HiOutlinePencilAlt } from 'react-icons/hi';
import { VscExport } from 'react-icons/vsc';

interface Props {
  flow: IFlowDetailsSummary;
}

export default function ExternalLinksCard({ flow }: Props) {

  const initialUrl = `https://make.powerautomate.com/environments/${flow.envName}/flows/${flow.name}`;

  const urlFlow = {
    details: `${initialUrl}/details`,
    edit: initialUrl,
    owners: `${initialUrl}/owners`,
    export: `${initialUrl}/export`,
    runs: `${initialUrl}/runs`
  }

  return (
    <Card className={styles.DetailsCard}>
      <div className={styles.DetailsCard_Header}>
        <span className={styles.DetailsCard_Header_Title}>Links para o Power Automate</span>
      </div>
      <Divider className={styles.DetailsCard_Header_Divider} />
      <div className={styles.DetailsCard_Body}>

        <Button as='a' href={urlFlow.details} target='__blank'
          className={styles.DetailsCard_Body_Links} icon={<BiDetail />}>
          Detalhes do fluxo
        </Button>

        <Button as='a' href={urlFlow.edit} target='__blank'
          className={styles.DetailsCard_Body_Links} icon={<HiOutlinePencilAlt />}>
          Edição do fluxo
        </Button>

        <Button as='a' href={urlFlow.owners} target='__blank'
          className={styles.DetailsCard_Body_Links} icon={<BsPeople />}>
          Proprietários do fluxo
        </Button>

        <Button as='a' href={urlFlow.export} target='__blank'
          className={styles.DetailsCard_Body_Links} icon={<VscExport />}>
          Exportar fluxo
        </Button>

        <Button as='a' href={urlFlow.runs} target='__blank'
          className={styles.DetailsCard_Body_Links} icon={<BiHistory />}>
          Execuções do fluxo
        </Button>

      </div>
    </Card>
  )
}
