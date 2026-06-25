import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { medicoesApi } from '@/api/resultados'
import { toast } from '@/hooks/use-toast'

const today = new Date().toISOString().split('T')[0]

const emptyForm = {
  measurement_date: today,
  weight_kg: '', body_fat_pct: '',
  neck_cm: '', shoulders_cm: '', chest_cm: '',
  right_arm_relaxed_cm: '', right_arm_flexed_cm: '',
  left_arm_relaxed_cm: '', left_arm_flexed_cm: '',
  right_forearm_cm: '', left_forearm_cm: '',
  waist_cm: '', hip_cm: '',
  right_thigh_cm: '', left_thigh_cm: '',
  right_calf_cm: '', left_calf_cm: '',
  fasting_glucose: '', systolic_bp: '', diastolic_bp: '',
  resting_hr: '', notes: '',
}

type FormKey = keyof typeof emptyForm

function Field({ label, name, form, onChange, type = 'number', step = '0.1', unit }: {
  label: string; name: FormKey; form: typeof emptyForm
  onChange: (k: FormKey, v: string) => void
  type?: string; step?: string; unit?: string
}) {
  return (
    <div>
      <Label className="text-xs">{label}{unit && <span className="text-muted-foreground ml-1">({unit})</span>}</Label>
      <Input
        type={type}
        step={step}
        min="0"
        className="mt-1 h-9 text-sm"
        value={form[name]}
        onChange={e => onChange(name, e.target.value)}
        placeholder="—"
      />
    </div>
  )
}

export default function NovaMedicaoPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const editId = params.get('edit')
  const qc = useQueryClient()
  const [form, setForm] = useState(emptyForm)

  const update = (k: FormKey, v: string) => setForm(f => ({ ...f, [k]: v }))

  const parseNum = (v: string) => v === '' ? null : parseFloat(v)
  const parseInt2 = (v: string) => v === '' ? null : parseInt(v)

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        measurement_date: form.measurement_date,
        weight_kg: parseNum(form.weight_kg),
        body_fat_pct: parseNum(form.body_fat_pct),
        neck_cm: parseNum(form.neck_cm),
        shoulders_cm: parseNum(form.shoulders_cm),
        chest_cm: parseNum(form.chest_cm),
        right_arm_relaxed_cm: parseNum(form.right_arm_relaxed_cm),
        right_arm_flexed_cm: parseNum(form.right_arm_flexed_cm),
        left_arm_relaxed_cm: parseNum(form.left_arm_relaxed_cm),
        left_arm_flexed_cm: parseNum(form.left_arm_flexed_cm),
        right_forearm_cm: parseNum(form.right_forearm_cm),
        left_forearm_cm: parseNum(form.left_forearm_cm),
        waist_cm: parseNum(form.waist_cm),
        hip_cm: parseNum(form.hip_cm),
        right_thigh_cm: parseNum(form.right_thigh_cm),
        left_thigh_cm: parseNum(form.left_thigh_cm),
        right_calf_cm: parseNum(form.right_calf_cm),
        left_calf_cm: parseNum(form.left_calf_cm),
        fasting_glucose: parseInt2(form.fasting_glucose),
        systolic_bp: parseInt2(form.systolic_bp),
        diastolic_bp: parseInt2(form.diastolic_bp),
        resting_hr: parseInt2(form.resting_hr),
        notes: form.notes || null,
      }
      if (editId) return medicoesApi.update(parseInt(editId), payload)
      return medicoesApi.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['medicoes-evolucao'] })
      qc.invalidateQueries({ queryKey: ['medicoes-lista'] })
      toast({ title: 'Medição salva com sucesso!' })
      navigate('/treino/resultados')
    },
    onError: (err: unknown) => {
      const e = err as { response?: { status?: number; data?: { error?: string } } }
      if (e?.response?.status === 409) {
        if (confirm(e.response?.data?.error + '\nDeseja editar a medição existente?')) {
          navigate('/treino/resultados')
        }
      } else {
        toast({ title: 'Erro', description: e?.response?.data?.error ?? 'Erro ao salvar.', variant: 'destructive' })
      }
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={editId ? 'Editar Medição' : 'Nova Medição'}
        description="Registre seus dados corporais e de saúde."
        actions={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Medição'}
          </Button>
        }
      />

      <Card>
        <CardHeader><CardTitle>Dados Básicos</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label className="text-xs">Data da medição *</Label>
            <Input type="date" className="mt-1 h-9" value={form.measurement_date}
              onChange={e => update('measurement_date', e.target.value)} />
          </div>
          <Field label="Peso" name="weight_kg" form={form} onChange={update} unit="kg" />
          <Field label="% Gordura" name="body_fat_pct" form={form} onChange={update} unit="%" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Circunferências</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="Pescoço" name="neck_cm" form={form} onChange={update} unit="cm" />
          <Field label="Ombros" name="shoulders_cm" form={form} onChange={update} unit="cm" />
          <Field label="Peito" name="chest_cm" form={form} onChange={update} unit="cm" />
          <Field label="Cintura" name="waist_cm" form={form} onChange={update} unit="cm" />
          <Field label="Quadril" name="hip_cm" form={form} onChange={update} unit="cm" />
          <Field label="Braço D. (relaxado)" name="right_arm_relaxed_cm" form={form} onChange={update} unit="cm" />
          <Field label="Braço D. (flexionado)" name="right_arm_flexed_cm" form={form} onChange={update} unit="cm" />
          <Field label="Braço E. (relaxado)" name="left_arm_relaxed_cm" form={form} onChange={update} unit="cm" />
          <Field label="Braço E. (flexionado)" name="left_arm_flexed_cm" form={form} onChange={update} unit="cm" />
          <Field label="Antebraço D." name="right_forearm_cm" form={form} onChange={update} unit="cm" />
          <Field label="Antebraço E." name="left_forearm_cm" form={form} onChange={update} unit="cm" />
          <Field label="Coxa D." name="right_thigh_cm" form={form} onChange={update} unit="cm" />
          <Field label="Coxa E." name="left_thigh_cm" form={form} onChange={update} unit="cm" />
          <Field label="Panturrilha D." name="right_calf_cm" form={form} onChange={update} unit="cm" />
          <Field label="Panturrilha E." name="left_calf_cm" form={form} onChange={update} unit="cm" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Indicadores de Saúde</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <Field label="Glicose em jejum" name="fasting_glucose" form={form} onChange={update} step="1" unit="mg/dL" />
          <Field label="FC repouso" name="resting_hr" form={form} onChange={update} step="1" unit="bpm" />
          <Field label="PA Sistólica" name="systolic_bp" form={form} onChange={update} step="1" unit="mmHg" />
          <Field label="PA Diastólica" name="diastolic_bp" form={form} onChange={update} step="1" unit="mmHg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            className="resize-none"
            rows={3}
            placeholder="Anotações gerais sobre a medição..."
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
          />
        </CardContent>
      </Card>

      <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
        {saveMutation.isPending ? 'Salvando...' : 'Salvar Medição'}
      </Button>
    </div>
  )
}
