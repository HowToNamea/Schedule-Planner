import type { Task } from '../../types'
import TaskCard from './TaskCard'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import styles from './DateGroup.module.css'

interface Props {
  date: string
  tasks: Task[]
}

export default function DateGroup({ date, tasks }: Props) {
  const dateObj = parseISO(date)
  const dayName = format(dateObj, 'EEEE', { locale: zhCN })

  return (
    <div className={styles.group}>
      <div className={styles.header}>
        <span className={styles.date}>{date}</span>
        <span className={styles.dayName}>{dayName}</span>
        <span className={styles.count}>{tasks.length} 项</span>
      </div>
      <div className={styles.list}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
