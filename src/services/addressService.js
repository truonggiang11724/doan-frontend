import api from './api.js';

export const addressService = {
  getAddresses: () => api.get('/addresses'),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.patch(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/addresses/${id}/default`),
  getProvinces: () => api.get('/addresses/provinces'),
  getWardsByProvince: (provinceId) => api.get(`/addresses/provinces/${provinceId}/wards`),
  getWardDetail: (wardId) => api.get(`/addresses/wards/${wardId}`),
};