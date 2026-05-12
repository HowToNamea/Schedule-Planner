import { useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, type Event } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useTaskStore } from '../../store/taskStore'
import { useUIStore } from '../../store/uiStore'
import { useSettingsStore } from '../../store/settingsStore'
import type { Task, CalendarViewType } from '../../types'
import CalendarToolbar from './CalendarToolbar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-overrides.css'
import styles from './CalendarView.module.css'

const locales = { 'zh-CN': zhCN }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales
})

export default function CalendarView() {
  const { tasks } = useTaskStore()
  const { openTaskForm, openTaskDetail } = useUIStore()
  const { settings, setSetting } = useSettingsStore()

  const calendarView = settings.default_calendar_view as CalendarViewType

  const events = useMemo(() => {
    return tasks.map((task) => {
      const dateParts = task.date.split('-').map(Number)
      const year = dateParts[0], month = dateParts[1] - 1, day = dateParts[2]

      if (task.is_all_day || (!task.start_time && !task.end_time)) {
        return {
          id: task.id,
          title: task.title,
          start: new Date(year, month, day),
          end: new Date(year, month, day),
          allDay: true,
          resource: task
        }
      }

      const [sh, sm] = (task.start_time || '00:00').split(':').map(Number)
      const [eh, em] = (task.end_time || '23:59').split(':').map(Number)

      return {
        id: task.id,
        title: task.title,
        start: new Date(year, month, day, sh || 0, sm || 0),
        end: new Date(year, month, day, eh || 23, em || 59),
        allDay: false,
        resource: task
      }
    })
  }, [tasks])

  const handleSelectSlot = useCallback(({ start }: { start: Date }) => {
    const date = format(start, 'yyyy-MM-dd')
    const time = format(start, 'HH:mm')
    openTaskForm({ date, startTime: time })
  }, [openTaskForm])

  const handleSelectEvent = useCallback((event: Event) => {
    const task = (event as { resource?: Task }).resource
    if (task) openTaskDetail(task)
  }, [openTaskDetail])

  const handleView = useCallback((view: string) => {
    setSetting('default_calendar_view', view)
  }, [setSetting])

  const eventPropGetter = useCallback((event: Event) => {
    const task = (event as { resource?: Task }).resource
    if (task?.is_completed) {
      return {
        style: {
          backgroundColor: 'var(--color-success)',
          opacity: 0.6,
          textDecoration: 'line-through'
        }
      }
    }
    return {
      style: {
        backgroundColor: 'var(--color-primary)',
        border: 'none'
      }
    }
  }, [])

  return (
    <div className={styles.container}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={calendarView}
        views={{ month: true, week: true, day: true }}
        onView={handleView}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        popup
        eventPropGetter={eventPropGetter}
        components={{ toolbar: CalendarToolbar }}
        formats={{
          monthHeaderFormat: (date: Date) => format(date, 'yyyy年 MMM', { locale: zhCN }),
          dayHeaderFormat: (date: Date) => format(date, 'M月d日 EEE', { locale: zhCN }),
          dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
            `${format(start, 'M月d日')} - ${format(end, 'M月d日')}`
        }}
      />
    </div>
  )
}
