import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Dumbbell, ClipboardList, Settings,
  Users, Building2, ChevronDown, ChevronRight,
  Activity, BarChart3, Cpu, Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

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
  { to: '/configuracoes', icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState<string[]>(['Cadastros', 'Treino'])

  const toggle = (label: string) =>
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
      <div className="flex h-16 items-center px-6 border-b">
        <span className="text-lg font-bold">GymTracker 16W</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => {
          if (item.to) {
            const active = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          }

          const isOpen = expanded.includes(item.label)
          const anyActive = item.children?.some(c => pathname.startsWith(c.to))

          return (
            <div key={item.label}>
              <button
                onClick={() => toggle(item.label)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  anyActive ? 'text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
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
                          active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
    </aside>
  )
}
