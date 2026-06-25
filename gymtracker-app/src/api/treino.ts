import api from './axios'

export const programasApi = {
  list: (params?: { status?: string }) => api.get('/treino/programas', { params }),
  getAtivo: () => api.get('/treino/programas/ativo'),
  get: (id: number) => api.get(`/treino/programas/${id}`),
  create: (data: Record<string, unknown>) => api.post('/treino/programas', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/treino/programas/${id}`, data),
  resumo: (id: number) => api.get(`/treino/programas/${id}/resumo`),
  duplicar: (id: number) => api.post(`/treino/programas/${id}/duplicar`),
  progressao: (id: number, percentual: number) =>
    api.post(`/treino/programas/${id}/progressao`, { percentual }),
}

export const diasApi = {
  list: (params?: { status?: string; week?: number; block?: string }) =>
    api.get('/treino/dias', { params }),
  proximo: () => api.get('/treino/dias/proximo'),
  ultimo: () => api.get('/treino/dias/ultimo'),
  get: (id: number) => api.get(`/treino/dias/${id}`),
  iniciar: (id: number) => api.patch(`/treino/dias/${id}/iniciar`),
  concluir: (id: number, data: Record<string, unknown>) =>
    api.patch(`/treino/dias/${id}/concluir`, data),
  falta: (id: number) => api.patch(`/treino/dias/${id}/falta`),
  rascunho: (id: number, data: Record<string, unknown>) =>
    api.patch(`/treino/dias/${id}/rascunho`, data),
  reverter: (id: number) => api.patch(`/treino/dias/${id}/reverter`),
  marcarRealizado: (id: number) => api.patch(`/treino/dias/${id}/marcar-realizado`),
  updateExercicio: (dayId: number, exId: number, data: Record<string, unknown>) =>
    api.patch(`/treino/dias/${dayId}/exercicios/${exId}`, data),
  updateExercicioPlano: (dayId: number, exId: number, data: Record<string, unknown>) =>
    api.patch(`/treino/dias/${dayId}/exercicios/${exId}/plano`, data),
}
