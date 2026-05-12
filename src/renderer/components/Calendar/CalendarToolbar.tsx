import type { ToolbarProps } from 'react-big-calendar'
import styles from './CalendarToolbar.module.css'

export default function CalendarToolbar({ label, onNavigate, onView, view }: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={() => onNavigate('TODAY')}>今天</button>
        <button className={styles.navBtn} onClick={() => onNavigate('PREV')}>lt</button>
        <button className={styles.navBtn} onClick={() => onNavigate('NEXT')}>gt</button>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.views}>
        {(['month', 'week', 'day'] as const).map((v) => (
          <button
            key={v}
            className={`${styles.viewBtn} ${view === v ? styles.active : ''}`}
            onClick={() => onView(v)}
          >
            {v === 'month' ? '月' : v === 'week' ? '周' : '日'}
          </button>
        ))}
      </div>
    </div>
  )
}
