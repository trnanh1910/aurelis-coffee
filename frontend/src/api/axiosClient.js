import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 12000,
});
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('aurelis_token') || sessionStorage.getItem('aurelis_token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401) {
      for (const storage of [localStorage, sessionStorage]) {
        storage.removeItem('aurelis_token');
        storage.removeItem('aurelis_user');
      }
    }
    return Promise.reject(e);
  },
);
export default api;
