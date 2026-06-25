import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Dumbbell, Scale, Flame, TrendingUp, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout/page-header'
import { CycleProgressBar } from '@/components/training/progress-bar'
import { BlockBadge } from '@/components/training/block-badge'
import { WeightChart } from '@/components/charts/weight-chart'
import { useActiveProgram, useNextDay } from '@/hooks/use-training'
import { medicoesApi } from '@/api/resultados'
import { diasApi } from '@/api/treino'
import { formatDate, formatWeight } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useAppStore } from '@/stores/app-store'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { units } = useAppStore()
  const { data: program, isLoading: loadingProg } = useActiveProgram()
  const { data: nextDay } = useNextDay()

  const { data: medicoes } = useQuery({
    queryKey: ['medicoes-evolucao'],
    queryFn: () => medicoesApi.evolucao().then(r => r.data.data),
  })

  const { data: diasStats } = useQuery({
    queryKey: ['dias-stats'],
    queryFn: () =>
      diasApi.list().then(r => {
        const days = r.data.data as Array<{ status: string; week_number: number; block_name: string; block_color: string }>
        const completed = days.filter(d => d.status === 'completed').length
        const missed = days.filter(d => d.status === 'missed').length
        const total = days.length
        const currentWeek = days.find(d => d.status === 'in_progress' || d.status === 'pending')?.week_number ?? 1
        const blockInfo = days.find(d => d.status === 'in_progress' || d.status === 'pending')
        return { completed, missed, total, currentWeek, blockInfo }
      }),
    enabled: !!program,
  })

  const lastMedicao = medicoes && medicoes.length > 0 ? medicoes[medicoes.length - 1] : null

  const streak = (() => {
    // calculado a partir de diasStats — simplificado
    return diasStats?.completed ?? 0
  })()

  if (loadingProg) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24 pt-6" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" description={`Olá, ${user?.full_name?.split(' ')[0]}!`} />
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Nenhum ciclo de treino configurado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crie seu primeiro programa de 16 semanas para começar.
            </p>
            <Button onClick={() => navigate('/treino/manutencao')}>Criar Programa</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Olá, ${user?.full_name?.split(' ')[0]}! Bom treino!`}
      />

      {/* Progresso do ciclo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progresso do Ciclo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CycleProgressBar
            completed={diasStats?.completed ?? 0}
            total={diasStats?.total ?? 0}
            weekNumber={diasStats?.currentWeek ?? 1}
            totalWeeks={program.total_weeks}
            blockName={diasStats?.blockInfo?.block_name ?? '—'}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Bloco atual */}
        {diasStats?.blockInfo && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bloco Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <BlockBadge
                color={diasStats.blockInfo.block_color}
                name={diasStats.blockInfo.block_name}
                className="text-sm"
              />
            </CardContent>
          </Card>
        )}

        {/* Próximo treino */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Próximo Treino
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextDay ? (
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">
                    Treino {nextDay.letter} — {nextDay.split_description}
                  </p>
                  <p className="text-xs text-muted-foreground">Dia {nextDay.day_number}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate('/treino/execucao')}
                  className="w-full"
                >
                  {nextDay.status === 'in_progress' ? 'Continuar Treino' : 'Iniciar Treino'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-2">
                <Badge variant="secondary">Ciclo concluído! 🎉</Badge>
                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => navigate('/treino/fim-ciclo')}>
                  Ver resumo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Última medição */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Última Medição
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastMedicao ? (
              <div className="space-y-2">
                <p className="text-2xl font-bold">{formatWeight(lastMedicao.weight_kg, units)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(lastMedicao.measurement_date)}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma medição registrada.</p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-3"
              onClick={() => navigate('/treino/resultados/nova')}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Nova Medição
            </Button>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Treinos Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{diasStats?.completed ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {diasStats?.missed ?? 0} faltas no ciclo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de peso */}
      {medicoes && medicoes.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Evolução do Peso</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightChart data={medicoes.slice(-8)} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
