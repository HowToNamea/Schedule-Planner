import { useTaskStore } from '../../store/taskStore'
import { useUIStore } from '../../store/uiStore'
import type { Task } from '../../types'
import styles from './TaskCard.module.css'

interface Props {
  task: Task
}

export default function TaskCard({ task }: Props) {
  const { toggleComplete, deleteTask } = useTaskStore()
  const { openTaskDetail, openTaskForm, showConfirm } = useUIStore()

  const handleToggle = () => toggleComplete(task.id)
  const handleDetail = () => openTaskDetail(task)
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    openTaskForm({ task })
  }
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    showConfirm('删除任务', `确定要删除任务「${task.title}」吗？`, () => deleteTask(task.id))
  }

  const timeStr = task.is_all_day
    ? '全天'
    : [task.start_time, task.end_time].filter(Boolean).join(' - ')

  return (
    <div className={`${styles.card} ${task.is_completed ? styles.completed : ''}`} onClick={handleDetail}>
      <button className={styles.circle} onClick={(e) => { e.stopPropagation(); handleToggle(); }}>
        {task.is_completed ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : null}
      </button>
      <div className={styles.content}>
        <div className={styles.title}>{task.title}</div>
        {timeStr && <div className={styles.time}>{timeStr}</div>}
        {task.description && <div className={styles.desc}>{task.description}</div>}
      </div>
      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={handleEdit} title="编辑">编辑</button>
        <button className={styles.deleteBtn} onClick={handleDelete} title="删除">删除</button>
      </div>
    </div>
  )
}
