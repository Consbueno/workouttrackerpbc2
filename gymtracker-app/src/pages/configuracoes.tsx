import { Moon, Sun, Scale, Timer, Vibrate, LogOut, Info } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'
import { useLogout } from '@/hooks/use-auth'

export default function ConfiguracoesPage() {
  const { theme, toggleTheme, units, setUnits, restTimerEnabled, setRestTimer, vibrateEnabled, setVibrate } = useAppStore()
  const logout = useLogout()

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" />

      {/* Aparência */}
      <Card>
        <CardHeader><CardTitle>Aparência</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <Label>Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</Label>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Unidades */}
      <Card>
        <CardHeader><CardTitle>Unidades</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-4 w-4" />
              <Label>Unidade de peso: <span className="font-bold">{units === 'kg' ? 'Quilogramas (kg)' : 'Libras (lb)'}</span></Label>
            </div>
            <Switch
              checked={units === 'lb'}
              onCheckedChange={v => setUnits(v ? 'lb' : 'kg')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timer de Descanso */}
      <Card>
        <CardHeader><CardTitle>Timer de Descanso</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="h-4 w-4" />
              <Label>Timer ativado</Label>
            </div>
            <Switch checked={restTimerEnabled} onCheckedChange={setRestTimer} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="h-4 w-4" />
              <Label>Vibrar ao finalizar descanso</Label>
            </div>
            <Switch checked={vibrateEnabled} onCheckedChange={setVibrate} disabled={!restTimerEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Sobre */}
      <Card>
        <CardHeader><CardTitle>Sobre</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>GymTracker 16W — v1.0.0</span>
          </div>
          <p className="text-xs text-muted-foreground pl-7">
            App de treino com periodização por blocos de 16 semanas. PWA instalável.
          </p>
        </CardContent>
      </Card>

      {/* Sair */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => {
          if (confirm('Deseja sair da sua conta?')) logout()
        }}
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sair da conta
      </Button>
    </div>
  )
}
