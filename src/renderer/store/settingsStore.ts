import { create } from 'zustand'
import type { AppSettings, ViewMode, CalendarViewType } from '../types'

const defaults: AppSettings = {
  theme_primary_color: '#4A90D9',
  theme_background_color: '#F0F4FA',
  theme_accent_color: '#2C6FB7',
  theme_text_color: '#2C3E50',
  view_mode: 'calendar',
  default_calendar_view: 'month'
}

interface SettingsState {
  settings: AppSettings
  loadSettings: () => Promise<void>
  setSetting: (key: keyof AppSettings, value: string) => Promise<void>
  setViewMode: (mode: ViewMode) => Promise<void>
  resetToDefaults: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...defaults },

  loadSettings: async () => {
    const raw = await window.electronAPI.settings.getAll()
    set({
      settings: {
        theme_primary_color: raw.theme_primary_color || defaults.theme_primary_color,
        theme_background_color: raw.theme_background_color || defaults.theme_background_color,
        theme_accent_color: raw.theme_accent_color || defaults.theme_accent_color,
        theme_text_color: raw.theme_text_color || defaults.theme_text_color,
        view_mode: (raw.view_mode as ViewMode) || defaults.view_mode,
        default_calendar_view: (raw.default_calendar_view as CalendarViewType) || defaults.default_calendar_view
      }
    })
  },

  setSetting: async (key, value) => {
    await window.electronAPI.settings.set(key, value)
    set({ settings: { ...get().settings, [key]: value } })
  },

  setViewMode: async (mode) => {
    await window.electronAPI.settings.set('view_mode', mode)
    set({ settings: { ...get().settings, view_mode: mode } })
  },

  resetToDefaults: async () => {
    for (const [key, value] of Object.entries(defaults)) {
      await window.electronAPI.settings.set(key, value)
    }
    set({ settings: { ...defaults } })
  }
}))
