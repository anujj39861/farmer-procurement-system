import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginApi = (phone, password) => api.post('/auth/login', { phone, password });
export const registerApi = (data) => api.post('/auth/register', data);
export const getMeApi = (token) => api.get(`/auth/me?token=${token}`);

export const fetchCentres = () => api.get('/centres');
export const fetchCentreQueue = (centreId, status) => api.get(`/queue/${centreId}${status ? `?status=${status}` : ''}`);
export const patchQueueStatus = (tokenId, status, notes) => api.patch(`/queue/${tokenId}`, { status, notes });
export const createToken = (data) => api.post('/tokens', data);
export const fetchToken = (tokenId) => api.get(`/tokens/${tokenId}`);
export const fetchFarmerTokens = (farmerId) => api.get(`/tokens/farmer/${farmerId}`);
export const submitQuality = (data) => api.post('/quality', data);
export const submitWeighing = (data) => api.post('/weighing', data);
export const requestWeightCorrection = (tokenId, data) => api.post(`/weighing/${tokenId}/correct`, data);
export const fetchPendingCorrections = () => api.get('/weighing/pending/corrections');
export const verifyWeightCorrection = (tokenId, data) => api.post(`/weighing/${tokenId}/verify`, data);
export const confirmProcurement = (data) => api.post('/procurement', data);
export const fetchProcurementByToken = (tokenId) => api.get(`/procurement/token/${tokenId}`);
export const raiseIssue = (data) => api.post('/issues', data);
export const fetchIssues = (farmerId) => api.get(`/issues${farmerId ? `?farmer_id=${farmerId}` : ''}`);
export const fetchAuditLogs = () => api.get('/audit');
export const fetchKPIs = () => api.get('/analytics/kpis');
export const fetchAnalyticsCharts = () => api.get('/analytics/charts');
export const classifyComplaintNLP = (text) => api.post('/ml/nlp/classify', { complaint_text: text });
export const checkAnomalyML = (data) => api.post('/ml/anomaly/check', data);
