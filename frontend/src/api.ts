import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cs_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cs_token");
      localStorage.removeItem("cs_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (username: string, password: string) =>
  api.post("/auth/login", new URLSearchParams({ username, password }), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

export const getMe = () => api.get("/auth/me");

// Dashboard
export const getDashboardStats = () => api.get("/dashboard/stats");

// Assets
export const getAssets = () => api.get("/assets/");

// Events
export const getEvents = (limit = 50) => api.get(`/events/?limit=${limit}`);
export const getRecentEvents = (hours = 24) => api.get(`/events/recent?hours=${hours}`);

// Alerts
export const getAlerts = (status?: string) =>
  api.get(`/alerts/${status ? `?status=${status}` : ""}`);
export const acknowledgeAlert = (id: string) =>
  api.put(`/alerts/${id}/acknowledge`);
export const resolveAlert = (id: string, notes?: string) =>
  api.put(`/alerts/${id}/resolve`, { status: "resolved", resolution_notes: notes || null });
export const dismissAlert = (id: string) =>
  api.put(`/alerts/${id}/dismiss`);

// Sessions
export const getActiveSessions = () => api.get("/sessions/active");
export const getSessions = (status?: string) =>
  api.get(`/sessions/${status ? `?status=${status}` : ""}`);
export const revokeSession = (id: string, reason?: string) =>
  api.post(`/sessions/${id}/revoke${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`);

// Settings
export const getSettings = () => api.get("/settings/");
export const updateSettings = (data: Record<string, unknown>) => api.put("/settings/", data);

// API Keys
export const getApiKeys = () => api.get("/api-keys/");
export const createApiKey = (name: string, scopes?: string) =>
  api.post("/api-keys/", { name, scopes: scopes || null });
export const deleteApiKey = (id: string) => api.delete(`/api-keys/${id}`);

// Reports
export const exportEventsCsv = (hours = 24) =>
  api.get(`/reports/events/csv?hours=${hours}`, { responseType: "blob" });
export const exportEventsJson = (hours = 24) =>
  api.get(`/reports/events/json?hours=${hours}`, { responseType: "blob" });
