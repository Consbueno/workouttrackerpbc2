import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Power, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { academiaApi } from '@/api/cadastros'
import { toast } from '@/hooks/use-toast'

interface Gym {
  id: number; name: string; address?: string; phone?: string
  monthly_fee?: number; payment_due_day?: number; preferred_schedule?: string
  notes?: string; is_active: boolean
}

const emptyForm = {
  name: '', address: '', phone: '', monthly_fee: '',
  payment_due_day: '', preferred_schedule: '', notes: '', is_active: true,
}

export default function AcademiaPage() {
  const qc = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Gym | null>(null)
  const [form, setForm] = useState(emptyForm)

  const { data: gyms = [], isLoading } = useQuery<Gym[]>({
    queryKey: ['academias'],
    queryFn: () => academiaApi.list().then(r => r.data.data),
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (g: Gym) => {
    setEditing(g)
    setForm({
      name: g.name, address: g.address ?? '', phone: g.phone ?? '',
      monthly_fee: g.monthly_fee ? String(g.monthly_fee) : '',
      payment_due_day: g.payment_due_day ? String(g.payment_due_day) : '',
      preferred_schedule: g.preferred_schedule ?? '', notes: g.notes ?? '',
      is_active: g.is_active,
    })
    setDialogOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        monthly_fee: form.monthly_fee ? parseFloat(form.monthly_fee) : null,
        payment_due_day: form.payment_due_day ? parseInt(form.payment_due_day) : null,
        address: form.address || null, phone: form.phone || null,
        preferred_schedule: form.preferred_schedule || null, notes: form.notes || null,
      }
      return editing ? academiaApi.update(editing.id, payload) : academiaApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['academias'] })
      setDialogOpen(false)
      toast({ title: editing ? 'Academia atualizada!' : 'Academia criada!' })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erro ao salvar.'
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => academiaApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['academias'] }),
  })

  return (
    <div>
      <PageHeader
        title="Academias"
        description="Gerencie as academias onde você treina."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Nova Academia</Button>}
      />

      {isLoading ? (
        <div className="space-y-2">
          {[1,2].map(i => <Card key={i} className="animate-pulse"><CardContent className="h-20 pt-4" /></Card>)}
        </div>
      ) : gyms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
            <Building2 className="h-10 w-10 mb-3" />
            <p>Nenhuma academia cadastrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {gyms.map(g => (
            <Card key={g.id} className={!g.is_active ? 'opacity-50' : ''}>
              <CardContent className="flex items-start gap-3 p-4">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{g.name}</p>
                  {g.address && <p className="text-sm text-muted-foreground truncate">{g.address}</p>}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {g.monthly_fee && (
                      <Badge variant="outline" className="text-xs">
                        R$ {Number(g.monthly_fee).toFixed(2)}/mês
                      </Badge>
                    )}
                    {g.preferred_schedule && (
                      <Badge variant="secondary" className="text-xs">{g.preferred_schedule}</Badge>
                    )}
                    {!g.is_active && <Badge variant="destructive" className="text-xs">Inativa</Badge>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(g)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => toggleMutation.mutate(g.id)}>
                    <Power className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Academia' : 'Nova Academia'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da academia *</Label>
              <Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={100} />
            </div>
            <div>
              <Label>Endereço</Label>
              <Input className="mt-1" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Telefone</Label>
                <Input className="mt-1" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <Label>Mensalidade (R$)</Label>
                <Input type="number" step="0.01" className="mt-1" value={form.monthly_fee} onChange={e => setForm(f => ({ ...f, monthly_fee: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Vencimento (dia)</Label>
                <Input type="number" min="1" max="31" className="mt-1" value={form.payment_due_day} onChange={e => setForm(f => ({ ...f, payment_due_day: e.target.value }))} />
              </div>
              <div>
                <Label>Horário preferido</Label>
                <Input className="mt-1" value={form.preferred_schedule} onChange={e => setForm(f => ({ ...f, preferred_schedule: e.target.value }))} placeholder="06:00 - 07:30" />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea className="mt-1 resize-none" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Academia ativa</Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name}>
              {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
