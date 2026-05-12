import { useMemo } from 'react'
import { useTaskStore } from '../../store/taskStore'
import DateGroup from './DateGroup'
import styles from './ListView.module.css'

export default function ListView() {
  const { tasks } = useTaskStore()

  const grouped = useMemo(() => {
    const map = new Map<string, typeof tasks>()
    for (const task of tasks) {
      const list = map.get(task.date) || []
      list.push(task)
      map.set(task.date, list)
    }
    const sorted = [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
    return sorted.map(([date, items]) => ({
      date,
      tasks: items.sort((a, b) => {
        if (a.is_all_day && !b.is_all_day) return -1
        if (!a.is_all_day && b.is_all_day) return 1
        return (a.start_time || '').localeCompare(b.start_time || '')
      })
    }))
  }, [tasks])

  if (grouped.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <div className={styles.emptyTitle}>还没有日程</div>
        <div className={styles.emptyDesc}>点击 "+ 新建任务" 开始规划你的日程吧</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {grouped.map((g) => (
        <DateGroup key={g.date} date={g.date} tasks={g.tasks} />
      ))}
    </div>
  )
}
