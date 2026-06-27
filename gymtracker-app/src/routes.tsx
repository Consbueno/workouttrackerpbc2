import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { useAppStore } from '@/stores/app-store'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'

import LoginPage from '@/pages/login'
import DashboardPage from '@/pages/dashboard'
import ExerciciosPage from '@/pages/cadastros/exercicios'
import AtletaPage from '@/pages/cadastros/atleta'
import AcademiaPage from '@/pages/cadastros/academia'
import ManutencaoPage from '@/pages/treino/manutencao'
import ExecucaoPage from '@/pages/treino/execucao'
import FimCicloPage from '@/pages/treino/fim-ciclo'
import ResultadosPage from '@/pages/treino/resultados'
import NovaMedicaoPage from '@/pages/treino/nova-medicao'
import AnalisePage from '@/pages/treino/analise'
import TreinadorPage from '@/pages/treinador'
import ConfiguracoesPage from '@/pages/configuracoes'

function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useAppStore()
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={`pb-16 md:pb-0 transition-all duration-200 ${sidebarCollapsed ? 'md:pl-16' : 'md:pl-64'}`}>
        <div className="container mx-auto max-w-4xl p-4 md:p-6">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <PrivateLayout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/cadastros/exercicios" element={<ExerciciosPage />} />
                <Route path="/cadastros/atleta" element={<AtletaPage />} />
                <Route path="/cadastros/academia" element={<AcademiaPage />} />
                <Route path="/treino/manutencao" element={<ManutencaoPage />} />
                <Route path="/treino/execucao" element={<ExecucaoPage />} />
                <Route path="/treino/fim-ciclo" element={<FimCicloPage />} />
                <Route path="/treino/resultados" element={<ResultadosPage />} />
                <Route path="/treino/resultados/nova" element={<NovaMedicaoPage />} />
                <Route path="/treino/analise" element={<AnalisePage />} />
                <Route path="/treinador" element={<TreinadorPage />} />
                <Route path="/configuracoes" element={<ConfiguracoesPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PrivateLayout>
          </RequireAuth>
        }
      />
    </Routes>
  )
}
