import { ipcMain, dialog } from 'electron'
import {
  getAllTasks,
  getTasksByDate,
  getTasksByDateRange,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskComplete,
  searchTasks,
  addTaskImage,
  getTaskImages,
  deleteTaskImage,
  getAllSettings,
  setSetting
} from './database'

export function registerIpcHandlers(): void {
  // Tasks
  ipcMain.handle('tasks:getAll', () => getAllTasks())
  ipcMain.handle('tasks:getByDate', (_e, date: string) => getTasksByDate(date))
  ipcMain.handle('tasks:getByDateRange', (_e, startDate: string, endDate: string) => getTasksByDateRange(startDate, endDate))
  ipcMain.handle('tasks:create', (_e, data) => createTask(data))
  ipcMain.handle('tasks:update', (_e, id: string, data) => updateTask(id, data))
  ipcMain.handle('tasks:delete', (_e, id: string) => deleteTask(id))
  ipcMain.handle('tasks:toggleComplete', (_e, id: string) => toggleTaskComplete(id))
  ipcMain.handle('tasks:search', (_e, query: string) => searchTasks(query))

  // Images
  ipcMain.handle('images:add', (_e, taskId: string, sourcePath: string, originalName: string) =>
    addTaskImage(taskId, sourcePath, originalName)
  )
  ipcMain.handle('images:getByTask', (_e, taskId: string) => getTaskImages(taskId))
  ipcMain.handle('images:delete', (_e, imageId: string) => deleteTaskImage(imageId))
  ipcMain.handle('images:pickFile', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: '图片', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  // Settings
  ipcMain.handle('settings:getAll', () => getAllSettings())
  ipcMain.handle('settings:set', (_e, key: string, value: string) => setSetting(key, value))
}
