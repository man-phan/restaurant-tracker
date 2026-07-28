import { apiRequest, getAuthToken } from './apiClient';

/**
 * Unified search across restaurants, dishes, and districts.
 * Returns results grouped by district for dishes/restaurants.
 */
export const searchAll = (query) => {
  const q = query.trim();
  if (!q) {
    return Promise.resolve({ restaurantMatches: [], dishMatches: [], districtMatches: [], locationMatches: [] });
  }

  if (!getAuthToken()) {
    return Promise.resolve({ restaurantMatches: [], dishMatches: [], districtMatches: [], locationMatches: [] });
  }

  return apiRequest(`/search?q=${encodeURIComponent(q)}`);
};

/**
 * Group dish matches by district for the search results page.
 */
export const groupDishMatchesByDistrict = (dishMatches) => {
  const grouped = {};
  dishMatches.forEach((dish) => {
    const districtId = dish.district?.id || 'unknown';
    const districtName = dish.district?.name || 'Unknown District';
    if (!grouped[districtId]) {
      grouped[districtId] = { districtId, districtName, restaurants: {} };
    }
    const rId = dish.restaurant?.id;
    if (rId && !grouped[districtId].restaurants[rId]) {
      grouped[districtId].restaurants[rId] = { restaurant: dish.restaurant, dishes: [] };
    }
    if (rId) grouped[districtId].restaurants[rId].dishes.push(dish);
  });
  return Object.values(grouped).map((g) => ({
    ...g,
    restaurants: Object.values(g.restaurants),
  }));
};
