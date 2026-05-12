import { contextBridge, ipcRenderer } from 'electron'

const api = {
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    getByDate: (date: string) => ipcRenderer.invoke('tasks:getByDate', date),
    getByDateRange: (startDate: string, endDate: string) =>
      ipcRenderer.invoke('tasks:getByDateRange', startDate, endDate),
    create: (data: unknown) => ipcRenderer.invoke('tasks:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('tasks:update', id, data),
    delete: (id: string) => ipcRenderer.invoke('tasks:delete', id),
    toggleComplete: (id: string) => ipcRenderer.invoke('tasks:toggleComplete', id),
    search: (query: string) => ipcRenderer.invoke('tasks:search', query)
  },
  images: {
    add: (taskId: string, sourcePath: string, originalName: string) =>
      ipcRenderer.invoke('images:add', taskId, sourcePath, originalName),
    getByTask: (taskId: string) => ipcRenderer.invoke('images:getByTask', taskId),
    delete: (imageId: string) => ipcRenderer.invoke('images:delete', imageId),
    pickFile: () => ipcRenderer.invoke('images:pickFile')
  },
  settings: {
    getAll: () => ipcRenderer.invoke('settings:getAll'),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)

export type ElectronAPI = typeof api
