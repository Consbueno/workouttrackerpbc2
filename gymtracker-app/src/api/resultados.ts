import api from './axios'

export const medicoesApi = {
  list: (params?: { from?: string; to?: string }) =>
    api.get('/resultados/medicoes', { params }),
  create: (data: Record<string, unknown>) => api.post('/resultados/medicoes', data),
  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/resultados/medicoes/${id}`, data),
  evolucao: () => api.get('/resultados/medicoes/evolucao'),
}
