import axios from 'axios'

const isVercel = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('context-shield-protection')
const API_URL = import.meta.env.VITE_API_URL || 
  (isVercel 
    ? 'https://web-production-4831a.up.railway.app/api/v1' 
    : 'http://localhost:8000/api/v1')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('cs_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    const status = err.response?.status
    if (status === 401) {
      localStorage.removeItem('cs_token')
      localStorage.removeItem('cs_user')
      // Avoid toast loop when already on login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?reason=session_expired'
      }
    }
    return Promise.reject(err)
  }
)

export default api

// Auth
export const login = (username: string, password: string) =>
  api.post('/auth/login', new URLSearchParams({ username, password }), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

export const register = (data: {
  email: string
  password: string
  full_name: string
  tenant_id?: string
}) => api.post('/auth/register', data)

export const getMe = () => api.get('/auth/me')

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')

// Assets
export const getAssets = () => api.get('/assets/')

// Events
export const getEvents = (limit = 50) => api.get(`/events/?limit=${limit}`)
export const getRecentEvents = (hours = 24) => api.get(`/events/recent?hours=${hours}`)

// Alerts
export const getAlerts = (status?: string) =>
  api.get(`/alerts/${status ? `?status=${status}` : ''}`)
export const acknowledgeAlert = (id: string) => api.put(`/alerts/${id}/acknowledge`)
export const resolveAlert = (id: string, notes?: string) =>
  api.put(`/alerts/${id}/resolve`, { status: 'resolved', resolution_notes: notes || null })
export const dismissAlert = (id: string) => api.put(`/alerts/${id}/dismiss`)

// Sessions
export const getActiveSessions = () => api.get('/sessions/active')
export const getSessions = (status?: string) =>
  api.get(`/sessions/${status ? `?status=${status}` : ''}`)
export const revokeSession = (id: string, reason?: string) =>
  api.post(`/sessions/${id}/revoke${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`)

// Settings
export const getSettings = () => api.get('/settings/')
export const updateSettings = (data: Record<string, unknown>) => api.put('/settings/', data)

// API Keys
export const getApiKeys = () => api.get('/api-keys/')
export const createApiKey = (name: string, scopes?: string) =>
  api.post('/api-keys/', { name, scopes: scopes || null })
export const deleteApiKey = (id: string) => api.delete(`/api-keys/${id}`)

// Alerts - detail
export const getAlert = (id: string) => api.get(`/alerts/${id}`)

// Sessions
export const getSession = (id: string) => api.get(`/sessions/${id}`)

// Audit
export const getAuditLogs = (skip = 0, limit = 50) =>
  api.get(`/audit/logs?skip=${skip}&limit=${limit}`)

// Reports
export const exportEventsCsv = (hours = 24) =>
  api.get(`/reports/events/csv?hours=${hours}`, { responseType: 'blob' })
export const exportEventsJson = (hours = 24) =>
  api.get(`/reports/events/json?hours=${hours}`, { responseType: 'blob' })

// Reports - Summary & Threat Scores
export const getReportsSummary = () => api.get('/reports/summary')
export const getThreatScores = (limit = 10) => api.get(`/reports/threat-scores?limit=${limit}`)

// Access - Simulate Swipe
export const simulateSwipe = (assetId: string) => api.post(`/access/simulate-swipe/${assetId}`)
