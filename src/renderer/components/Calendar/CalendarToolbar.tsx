import type { ToolbarProps } from 'react-big-calendar'
import styles from './CalendarToolbar.module.css'

export default function CalendarToolbar({ date, label, onNavigate, onView, view }: ToolbarProps) {
  const currentYear = date.getFullYear()
  const yearRange = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i)

  const goYearBack = () => {
    const d = new Date(date)
    d.setFullYear(d.getFullYear() - 1)
    onNavigate('DATE', d)
  }

  const goYearForward = () => {
    const d = new Date(date)
    d.setFullYear(d.getFullYear() + 1)
    onNavigate('DATE', d)
  }

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10)
    const d = new Date(date)
    d.setFullYear(year)
    onNavigate('DATE', d)
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.nav}>
        <button className={styles.navBtn} onClick={() => onNavigate('TODAY')}>今天</button>
        <button className={styles.navBtn} onClick={goYearBack} title="上一年">«</button>
        <button className={styles.navBtn} onClick={() => onNavigate('PREV')}>‹</button>
        <select
          className={styles.yearSelect}
          value={currentYear}
          onChange={handleYearChange}
        >
          {yearRange.map((y) => (
            <option key={y} value={y}>{y} 年</option>
          ))}
        </select>
        <button className={styles.navBtn} onClick={() => onNavigate('NEXT')}>›</button>
        <button className={styles.navBtn} onClick={goYearForward} title="下一年">»</button>
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
