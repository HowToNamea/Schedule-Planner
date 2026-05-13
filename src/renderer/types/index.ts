export interface Task {
  id: string
  title: string
  description: string
  date: string
  start_time: string | null
  end_time: string | null
  is_all_day: number
  is_completed: number
  created_at: string
  updated_at: string
}

export interface TaskImage {
  id: string
  task_id: string
  file_path: string
  original_name: string
  created_at: string
}

export interface TaskFormData {
  title: string
  description: string
  date: string
  startTime: string | null
  endTime: string | null
  isAllDay: boolean
}

export type ViewMode = 'calendar' | 'list'
export type CalendarViewType = 'month' | 'week' | 'day'

export interface AppSettings {
  theme_primary_color: string
  theme_background_color: string
  theme_accent_color: string
  theme_text_color: string
  view_mode: ViewMode
  default_calendar_view: CalendarViewType
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: Task
}

// Extend Window interface for the exposed API
declare global {
  interface Window {
    electronAPI: {
      tasks: {
        getAll: () => Promise<Task[]>
        getByDate: (date: string) => Promise<Task[]>
        getByDateRange: (startDate: string, endDate: string) => Promise<Task[]>
        create: (data: TaskFormData) => Promise<Task>
        update: (id: string, data: Partial<TaskFormData>) => Promise<Task>
        delete: (id: string) => Promise<void>
        toggleComplete: (id: string) => Promise<Task>
        search: (query: string) => Promise<Task[]>
      }
      images: {
        add: (taskId: string, sourcePath: string, originalName: string) => Promise<TaskImage>
        getByTask: (taskId: string) => Promise<TaskImage[]>
        delete: (imageId: string) => Promise<void>
        pickFile: () => Promise<string | null>
      }
      settings: {
        getAll: () => Promise<Record<string, string>>
        set: (key: string, value: string) => Promise<void>
        getDataDir: () => Promise<string>
        pickFolder: () => Promise<string | null>
        changeDataDir: (newDir: string) => Promise<{ success: boolean; error?: string }>
      }
    }
  }
}
