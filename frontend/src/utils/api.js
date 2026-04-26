import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000,
})

export const generateContent = (data) =>
  api.post('/genai/generate', data).then(r => r.data)

export const getContentTypes = () =>
  api.get('/genai/content-types').then(r => r.data)

export const getTones = () =>
  api.get('/genai/tones').then(r => r.data)

export const createCampaignPlan = (data) =>
  api.post('/agentic/plan', data).then(r => r.data)

export const getExampleGoals = () =>
  api.get('/agentic/goals/examples').then(r => r.data)

// ── History API ──────────────────────────────────────────────
export const getHistory = (type = 'all', limit = 50) =>
  api.get('/history/sessions', { params: { type, limit } }).then(r => r.data)

export const searchHistory = (query, type = 'all', limit = 10) =>
  api.get('/history/search', { params: { q: query, type, limit } }).then(r => r.data)

export const getSessionById = (id, type = 'all') =>
  api.get(`/history/sessions/${id}`, { params: { type } }).then(r => r.data)

export const deleteSession = (id, type = 'all') =>
  api.delete(`/history/sessions/${id}`, { params: { type } }).then(r => r.data)

export default api
