import { apiRequest, getAuthToken } from './apiClient';

// Normalize DB snake_case → camelCase
const normalizeDish = (d) => ({
  ...d,
  restaurantId: d.restaurant_id ?? d.restaurantId ?? null,
  createdAt: d.created_at ?? d.createdAt ?? null,
});

// ── Dishes ─────────────────────────────────────────────────
export const getAllDishes = () =>
  (!getAuthToken()
    ? Promise.resolve([])
    : apiRequest('/dishes').then((list) => list.map(normalizeDish)));

export const getDishesByRestaurant = (restaurantId) =>
  (!getAuthToken()
    ? Promise.resolve([])
    : apiRequest(`/dishes?restaurantId=${restaurantId}`).then((list) => list.map(normalizeDish)));

export const addDish = ({ restaurantId, name, rating, note }) =>
  apiRequest('/dishes', {
    method: 'POST',
    body: { restaurantId, name, rating, note },
  }).then(normalizeDish);

export const updateDish = (id, data) =>
  apiRequest(`/dishes/${id}`, {
    method: 'PUT',
    body: data,
  }).then(normalizeDish);

export const deleteDish = (id) => apiRequest(`/dishes/${id}`, { method: 'DELETE' });
