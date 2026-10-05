import api from '../api/axiosClient';
export const orderService = {
  list: async (params) => {
    const r = await api.get('/orders', { params });
    return { data: r.data.data, pagination: r.data.pagination };
  },
  detail: async (id) => (await api.get(`/orders/${id}`)).data.data,
  create: async (data) => (await api.post('/orders', data)).data.data,
  update: async (id, data) => (await api.put(`/orders/${id}`, data)).data.data,
  changeStatus: async (id, status) =>
    (await api.patch(`/orders/${id}/status`, { status })).data.data,
  pay: async (id, data) => (await api.post(`/orders/${id}/payment`, data)).data.data,
};
