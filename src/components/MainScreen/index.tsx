import { Avatar, Badge, Button } from '@fluentui/react-components'
import React from 'react'
import styles from './MainScreen.module.scss'
import { BiLogOut } from 'react-icons/bi'

interface Props {
  environments: any[];
  handleLogout: () => void
}

export default function MainScreen(props: Props) {

  return (
    <div className={styles.main}>

      <div className={styles.navbar}>
        <NavBar handleLogout={props.handleLogout} environmentsCount={props.environments.length} />
      </div>

      <div>
        <div>

        </div>
        <div>

        </div>
      </div>

    </div>
  )
}

const NavBar = (pr: { handleLogout: () => void; environmentsCount: number }) => {

  return (
    <div className={styles.navbar_content}>
      <Badge appearance="ghost" color="informative">
        {pr.environmentsCount} ambientes encontrados
      </Badge>
      <Avatar icon={<BiLogOut />} aria-label="Guest" size={40} className={styles.navbar_logout} onClick={pr.handleLogout} />
    </div>
  )
}

const SideMenu = () => {
  return (
    <div>SideMenu</div>
  )
}