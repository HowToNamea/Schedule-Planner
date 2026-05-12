import { useState, useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import type { TaskImage } from '../../types'
import styles from './TaskDetail.module.css'

export default function TaskDetail() {
  const { detailTask, closeTaskDetail, openTaskForm, showConfirm } = useUIStore()
  const { deleteTask, toggleComplete } = useTaskStore()
  const [images, setImages] = useState<TaskImage[]>([])
  const [previewImg, setPreviewImg] = useState<string | null>(null)

  useEffect(() => {
    if (detailTask) {
      window.electronAPI.images.getByTask(detailTask.id).then(setImages)
    }
  }, [detailTask])

  if (!detailTask) return null

  const task = detailTask

  const handleDelete = () => {
    showConfirm('删除任务', `确定要删除任务「${task.title}」吗？删除后无法恢复。`, async () => {
      await deleteTask(task.id)
      closeTaskDetail()
    })
  }

  const handleToggle = async () => {
    await toggleComplete(task.id)
  }

  const handleEdit = () => {
    closeTaskDetail()
    openTaskForm({ task: detailTask })
  }

  return (
    <div className={styles.overlay} onClick={closeTaskDetail}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{task.title}</h2>
          <button className={styles.closeBtn} onClick={closeTaskDetail}>x</button>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.label}>日期</span>
            <span>{task.date}</span>
          </div>
          {task.is_all_day ? (
            <div className={styles.metaItem}>
              <span className={styles.label}>时间</span>
              <span className={styles.tag}>全天</span>
            </div>
          ) : (
            task.start_time && (
              <div className={styles.metaItem}>
                <span className={styles.label}>时间</span>
                <span>{task.start_time}{task.end_time ? ` - ${task.end_time}` : ''}</span>
              </div>
            )
          )}
          <div className={styles.metaItem}>
            <span className={styles.label}>状态</span>
            <span className={task.is_completed ? styles.doneText : styles.pendingText}>
              {task.is_completed ? '已完成' : '未完成'}
            </span>
          </div>
        </div>

        {task.description && (
          <div className={styles.desc}>
            <div className={styles.label}>描述</div>
            <p>{task.description}</p>
          </div>
        )}

        {images.length > 0 && (
          <div className={styles.images}>
            <div className={styles.label}>图片附件</div>
            <div className={styles.imageGrid}>
              {images.map((img) => (
                <img
                  key={img.id}
                  className={styles.thumb}
                  src={`file://${img.file_path}`}
                  alt={img.original_name}
                  onClick={() => setPreviewImg(`file://${img.file_path}`)}
                />
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.toggleBtn} onClick={handleToggle}>
            {task.is_completed ? '标记为未完成' : '标记为已完成'}
          </button>
          <button className={styles.editBtn} onClick={handleEdit}>编辑</button>
          <button className={styles.deleteBtn} onClick={handleDelete}>删除</button>
        </div>
      </div>

      {/* Image preview overlay */}
      {previewImg && (
        <div className={styles.previewOverlay} onClick={() => setPreviewImg(null)}>
          <img className={styles.previewImg} src={previewImg} alt="preview" />
        </div>
      )}
    </div>
  )
}
