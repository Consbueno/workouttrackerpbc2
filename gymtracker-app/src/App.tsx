import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { AppRoutes } from './routes'
import { Toaster } from '@/components/ui/toaster'
import { useAppStore } from '@/stores/app-store'

export default function App() {
  const { theme } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  )
}
