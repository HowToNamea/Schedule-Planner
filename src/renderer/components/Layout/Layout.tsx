import { type ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import styles from './Layout.module.css'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
