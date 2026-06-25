import { Progress } from '@/components/ui/progress'

interface CycleProgressBarProps {
  completed: number
  total: number
  weekNumber: number
  totalWeeks: number
  blockName: string
}

export function CycleProgressBar({
  completed,
  total,
  weekNumber,
  totalWeeks,
  blockName,
}: CycleProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Semana {weekNumber} de {totalWeeks} — Bloco: {blockName}
        </span>
        <span className="font-medium">
          {completed}/{total} treinos
        </span>
      </div>
      <Progress value={pct} className="h-3" />
      <p className="text-right text-xs text-muted-foreground">{pct}% concluído</p>
    </div>
  )
}
