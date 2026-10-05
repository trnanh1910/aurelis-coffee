import api from '../api/axiosClient';
export const productService = {
  list: async (params = {}) => (await api.get('/products', { params })).data,
  detail: async (id) => (await api.get(`/products/${id}`)).data.data,
  create: async (fd) =>
    (await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } })).data
      .data,
  update: async (id, fd) =>
    (await api.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }))
      .data.data,
  remove: async (id) => (await api.delete(`/products/${id}`)).data,
};
