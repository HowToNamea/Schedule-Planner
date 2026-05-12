import { create } from 'zustand'
import type { Task, TaskFormData } from '../types'

interface TaskState {
  tasks: Task[]
  loadTasks: () => Promise<void>
  createTask: (data: TaskFormData) => Promise<Task>
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  toggleComplete: (id: string) => Promise<Task>
  searchTasks: (query: string) => Promise<Task[]>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  loadTasks: async () => {
    const tasks = await window.electronAPI.tasks.getAll()
    set({ tasks })
  },

  createTask: async (data) => {
    const task = await window.electronAPI.tasks.create(data)
    set({ tasks: [task, ...get().tasks] })
    return task
  },

  updateTask: async (id, data) => {
    const task = await window.electronAPI.tasks.update(id, data)
    set({ tasks: get().tasks.map((t) => (t.id === id ? task : t)) })
    return task
  },

  deleteTask: async (id) => {
    await window.electronAPI.tasks.delete(id)
    set({ tasks: get().tasks.filter((t) => t.id !== id) })
  },

  toggleComplete: async (id) => {
    const task = await window.electronAPI.tasks.toggleComplete(id)
    set({ tasks: get().tasks.map((t) => (t.id === id ? task : t)) })
    return task
  },

  searchTasks: async (query) => {
    return await window.electronAPI.tasks.search(query)
  }
}))
