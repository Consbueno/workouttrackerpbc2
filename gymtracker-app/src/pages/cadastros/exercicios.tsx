import { useState, useMemo, useRef, ChangeEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Power, Upload, Download, ListChecks } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { exerciciosApi } from '@/api/cadastros'
import { MUSCLE_GROUPS, EQUIPMENT_OPTIONS, EXERCISE_TYPES } from '@/lib/constants'
import { toast } from '@/hooks/use-toast'

interface Exercise {
  id: number; name: string; primary_muscle_group: string; secondary_muscle_group?: string
  equipment: string; exercise_type: string; notes?: string; is_active: boolean
}

const emptyForm = {
  name: '', primary_muscle_group: '', secondary_muscle_group: '',
  equipment: '', exercise_type: '', notes: '', is_active: true,
}

export default function ExerciciosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [importOpen, setImportOpen] = useState(false)
  const [importJson, setImportJson] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { data: exercises = [], isLoading } = useQuery<Exercise[]>({
    queryKey: ['exercicios'],
    queryFn: () => exerciciosApi.list().then(r => r.data.data),
  })

  const filtered = useMemo(() => {
    return exercises.filter(ex => {
      const matchSearch = search === '' || ex.name.toLowerCase().includes(search.toLowerCase())
      const matchMuscle = muscleFilter === 'all' || ex.primary_muscle_group === muscleFilter
      return matchSearch && matchMuscle
    })
  }, [exercises, search, muscleFilter])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (ex: Exercise) => {
    setEditing(ex)
    setForm({
      name: ex.name, primary_muscle_group: ex.primary_muscle_group,
      secondary_muscle_group: ex.secondary_muscle_group ?? '',
      equipment: ex.equipment, exercise_type: ex.exercise_type,
      notes: ex.notes ?? '', is_active: ex.is_active,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        secondary_muscle_group: form.secondary_muscle_group || null,
        notes: form.notes || null,
      }
      if (editing) return exerciciosApi.update(editing.id, payload)
      return exerciciosApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exercicios'] })
      setDialogOpen(false)
      toast({ title: editing ? 'Exercício atualizado!' : 'Exercício criado!' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erro ao salvar.'
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => exerciciosApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercicios'] }),
  })

  const carregarPadraoMutation = useMutation({
    mutationFn: () => exerciciosApi.carregarPadrao(),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['exercicios'] })
      setImportOpen(false)
      const { criados, ignorados } = res.data
      toast({ title: `${criados} adicionado(s), ${ignorados} já existia(m).` })
    },
    onError: () => toast({ title: 'Erro ao carregar lista padrão.', variant: 'destructive' }),
  })

  const importarMutation = useMutation({
    mutationFn: () => {
      let parsed: Record<string, unknown>[]
      try { parsed = JSON.parse(importJson) } catch { throw new Error('JSON inválido.') }
      if (!Array.isArray(parsed)) throw new Error('O JSON deve ser um array de exercícios.')
      return exerciciosApi.importar(parsed)
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['exercicios'] })
      setImportOpen(false)
      setImportJson('')
      const { criados, ignorados } = res.data
      toast({ title: `${criados} importado(s), ${ignorados} já existia(m).` })
    },
    onError: (err: unknown) => {
      const msg = (err as Error).message ?? 'Erro ao importar.'
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    },
  })

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImportJson(ev.target?.result as string)
    reader.readAsText(file)
  }

  const typeLabel = (t: string) => EXERCISE_TYPES.find(e => e.value === t)?.label ?? t

  return (
    <div>
      <PageHeader
        title="Exercícios"
        description="Gerencie sua biblioteca de exercícios."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-1" />Importar
            </Button>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Novo Exercício</Button>
          </div>
        }
      />

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exercício..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={muscleFilter} onValueChange={setMuscleFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Grupo muscular" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os grupos</SelectItem>
            {MUSCLE_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-16 pt-4" /></Card>)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-10 text-muted-foreground">
            {search ? `Nenhum exercício encontrado para "${search}".` : 'Nenhum exercício cadastrado. Comece adicionando seus exercícios.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(ex => (
            <Card key={ex.id} className={!ex.is_active ? 'opacity-50' : ''}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{ex.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">{ex.primary_muscle_group}</Badge>
                    <Badge variant="secondary" className="text-xs">{ex.equipment}</Badge>
                    <Badge variant="secondary" className="text-xs">{typeLabel(ex.exercise_type)}</Badge>
                    {!ex.is_active && <Badge variant="destructive" className="text-xs">Inativo</Badge>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(ex)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => toggleMutation.mutate(ex.id)}>
                    <Power className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Importar */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar Exercícios</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="border-dashed">
              <CardContent className="pt-4 space-y-2">
                <p className="text-sm font-medium">Lista padrão V-Taper (36 exercícios)</p>
                <p className="text-xs text-muted-foreground">Carrega todos os exercícios do programa 16 semanas. Exercícios já existentes são ignorados.</p>
                <Button
                  className="w-full"
                  onClick={() => carregarPadraoMutation.mutate()}
                  disabled={carregarPadraoMutation.isPending}
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  {carregarPadraoMutation.isPending ? 'Carregando...' : 'Carregar lista padrão'}
                </Button>
              </CardContent>
            </Card>

            <div className="relative flex items-center gap-2">
              <div className="flex-1 border-t" />
              <span className="text-xs text-muted-foreground px-2">ou importar JSON</span>
              <div className="flex-1 border-t" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3 w-3 mr-1" />Abrir arquivo
                </Button>
                <a
                  href="/template-vtaper-16w.json"
                  download
                  className="text-xs text-primary underline underline-offset-2"
                >
                  <Download className="h-3 w-3 inline mr-1" />baixar template
                </a>
                <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
              </div>
              <Textarea
                placeholder={'[\n  {\n    "name": "Nome do exercício",\n    "primary_muscle_group": "Peito",\n    "equipment": "dumbbell",\n    "exercise_type": "compound"\n  }\n]'}
                rows={8}
                className="font-mono text-xs resize-none"
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setImportOpen(false); setImportJson('') }}>Cancelar</Button>
            <Button
              onClick={() => importarMutation.mutate()}
              disabled={importarMutation.isPending || !importJson.trim()}
            >
              {importarMutation.isPending ? 'Importando...' : 'Importar JSON'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Exercício' : 'Novo Exercício'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome do exercício *</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                maxLength={100}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Grupo muscular principal *</Label>
                <Select value={form.primary_muscle_group} onValueChange={v => setForm(f => ({ ...f, primary_muscle_group: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>{MUSCLE_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Grupo secundário</Label>
                <Select value={form.secondary_muscle_group} onValueChange={v => setForm(f => ({ ...f, secondary_muscle_group: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {MUSCLE_GROUPS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Equipamento *</Label>
                <Select value={form.equipment} onValueChange={v => setForm(f => ({ ...f, equipment: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>{EQUIPMENT_OPTIONS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select value={form.exercise_type} onValueChange={v => setForm(f => ({ ...f, exercise_type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                  <SelectContent>{EXERCISE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                className="mt-1 resize-none"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                maxLength={500}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))}
              />
              <Label>Exercício ativo</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.name || !form.primary_muscle_group || !form.equipment || !form.exercise_type}
            >
              {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
