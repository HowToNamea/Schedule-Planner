import { useUIStore } from '../../store/uiStore'
import { useSettingsStore } from '../../store/settingsStore'
import styles from './SettingsPanel.module.css'

export default function SettingsPanel() {
  const { settingsOpen, closeSettings } = useUIStore()
  const { settings, setSetting, resetToDefaults } = useSettingsStore()

  if (!settingsOpen) return null

  const handleColorChange = async (key: string, value: string) => {
    await setSetting(key as keyof typeof settings, value)
    document.documentElement.style.setProperty(keyToVar(key), value)
  }

  const handleReset = async () => {
    await resetToDefaults()
    document.documentElement.style.setProperty('--color-primary', '#4A90D9')
    document.documentElement.style.setProperty('--color-bg', '#F0F4FA')
    document.documentElement.style.setProperty('--color-primary-dark', '#2C6FB7')
    document.documentElement.style.setProperty('--color-text', '#2C3E50')
  }

  return (
    <div className={styles.overlay} onClick={closeSettings}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>设置</h2>
          <button className={styles.closeBtn} onClick={closeSettings}>x</button>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>主题颜色</h3>
          <div className={styles.colorRow}>
            <label className={styles.colorLabel}>
              <span>主色调</span>
              <input
                type="color"
                value={settings.theme_primary_color}
                onChange={(e) => handleColorChange('theme_primary_color', e.target.value)}
              />
            </label>
            <div
              className={styles.colorPreview}
              style={{ background: settings.theme_primary_color }}
            />
          </div>
          <div className={styles.colorRow}>
            <label className={styles.colorLabel}>
              <span>背景色</span>
              <input
                type="color"
                value={settings.theme_background_color}
                onChange={(e) => handleColorChange('theme_background_color', e.target.value)}
              />
            </label>
            <div
              className={styles.colorPreview}
              style={{ background: settings.theme_background_color }}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>默认视图</h3>
          <select
            className={styles.select}
            value={settings.default_calendar_view}
            onChange={(e) => setSetting('default_calendar_view', e.target.value)}
          >
            <option value="month">月视图</option>
            <option value="week">周视图</option>
            <option value="day">日视图</option>
          </select>
        </div>

        <button className={styles.resetBtn} onClick={handleReset}>
          恢复默认设置
        </button>
      </div>
    </div>
  )
}

function keyToVar(key: string): string {
  const map: Record<string, string> = {
    theme_primary_color: '--color-primary',
    theme_background_color: '--color-bg',
    theme_accent_color: '--color-primary-dark',
    theme_text_color: '--color-text'
  }
  return map[key] || ''
}
