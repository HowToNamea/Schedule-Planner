import { create } from 'zustand'
import type { Task } from '../types'

interface ConfirmState {
  open: boolean
  title: string
  message: string
  onConfirm: (() => void) | null
}

interface UIState {
  // Task form modal
  taskFormOpen: boolean
  editingTask: Task | null
  prefillDate: string | null
  prefillStartTime: string | null
  openTaskForm: (prefill?: { date?: string; startTime?: string; task?: Task }) => void
  closeTaskForm: () => void

  // Task detail modal
  detailTask: Task | null
  openTaskDetail: (task: Task) => void
  closeTaskDetail: () => void

  // Settings panel
  settingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void

  // Confirm dialog
  confirm: ConfirmState
  showConfirm: (title: string, message: string, onConfirm: () => void) => void
  closeConfirm: () => void
}

export const useUIStore = create<UIState>((set) => ({
  taskFormOpen: false,
  editingTask: null,
  prefillDate: null,
  prefillStartTime: null,

  openTaskForm: (prefill = {}) =>
    set({
      taskFormOpen: true,
      editingTask: prefill.task || null,
      prefillDate: prefill.date || null,
      prefillStartTime: prefill.startTime || null
    }),

  closeTaskForm: () =>
    set({ taskFormOpen: false, editingTask: null, prefillDate: null, prefillStartTime: null }),

  detailTask: null,

  openTaskDetail: (task) => set({ detailTask: task }),
  closeTaskDetail: () => set({ detailTask: null }),

  settingsOpen: false,

  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),

  confirm: { open: false, title: '', message: '', onConfirm: null },

  showConfirm: (title, message, onConfirm) =>
    set({ confirm: { open: true, title, message, onConfirm } }),

  closeConfirm: () =>
    set({ confirm: { open: false, title: '', message: '', onConfirm: null } })
}))
