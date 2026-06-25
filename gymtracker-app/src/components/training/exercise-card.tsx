import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export interface ExerciseExecution {
  id: number
  exercise_name: string
  primary_muscle_group: string
  planned_sets: number
  planned_reps: string
  planned_load_kg: number
  planned_rest_seconds: number
  actual_load_kg: number | null
  actual_reps: unknown
  is_completed: boolean
  exercise_notes: string | null
}

interface ExerciseCardProps {
  exercise: ExerciseExecution
  onChange: (id: number, field: string, value: unknown) => void
  onToggle: (id: number) => void
  onCompleted?: (restSeconds: number) => void
}

export function ExerciseCard({ exercise, onChange, onToggle, onCompleted }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false)

  const handleToggle = () => {
    onToggle(exercise.id)
    if (!exercise.is_completed && onCompleted) {
      onCompleted(exercise.planned_rest_seconds)
    }
    if (!expanded) setExpanded(true)
  }

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        exercise.is_completed
          ? 'border-green-500/40 bg-green-500/5'
          : 'border-border bg-card'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={handleToggle}
          className={cn(
            'mt-0.5 h-6 w-6 flex-shrink-0 rounded-full border-2 transition-colors flex items-center justify-center',
            exercise.is_completed
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-muted-foreground hover:border-primary'
          )}
          aria-label="Marcar como concluído"
        >
          {exercise.is_completed && (
            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="2,6 5,9 10,3" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className={cn('font-semibold text-sm', exercise.is_completed && 'line-through text-muted-foreground')}>
                {exercise.exercise_name}
              </p>
              <Badge variant="outline" className="mt-1 text-xs">
                {exercise.primary_muscle_group}
              </Badge>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-primary">{exercise.planned_sets} × {exercise.planned_reps}</p>
              <p className="text-xs text-muted-foreground">{exercise.planned_load_kg > 0 ? `${exercise.planned_load_kg} kg` : '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>Descanso: {exercise.planned_rest_seconds}s</span>
            <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 hover:text-foreground">
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Fechar' : 'Registrar dados'}
            </button>
          </div>

          {expanded && (
            <div className="mt-3 space-y-3 border-t pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Carga utilizada (kg)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={exercise.actual_load_kg ?? exercise.planned_load_kg}
                    onChange={e => onChange(exercise.id, 'actual_load_kg', parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Reps realizadas</Label>
                  <Input
                    type="number"
                    placeholder={exercise.planned_reps}
                    value={Array.isArray(exercise.actual_reps)
                      ? (exercise.actual_reps[0] as number) ?? ''
                      : (exercise.actual_reps as number) ?? ''}
                    onChange={e => onChange(exercise.id, 'actual_reps', parseInt(e.target.value) || null)}
                    className="h-8 text-sm mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Observações</Label>
                <Textarea
                  placeholder="Ex: aumentar carga na próxima, dor no ombro..."
                  value={exercise.exercise_notes ?? ''}
                  onChange={e => onChange(exercise.id, 'exercise_notes', e.target.value)}
                  className="mt-1 text-sm h-16 resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
