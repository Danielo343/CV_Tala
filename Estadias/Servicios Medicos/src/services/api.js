import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const registrosService = {
  getAll: () => api.get('/registros'),
  getById: (id) => api.get(`/registros/${id}`),
  create: (registro) => api.post('/registros', registro),
  update: (id, registro) => api.put(`/registros/${id}`, registro),
  delete: (id) => api.delete(`/registros/${id}`)
};

export default api;