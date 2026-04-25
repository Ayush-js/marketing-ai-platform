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

export default api
