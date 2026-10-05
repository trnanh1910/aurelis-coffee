import api from '../api/axiosClient';
export const tableService = {
  list: async (params) => (await api.get('/tables', { params })).data.data,
  detail: async (id) => (await api.get(`/tables/${id}`)).data.data,
  create: async (data) => (await api.post('/tables', data)).data.data,
  update: async (id, data) => (await api.put(`/tables/${id}`, data)).data.data,
  changeStatus: async (id, status) =>
    (await api.patch(`/tables/${id}/status`, { status })).data.data,
};
