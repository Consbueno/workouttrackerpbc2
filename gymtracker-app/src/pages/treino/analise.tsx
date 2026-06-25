import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Cpu, Copy, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { analiseApi } from '@/api/analise'
import { toast } from '@/hooks/use-toast'
import { formatDateTime } from '@/lib/utils'

interface Analysis { id: number; analysis_text: string; created_at: string; preview?: string }

export default function AnalisePage() {
  const qc = useQueryClient()
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: historico = [] } = useQuery<Analysis[]>({
    queryKey: ['analise-historico'],
    queryFn: () => analiseApi.historico().then(r => r.data.data),
  })

  const gerarMutation = useMutation({
    mutationFn: () => analiseApi.gerar(),
    onSuccess: (res) => {
      setCurrentAnalysis(res.data.data)
      qc.invalidateQueries({ queryKey: ['analise-historico'] })
      toast({ title: 'Análise gerada com sucesso!' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Não foi possível gerar a análise no momento. Tente novamente.'
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    },
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Análise copiada para a área de transferência!' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Análise com IA"
        description="Gere um diagnóstico do seu treino com base nos seus dados."
      />

      {/* Botão principal */}
      <Card>
        <CardContent className="flex flex-col items-center py-8 text-center">
          <Cpu className="h-12 w-12 text-primary mb-4" />
          <h3 className="font-semibold text-lg mb-2">Análise Inteligente de Treino</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Compara o programa planejado com o que foi executado, avalia suas medições e gera recomendações personalizadas.
          </p>
          <Button
            size="lg"
            onClick={() => gerarMutation.mutate()}
            disabled={gerarMutation.isPending}
            className="gap-2"
          >
            {gerarMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analisando seus dados...
              </>
            ) : (
              <>
                <Cpu className="h-4 w-4" />
                Gerar Análise com IA
              </>
            )}
          </Button>
          {gerarMutation.isPending && (
            <p className="text-xs text-muted-foreground mt-3">
              Isso pode levar alguns segundos...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resultado atual */}
      {currentAnalysis && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Análise Gerada</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(currentAnalysis.analysis_text)}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copiar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => gerarMutation.mutate()}
                  disabled={gerarMutation.isPending}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Nova
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{currentAnalysis.analysis_text}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico */}
      {historico.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Análises Anteriores</h3>
          <div className="space-y-2">
            {historico.map(a => (
              <Card key={a.id}>
                <CardContent className="p-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === a.id ? null : a.id)}
                  >
                    <div>
                      <p className="text-sm font-medium">{formatDateTime(a.created_at)}</p>
                      {expandedId !== a.id && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {a.preview}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={e => { e.stopPropagation(); copyToClipboard(a.analysis_text ?? a.preview ?? '') }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      {expandedId === a.id
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {expandedId === a.id && a.analysis_text && (
                    <div className="mt-3 pt-3 border-t prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{a.analysis_text}</ReactMarkdown>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
