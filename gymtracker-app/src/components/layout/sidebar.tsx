import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Dumbbell, ClipboardList, Settings,
  Users, Building2, ChevronDown, ChevronRight,
  Activity, BarChart3, Cpu, Wrench, PanelLeftClose, PanelLeftOpen,
  LogOut, BrainCircuit,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useAppStore } from '@/stores/app-store'
import { useAuthStore } from '@/stores/auth-store'

interface NavItem {
  to?: string
  icon: React.ElementType
  label: string
  children?: { to: string; label: string; icon: React.ElementType }[]
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  {
    icon: ClipboardList,
    label: 'Cadastros',
    children: [
      { to: '/cadastros/exercicios', label: 'Exercícios', icon: Dumbbell },
      { to: '/cadastros/atleta', label: 'Atleta', icon: Users },
      { to: '/cadastros/academia', label: 'Academia', icon: Building2 },
    ],
  },
  {
    icon: Activity,
    label: 'Treino',
    children: [
      { to: '/treino/manutencao', label: 'Manutenção', icon: Wrench },
      { to: '/treino/execucao', label: 'Treino do Dia', icon: Dumbbell },
      { to: '/treino/resultados', label: 'Resultados', icon: BarChart3 },
      { to: '/treino/analise', label: 'Análise IA', icon: Cpu },
    ],
  },
  { to: '/treinador', icon: BrainCircuit, label: 'Treinador' },
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const { user, logout } = useAuthStore()
  const [expanded, setExpanded] = useState<string[]>(['Cadastros', 'Treino'])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleGroup = (label: string) =>
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])

  const collapsed = sidebarCollapsed

  return (
    <aside className={cn(
      'hidden md:flex md:flex-col md:fixed md:inset-y-0 border-r bg-background transition-all duration-200',
      collapsed ? 'md:w-16' : 'md:w-64'
    )}>
      {/* Header com botão de rebater */}
      <div className={cn(
        'flex h-16 items-center border-b shrink-0',
        collapsed ? 'justify-center px-0' : 'justify-between px-4'
      )}>
        {!collapsed && (
          <span className="text-base font-bold truncate">GymTracker 16W</span>
        )}
        <button
          onClick={toggleSidebar}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
        >
          {collapsed
            ? <PanelLeftOpen className="h-4 w-4" />
            : <PanelLeftClose className="h-4 w-4" />
          }
        </button>
      </div>

      {/* Navegação */}
      <nav className={cn('flex-1 overflow-y-auto py-4 space-y-1 min-h-0', collapsed ? 'px-2' : 'px-3')}>
        {navItems.map(item => {
          if (item.to) {
            const active = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center rounded-md py-2 text-sm font-medium transition-colors',
                  collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            )
          }

          const isOpen = expanded.includes(item.label) && !collapsed
          const anyActive = item.children?.some(c => pathname.startsWith(c.to))

          if (collapsed) {
            // No modo colapsado, mostrar apenas os ícones dos filhos ativos ou o ícone do grupo
            return (
              <div key={item.label} className="space-y-1">
                {item.children?.map(child => {
                  const active = pathname === child.to || pathname.startsWith(child.to)
                  return (
                    <Link
                      key={child.to}
                      to={child.to}
                      title={child.label}
                      className={cn(
                        'flex items-center justify-center rounded-md py-2 text-sm transition-colors',
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <child.icon className="h-4 w-4" />
                    </Link>
                  )
                })}
              </div>
            )
          }

          return (
            <div key={item.label}>
              <button
                onClick={() => toggleGroup(item.label)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  anyActive ? 'text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {isOpen && (
                <div className="ml-7 mt-1 space-y-1">
                  {item.children?.map(child => {
                    const active = pathname === child.to || pathname.startsWith(child.to)
                    return (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <child.icon className="h-3.5 w-3.5" />
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      {/* Rodapé: email + logout */}
      <div className={cn(
        'shrink-0 border-t',
        collapsed ? 'px-2 py-3 flex justify-center' : 'px-3 py-3'
      )}>
        {collapsed ? (
          <button
            onClick={handleLogout}
            title={`Sair (${user?.email ?? ''})`}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{user?.email ?? '—'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sair"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
