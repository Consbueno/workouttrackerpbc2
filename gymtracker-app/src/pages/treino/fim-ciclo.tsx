import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Trophy, RefreshCw, TrendingUp, PenLine } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdherenceChart } from '@/components/charts/adherence-chart'
import { WeightChart } from '@/components/charts/weight-chart'
import { useActiveProgram, useProgramSummary } from '@/hooks/use-training'
import { programasApi } from '@/api/treino'
import { medicoesApi } from '@/api/resultados'
import { useQuery } from '@tanstack/react-query'
import { toast } from '@/hooks/use-toast'

export default function FimCicloPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: program } = useActiveProgram()
  const programId = program?.id as number | undefined
  const { data: summary } = useProgramSummary(programId)

  const [pct, setPct] = useState('5')

  const { data: medicoes } = useQuery({
    queryKey: ['medicoes-evolucao'],
    queryFn: () => medicoesApi.evolucao().then(r => r.data.data),
  })

  const duplicateMutation = useMutation({
    mutationFn: () => programasApi.duplicar(programId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programa-ativo'] })
      qc.invalidateQueries({ queryKey: ['proximo-dia'] })
      toast({ title: 'Ciclo duplicado com sucesso! Bom treino! 💪' })
      navigate('/')
    },
    onError: () => toast({ title: 'Erro ao duplicar ciclo.', variant: 'destructive' }),
  })

  const progressaoMutation = useMutation({
    mutationFn: () => programasApi.progressao(programId!, parseFloat(pct)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programa-ativo'] })
      qc.invalidateQueries({ queryKey: ['proximo-dia'] })
      toast({ title: `Novo ciclo criado com ${pct}% de progressão! 🚀` })
      navigate('/')
    },
    onError: () => toast({ title: 'Erro ao criar progressão.', variant: 'destructive' }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fim de Ciclo"
        description="Parabéns! Você completou o ciclo de treino."
      />

      {/* Troféu */}
      <div className="flex flex-col items-center py-6 text-center">
        <Trophy className="h-16 w-16 text-yellow-500 mb-3" />
        <h2 className="text-2xl font-bold">Ciclo Concluído!</h2>
        <p className="text-muted-foreground mt-1">Confira seu desempenho abaixo.</p>
      </div>

      {/* Resumo */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-green-500">{summary.completed}</p>
              <p className="text-xs text-muted-foreground mt-1">Treinos realizados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-destructive">{summary.missed}</p>
              <p className="text-xs text-muted-foreground mt-1">Faltas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold text-primary">{summary.adherence_pct}%</p>
              <p className="text-xs text-muted-foreground mt-1">Aderência</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-3xl font-bold">{summary.calendar_days ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">Dias corridos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráfico de aderência */}
      {summary?.by_week && summary.by_week.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Aderência por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <AdherenceChart data={summary.by_week} />
          </CardContent>
        </Card>
      )}

      {/* Gráfico de peso */}
      {medicoes && medicoes.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Evolução do Peso no Ciclo</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightChart data={medicoes} />
          </CardContent>
        </Card>
      )}

      {/* Opções de próximo ciclo */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">O que fazer a seguir?</h3>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Duplicar Ciclo</p>
              <p className="text-sm text-muted-foreground">Copia o programa exatamente como está, sem alterar cargas.</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (confirm('Duplicar o ciclo atual sem progressão de carga?')) duplicateMutation.mutate()
              }}
              disabled={duplicateMutation.isPending}
            >
              {duplicateMutation.isPending ? '...' : 'Duplicar'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Progressão por Carga</p>
              <p className="text-sm text-muted-foreground">Aumenta todas as cargas por uma porcentagem.</p>
              <div className="flex items-center gap-2 mt-2">
                <Label className="text-xs whitespace-nowrap">Percentual (%)</Label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  max="20"
                  value={pct}
                  onChange={e => setPct(e.target.value)}
                  className="h-8 w-20 text-sm"
                />
              </div>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                if (confirm(`Criar novo ciclo com ${pct}% de progressão em todas as cargas?`)) {
                  progressaoMutation.mutate()
                }
              }}
              disabled={progressaoMutation.isPending}
            >
              {progressaoMutation.isPending ? '...' : 'Criar'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-start gap-3">
            <PenLine className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Novo Programa Manual</p>
              <p className="text-sm text-muted-foreground">Cria um programa do zero com o wizard de 4 passos.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/treino/manutencao')}>
              Criar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
