import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  theme: 'dark' | 'light'
  units: 'kg' | 'lb'
  restTimerEnabled: boolean
  vibrateEnabled: boolean
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  setUnits: (units: 'kg' | 'lb') => void
  setRestTimer: (enabled: boolean) => void
  setVibrate: (enabled: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      units: 'kg',
      restTimerEnabled: true,
      vibrateEnabled: true,

      setTheme: (theme) => {
        set({ theme })
        const root = document.documentElement
        if (theme === 'dark') root.classList.add('dark')
        else root.classList.remove('dark')
      },

      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        get().setTheme(next)
      },

      setUnits: (units) => set({ units }),
      setRestTimer: (restTimerEnabled) => set({ restTimerEnabled }),
      setVibrate: (vibrateEnabled) => set({ vibrateEnabled }),
    }),
    { name: 'gymtracker-app' }
  )
)
