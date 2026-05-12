import initSqlJs from 'sql.js'
import type { Database, SqlJsStatic } from 'sql.js'
import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, unlinkSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'

let db: Database
let SQL: SqlJsStatic
let DB_PATH: string

function saveDb(): void {
  const data = db.export()
  const buffer = Buffer.from(data)
  writeFileSync(DB_PATH, buffer)
}

export async function initDatabase(): Promise<void> {
  DB_PATH = join(app.getPath('userData'), 'schedule.db')
  SQL = await initSqlJs()

  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  db.run('PRAGMA foreign_keys = ON')

  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      is_all_day INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    )
  `)

  db.run('CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date)')
  db.run('CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(is_completed)')

  db.run(`
    CREATE TABLE IF NOT EXISTS task_images (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      original_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `)

  // Default settings
  const defaults: Record<string, string> = {
    theme_primary_color: '#4A90D9',
    theme_background_color: '#F0F4FA',
    theme_accent_color: '#2C6FB7',
    theme_text_color: '#2C3E50',
    view_mode: 'calendar',
    default_calendar_view: 'month'
  }
  for (const [key, value] of Object.entries(defaults)) {
    db.run('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value])
  }

  saveDb()
}

function getImageDir(): string {
  const dir = join(app.getPath('userData'), 'images')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

function rowToObject(row: Record<string, unknown>): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    obj[key] = value
  }
  return obj
}

// --- Task CRUD ---

export function getAllTasks(): unknown[] {
  const stmt = db.prepare('SELECT * FROM tasks ORDER BY date DESC, start_time ASC')
  const rows: unknown[] = []
  while (stmt.step()) {
    rows.push(rowToObject(stmt.getAsObject()))
  }
  stmt.free()
  return rows
}

export function getTasksByDate(date: string): unknown[] {
  const stmt = db.prepare('SELECT * FROM tasks WHERE date = ? ORDER BY start_time ASC')
  stmt.bind([date])
  const rows: unknown[] = []
  while (stmt.step()) {
    rows.push(rowToObject(stmt.getAsObject()))
  }
  stmt.free()
  return rows
}

export function getTasksByDateRange(startDate: string, endDate: string): unknown[] {
  const stmt = db.prepare('SELECT * FROM tasks WHERE date >= ? AND date <= ? ORDER BY date ASC, start_time ASC')
  stmt.bind([startDate, endDate])
  const rows: unknown[] = []
  while (stmt.step()) {
    rows.push(rowToObject(stmt.getAsObject()))
  }
  stmt.free()
  return rows
}

export function createTask(data: {
  title: string
  description: string
  date: string
  startTime: string | null
  endTime: string | null
  isAllDay: boolean
}): unknown {
  const id = uuidv4()
  db.run(
    'INSERT INTO tasks (id, title, description, date, start_time, end_time, is_all_day) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, data.title, data.description, data.date, data.startTime, data.endTime, data.isAllDay ? 1 : 0]
  )
  saveDb()

  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?')
  stmt.bind([id])
  let result: unknown = null
  if (stmt.step()) {
    result = rowToObject(stmt.getAsObject())
  }
  stmt.free()
  return result
}

export function updateTask(id: string, data: Partial<{
  title: string
  description: string
  date: string
  startTime: string | null
  endTime: string | null
  isAllDay: boolean
}>): unknown {
  const sets: string[] = []
  const values: unknown[] = []

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    const dbKey = key.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())
    if (key === 'isAllDay') {
      sets.push(`${dbKey} = ?`)
      values.push(value ? 1 : 0)
    } else {
      sets.push(`${dbKey} = ?`)
      values.push(value)
    }
  }
  sets.push("updated_at = datetime('now', 'localtime')")
  values.push(id)

  db.run(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, values)
  saveDb()

  const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?')
  stmt.bind([id])
  let result: unknown = null
  if (stmt.step()) {
    result = rowToObject(stmt.getAsObject())
  }
  stmt.free()
  return result
}

export function deleteTask(id: string): void {
  const stmt = db.prepare('SELECT file_path FROM task_images WHERE task_id = ?')
  stmt.bind([id])
  const imagePaths: string[] = []
  while (stmt.step()) {
    imagePaths.push(stmt.getAsObject().file_path as string)
  }
  stmt.free()

  for (const p of imagePaths) {
    try { if (existsSync(p)) unlinkSync(p) } catch { /* ignore */ }
  }

  db.run('DELETE FROM task_images WHERE task_id = ?', [id])
  db.run('DELETE FROM tasks WHERE id = ?', [id])
  saveDb()
}

export function toggleTaskComplete(id: string): unknown {
  const stmt = db.prepare('SELECT is_completed FROM tasks WHERE id = ?')
  stmt.bind([id])
  let current = 0
  if (stmt.step()) {
    current = stmt.getAsObject().is_completed as number
  }
  stmt.free()

  const newState = current ? 0 : 1
  db.run("UPDATE tasks SET is_completed = ?, updated_at = datetime('now', 'localtime') WHERE id = ?", [newState, id])
  saveDb()

  const stmt2 = db.prepare('SELECT * FROM tasks WHERE id = ?')
  stmt2.bind([id])
  let result: unknown = null
  if (stmt2.step()) {
    result = rowToObject(stmt2.getAsObject())
  }
  stmt2.free()
  return result
}

export function searchTasks(query: string): unknown[] {
  const term = `%${query}%`
  const stmt = db.prepare(`
    SELECT * FROM tasks
    WHERE title LIKE ? OR description LIKE ?
    ORDER BY date DESC, start_time ASC
    LIMIT 30
  `)
  stmt.bind([term, term])
  const rows: unknown[] = []
  while (stmt.step()) {
    rows.push(rowToObject(stmt.getAsObject()))
  }
  stmt.free()
  return rows
}

// --- Images ---

export function addTaskImage(taskId: string, sourcePath: string, originalName: string): unknown {
  const id = uuidv4()
  const ext = originalName.includes('.') ? originalName.split('.').pop() || 'jpg' : 'jpg'
  const fileName = `${id}.${ext}`
  const destPath = join(getImageDir(), fileName)

  copyFileSync(sourcePath, destPath)

  db.run(
    'INSERT INTO task_images (id, task_id, file_path, original_name) VALUES (?, ?, ?, ?)',
    [id, taskId, destPath, originalName]
  )
  saveDb()

  return { id, taskId, filePath: destPath, originalName }
}

export function getTaskImages(taskId: string): unknown[] {
  const stmt = db.prepare('SELECT * FROM task_images WHERE task_id = ? ORDER BY created_at ASC')
  stmt.bind([taskId])
  const rows: unknown[] = []
  while (stmt.step()) {
    rows.push(rowToObject(stmt.getAsObject()))
  }
  stmt.free()
  return rows
}

export function deleteTaskImage(imageId: string): void {
  const stmt = db.prepare('SELECT file_path FROM task_images WHERE id = ?')
  stmt.bind([imageId])
  if (stmt.step()) {
    const path = stmt.getAsObject().file_path as string
    try { if (existsSync(path)) unlinkSync(path) } catch { /* ignore */ }
  }
  stmt.free()

  db.run('DELETE FROM task_images WHERE id = ?', [imageId])
  saveDb()
}

// --- Settings ---

export function getAllSettings(): Record<string, string> {
  const stmt = db.prepare('SELECT key, value FROM settings')
  const result: Record<string, string> = {}
  while (stmt.step()) {
    const row = stmt.getAsObject()
    result[row.key as string] = row.value as string
  }
  stmt.free()
  return result
}

export function setSetting(key: string, value: string): void {
  db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value])
  saveDb()
}
