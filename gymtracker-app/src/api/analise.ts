import api from './axios'

export const analiseApi = {
  gerar: () => api.post('/analise/gerar'),
  historico: () => api.get('/analise/historico'),
  get: (id: number) => api.get(`/analise/${id}`),
}
