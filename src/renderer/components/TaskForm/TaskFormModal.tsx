import { useState, useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import { format } from 'date-fns'
import type { TaskImage } from '../../types'
import styles from './TaskFormModal.module.css'

export default function TaskFormModal() {
  const { taskFormOpen, editingTask, prefillDate, prefillStartTime, closeTaskForm } = useUIStore()
  const { createTask, updateTask } = useTaskStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isAllDay, setIsAllDay] = useState(false)
  const [images, setImages] = useState<TaskImage[]>([])
  const [pendingImages, setPendingImages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!taskFormOpen) return
    if (editingTask) {
      setTitle(editingTask.title)
      setDescription(editingTask.description)
      setDate(editingTask.date)
      setStartTime(editingTask.start_time || '')
      setEndTime(editingTask.end_time || '')
      setIsAllDay(!!editingTask.is_all_day)
      window.electronAPI.images.getByTask(editingTask.id).then(setImages)
    } else {
      setTitle('')
      setDescription('')
      setDate(prefillDate || format(new Date(), 'yyyy-MM-dd'))
      setStartTime(prefillStartTime || '')
      setEndTime('')
      setIsAllDay(false)
      setImages([])
    }
    setPendingImages([])
  }, [taskFormOpen, editingTask, prefillDate, prefillStartTime])

  if (!taskFormOpen) return null

  const handleAddImage = async () => {
    const filePath = await window.electronAPI.images.pickFile()
    if (filePath) {
      setPendingImages([...pendingImages, filePath])
    }
  }

  const handleRemovePendingImage = (index: number) => {
    setPendingImages(pendingImages.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = async (imageId: string) => {
    await window.electronAPI.images.delete(imageId)
    setImages(images.filter((img) => img.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) return

    setSaving(true)
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        date,
        startTime: isAllDay ? null : (startTime || null),
        endTime: isAllDay ? null : (endTime || null),
        isAllDay
      }

      let taskId: string
      if (editingTask) {
        const updated = await updateTask(editingTask.id, data)
        taskId = updated.id
      } else {
        const created = await createTask(data)
        taskId = created.id
      }

      // Upload pending images
      for (const filePath of pendingImages) {
        const name = filePath.split(/[/\\]/).pop() || 'image'
        await window.electronAPI.images.add(taskId, filePath, name)
      }

      closeTaskForm()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={closeTaskForm}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>{editingTask ? '编辑任务' : '新建任务'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>标题 *</label>
            <input
              className={styles.input}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题"
              autoFocus
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>描述</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可选描述"
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>日期 *</label>
              <input
                className={styles.input}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>&nbsp;</label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                />
                <span>全天事件</span>
              </label>
            </div>
          </div>

          {!isAllDay && (
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>开始时间</label>
                <input
                  className={styles.input}
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>结束时间</label>
                <input
                  className={styles.input}
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Images */}
          <div className={styles.field}>
            <label className={styles.label}>图片附件</label>
            <div className={styles.imageGrid}>
              {images.map((img) => (
                <div key={img.id} className={styles.imageThumb}>
                  <img src={`file://${img.file_path}`} alt={img.original_name} />
                  <button type="button" className={styles.removeBtn} onClick={() => handleRemoveExistingImage(img.id)}>x</button>
                </div>
              ))}
              {pendingImages.map((path, i) => (
                <div key={`pending-${i}`} className={styles.imageThumb}>
                  <img src={`file://${path}`} alt="pending" />
                  <button type="button" className={styles.removeBtn} onClick={() => handleRemovePendingImage(i)}>x</button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.addImageBtn} onClick={handleAddImage}>
              + 添加图片
            </button>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={closeTaskForm}>取消</button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
