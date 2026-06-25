import { useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useLogin, useRegister } from '@/hooks/use-auth'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from '@/hooks/use-toast'

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore()
  const [params] = useSearchParams()
  const [tab, setTab] = useState(params.get('registered') ? 'login' : 'login')

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ full_name: '', email: '', password: '', confirm: '' })

  const login = useLogin()
  const register = useRegister()

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login.mutateAsync(loginData)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erro ao fazer login.'
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (registerData.password !== registerData.confirm) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' })
      return
    }
    if (registerData.password.length < 6) {
      toast({ title: 'Erro', description: 'A senha deve ter ao menos 6 caracteres.', variant: 'destructive' })
      return
    }
    try {
      await register.mutateAsync({
        full_name: registerData.full_name,
        email: registerData.email,
        password: registerData.password,
      })
      toast({ title: 'Conta criada!', description: 'Faça login para continuar.' })
      setTab('login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Erro ao criar conta.'
      toast({ title: 'Erro', description: msg, variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center mb-3">
            <Dumbbell className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">GymTracker 16W</h1>
          <p className="text-sm text-muted-foreground">Periodização por blocos</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="login" className="flex-1">Entrar</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Criar conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo de volta!</CardTitle>
                <CardDescription>Entre com seu e-mail e senha.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      value={loginData.email}
                      onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={loginData.password}
                      onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                      placeholder="••••••"
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={login.isPending}>
                    {login.isPending ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Criar conta</CardTitle>
                <CardDescription>Preencha os dados abaixo.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Label htmlFor="reg-name">Nome completo</Label>
                    <Input
                      id="reg-name"
                      required
                      value={registerData.full_name}
                      onChange={e => setRegisterData(d => ({ ...d, full_name: e.target.value }))}
                      placeholder="João Silva"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-email">E-mail</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      required
                      value={registerData.email}
                      onChange={e => setRegisterData(d => ({ ...d, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-password">Senha</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      required
                      minLength={6}
                      value={registerData.password}
                      onChange={e => setRegisterData(d => ({ ...d, password: e.target.value }))}
                      placeholder="Mínimo 6 caracteres"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reg-confirm">Confirmar senha</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      required
                      value={registerData.confirm}
                      onChange={e => setRegisterData(d => ({ ...d, confirm: e.target.value }))}
                      placeholder="••••••"
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={register.isPending}>
                    {register.isPending ? 'Criando...' : 'Criar Conta'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
