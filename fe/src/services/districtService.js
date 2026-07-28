import { apiRequest, getAuthToken } from './apiClient';

// ── Locations ──────────────────────────────────────────────
export const getAllDistricts = () => {
  if (!getAuthToken()) return Promise.resolve([]);
  return apiRequest('/locations');
};

export const getDistrictById = (id) => {
  if (!getAuthToken()) return Promise.resolve(null);
  return apiRequest(`/locations/${id}`);
};

export const searchDistricts = (query) =>
  getAllDistricts().then((list) => {
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter((d) => d.name.toLowerCase().includes(q));
  });

export const addDistrict = (name) => apiRequest('/locations', { method: 'POST', body: { name } });

export const updateDistrict = (id, name) => apiRequest(`/locations/${id}`, { method: 'PUT', body: { name } });

export const deleteDistrict = (id) => apiRequest(`/locations/${id}`, { method: 'DELETE' });
