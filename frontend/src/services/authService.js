import api from '../api/axiosClient';
export const authService = {
  login: async (p) => (await api.post('/auth/login', p)).data.data,
  me: async () => (await api.get('/auth/me')).data.data,
  register: async (p) => (await api.post('/auth/register', p)).data.data,
  updateProfile: async (p) => (await api.put('/auth/profile', p)).data.data,
  changePassword: async (p) => (await api.put('/auth/change-password', p)).data.data,
  logout: async () => (await api.post('/auth/logout')).data.data,
};
