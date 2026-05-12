import { useUIStore } from '../../store/uiStore'
import { format } from 'date-fns'
import styles from './Header.module.css'

export default function Header() {
  const { openTaskForm, openSettings } = useUIStore()

  const handleNewTask = () => openTaskForm({ date: format(new Date(), 'yyyy-MM-dd') })

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>日程规划</h1>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleNewTask}>+ 新建任务</button>
        <button className={styles.btnSecondary} onClick={openSettings}>设置</button>
      </div>
    </header>
  )
}
