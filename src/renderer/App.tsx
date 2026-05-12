import { useEffect, useState, useCallback } from 'react'
import { useTaskStore } from './store/taskStore'
import { useSettingsStore } from './store/settingsStore'
import { useUIStore } from './store/uiStore'
import Layout from './components/Layout/Layout'
import CalendarView from './components/Calendar/CalendarView'
import ListView from './components/ListView/ListView'
import TaskFormModal from './components/TaskForm/TaskFormModal'
import TaskDetail from './components/TaskDetail/TaskDetail'
import ConfirmDialog from './components/ConfirmDialog/ConfirmDialog'
import SettingsPanel from './components/Settings/SettingsPanel'
import { format } from 'date-fns'
import styles from './App.module.css'

export default function App() {
  const { loadTasks } = useTaskStore()
  const { settings, loadSettings } = useSettingsStore()
  const { openTaskForm, closeTaskForm, closeTaskDetail, closeSettings, taskFormOpen, detailTask, settingsOpen } = useUIStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadTasks(), loadSettings()]).then(() => setLoading(false))
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', settings.theme_primary_color)
    document.documentElement.style.setProperty('--color-bg', settings.theme_background_color)
    document.documentElement.style.setProperty('--color-primary-dark', settings.theme_accent_color)
    document.documentElement.style.setProperty('--color-text', settings.theme_text_color)
  }, [settings])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (taskFormOpen) closeTaskForm()
      else if (detailTask) closeTaskDetail()
      else if (settingsOpen) closeSettings()
      return
    }
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault()
      openTaskForm({ date: format(new Date(), 'yyyy-MM-dd') })
    }
  }, [taskFormOpen, detailTask, settingsOpen, openTaskForm, closeTaskForm, closeTaskDetail, closeSettings])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>正在加载...</span>
      </div>
    )
  }

  return (
    <>
      <Layout>
        {settings.view_mode === 'calendar' ? <CalendarView /> : <ListView />}
      </Layout>
      <ConfirmDialog />
      <TaskFormModal />
      <TaskDetail />
      <SettingsPanel />
    </>
  )
}
