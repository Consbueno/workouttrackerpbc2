import { useQuery } from '@tanstack/react-query'
import { programasApi, diasApi } from '@/api/treino'

export function useActiveProgram() {
  return useQuery({
    queryKey: ['programa-ativo'],
    queryFn: () => programasApi.getAtivo().then(r => r.data.data),
    staleTime: 60_000,
  })
}

export function useNextDay() {
  return useQuery({
    queryKey: ['proximo-dia'],
    queryFn: () => diasApi.proximo().then(r => r.data.data),
    staleTime: 30_000,
  })
}

export function useDay(id: number | undefined) {
  return useQuery({
    queryKey: ['dia', id],
    queryFn: () => diasApi.get(id!).then(r => r.data.data),
    enabled: !!id,
  })
}

export function useLastDay() {
  return useQuery({
    queryKey: ['ultimo-dia'],
    queryFn: () => diasApi.ultimo().then(r => r.data.data),
    staleTime: 10_000,
  })
}

export function useProgramSummary(id: number | undefined) {
  return useQuery({
    queryKey: ['programa-resumo', id],
    queryFn: () => programasApi.resumo(id!).then(r => r.data.data),
    enabled: !!id,
  })
}
