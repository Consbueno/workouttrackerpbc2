import { useEffect, useRef, useState } from 'react'
import { X, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
import { cn } from '@/lib/utils'

interface RestTimerProps {
  seconds: number
  onFinish: () => void
  onDismiss: () => void
}

export function RestTimer({ seconds, onFinish, onDismiss }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const { vibrateEnabled } = useAppStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          if (vibrateEnabled && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200])
          }
          onFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [vibrateEnabled, onFinish])

  const pct = ((seconds - remaining) / seconds) * 100

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 p-3">
      <div className="mx-auto max-w-lg bg-card border rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Descanso</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-center">
          <span className={cn('text-4xl font-bold tabular-nums', remaining <= 5 && 'text-destructive')}>
            {remaining}s
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
