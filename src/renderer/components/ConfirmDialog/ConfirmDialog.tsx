import { useUIStore } from '../../store/uiStore'
import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog() {
  const { confirm, closeConfirm } = useUIStore()

  if (!confirm.open) return null

  const handleConfirm = () => {
    confirm.onConfirm?.()
    closeConfirm()
  }

  return (
    <div className={styles.overlay} onClick={closeConfirm}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{confirm.title}</h3>
        <p className={styles.message}>{confirm.message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={closeConfirm}>取消</button>
          <button className={styles.deleteBtn} onClick={handleConfirm}>删除</button>
        </div>
      </div>
    </div>
  )
}
