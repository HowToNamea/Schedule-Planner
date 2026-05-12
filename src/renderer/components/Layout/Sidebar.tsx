import { useState, useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import { useSettingsStore } from '../../store/settingsStore'
import { format, parseISO } from 'date-fns'
import type { Task } from '../../types'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const { settings, setViewMode } = useSettingsStore()
  const { tasks } = useTaskStore()
  const { openTaskForm } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Task[]>([])
  const [showResults, setShowResults] = useState(false)

  const upcomingTasks = tasks
    .filter((t) => !t.is_completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([])
      setShowResults(false)
      return
    }
    const timer = setTimeout(async () => {
      const results = await window.electronAPI.tasks.search(searchQuery.trim())
      setSearchResults(results)
      setShowResults(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <aside className={styles.sidebar}>
      {/* View toggle */}
      <div className={styles.viewToggle}>
        <button
          className={`${styles.toggleBtn} ${settings.view_mode === 'calendar' ? styles.active : ''}`}
          onClick={() => setViewMode('calendar')}
        >
          日历
        </button>
        <button
          className={`${styles.toggleBtn} ${settings.view_mode === 'list' ? styles.active : ''}`}
          onClick={() => setViewMode('list')}
        >
          列表
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="搜索任务..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {showResults && searchResults.length > 0 && (
          <div className={styles.searchDropdown}>
            {searchResults.map((task) => (
              <div key={task.id} className={styles.searchItem}>
                <span className={styles.searchDate}>{task.date}</span>
                <span className={styles.searchTitle}>{task.title}</span>
                {task.is_completed ? <span className={styles.doneTag}>已完成</span> : null}
              </div>
            ))}
          </div>
        )}
        {showResults && searchQuery && searchResults.length === 0 && (
          <div className={styles.searchDropdown}>
            <div className={styles.noResult}>无匹配结果</div>
          </div>
        )}
      </div>

      {/* Quick add */}
      <button
        className={styles.quickAdd}
        onClick={() => openTaskForm({ date: format(new Date(), 'yyyy-MM-dd') })}
      >
        + 快速添加
      </button>

      {/* Upcoming */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>即将到来</div>
        {upcomingTasks.length === 0 ? (
          <div className={styles.emptyText}>暂无待办任务</div>
        ) : (
          upcomingTasks.map((task) => (
            <div key={task.id} className={styles.upcomingItem}>
              <span className={styles.upcomingDate}>{task.date}</span>
              <span className={styles.upcomingTitle}>{task.title}</span>
            </div>
          ))
        )}
      </div>
    </aside>
  )
}
