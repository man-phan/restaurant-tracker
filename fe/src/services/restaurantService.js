import { apiRequest, getAuthToken } from './apiClient';

// Normalize DB snake_case → camelCase for consistency with existing page/component code
const normalizeRestaurant = (r) => ({
  ...r,
  locationId: r.location_id ?? r.locationId ?? null,
  districtId: r.location_id ?? r.locationId ?? null,
  fullAddress: r.full_address ?? r.fullAddress ?? null,
  createdAt: r.created_at ?? r.createdAt ?? null,
  openingHours: r.opening_hours ?? r.openingHours ?? null,
  note: r.note ?? null,
  isCharity: Boolean(r.is_charity ?? r.isCharity),
});

// ── Restaurants ────────────────────────────────────────────
export const getAllRestaurants = () =>
  (!getAuthToken()
    ? Promise.resolve([])
    : apiRequest('/restaurants').then((list) => list.map(normalizeRestaurant)));

export const getRestaurantById = (id) =>
  (!getAuthToken()
    ? Promise.resolve(null)
    : apiRequest(`/restaurants/${id}`).then(normalizeRestaurant));

export const getRestaurantsByLocation = (locationId) => {
  const url = locationId === undefined || locationId === null || locationId === ''
    ? '/restaurants'
    : `/restaurants?locationId=${encodeURIComponent(locationId)}`;

  if (!getAuthToken()) return Promise.resolve([]);

  return apiRequest(url)
    .then((list) => list.map(normalizeRestaurant));
};

export const getRestaurantsByDistrict = getRestaurantsByLocation;

export const getRecentRestaurants = (limit = 5) =>
  (!getAuthToken()
    ? Promise.resolve([])
    : apiRequest(`/restaurants/recent?limit=${limit}`)
        .then((list) => list.map(normalizeRestaurant)));

export const addRestaurant = ({ name, address, fullAddress, locationId = null, openingHours = null, note = null, isCharity = false }) =>
  apiRequest('/restaurants', {
    method: 'POST',
    body: { name, address, fullAddress, locationId, openingHours, note, isCharity },
  }).then(normalizeRestaurant);

export const updateRestaurant = (id, data) =>
  apiRequest(`/restaurants/${id}`, {
    method: 'PUT',
    body: data,
  }).then(normalizeRestaurant);

export const deleteRestaurant = (id) => apiRequest(`/restaurants/${id}`, { method: 'DELETE' });
