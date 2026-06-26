import api from './axios'

export const exerciciosApi = {
  list: (params?: { muscle_group?: string; search?: string }) =>
    api.get('/cadastros/exercicios', { params }),
  create: (data: Record<string, unknown>) => api.post('/cadastros/exercicios', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/cadastros/exercicios/${id}`, data),
  toggle: (id: number) => api.patch(`/cadastros/exercicios/${id}/toggle`),
  carregarPadrao: () => api.post('/cadastros/exercicios/carregar-padrao'),
  importar: (exercicios: Record<string, unknown>[]) =>
    api.post('/cadastros/exercicios/importar', { exercicios }),
}

export const atletaApi = {
  get: () => api.get('/cadastros/atleta'),
  create: (data: Record<string, unknown>) => api.post('/cadastros/atleta', data),
  update: (data: Record<string, unknown>) => api.put('/cadastros/atleta', data),
}

export const academiaApi = {
  list: () => api.get('/cadastros/academias'),
  create: (data: Record<string, unknown>) => api.post('/cadastros/academias', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/cadastros/academias/${id}`, data),
  toggle: (id: number) => api.patch(`/cadastros/academias/${id}/toggle`),
}
