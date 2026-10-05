import api from '../api/axiosClient';
export const branchService = {
  list: async () => (await api.get('/branches')).data.data,
  detail: async (id) => (await api.get(`/branches/${id}`)).data.data,
  create: async (data) =>
    (await api.post('/branches', data, { headers: { 'Content-Type': 'multipart/form-data' } })).data
      .data,
  update: async (id, data) =>
    (await api.put(`/branches/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }))
      .data.data,
  remove: async (id) => (await api.delete(`/branches/${id}`)).data,
};
