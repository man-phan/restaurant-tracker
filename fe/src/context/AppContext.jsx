import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getAllDistricts,
  addDistrict as svcAddDistrict,
  updateDistrict as svcUpdateDistrict,
  deleteDistrict as svcDeleteDistrict,
} from '../services/districtService';
import {
  getAllRestaurants,
  addRestaurant as svcAddRestaurant,
  updateRestaurant as svcUpdateRestaurant,
  deleteRestaurant as svcDeleteRestaurant,
} from '../services/restaurantService';
import {
  getAllDishes,
  addDish as svcAddDish,
  updateDish as svcUpdateDish,
  deleteDish as svcDeleteDish,
} from '../services/dishService';

const readAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [districts, setDistricts] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial load from API
  useEffect(() => {
    const syncData = async () => {
      const token = readAuthToken();

      if (!token) {
        setDistricts([]);
        setRestaurants([]);
        setDishes([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const [d, r, di] = await Promise.all([getAllDistricts(), getAllRestaurants(), getAllDishes()]);
        setDistricts(d);
        setRestaurants(r);
        setDishes(di);

      } catch {
        setDistricts([]);
        setRestaurants([]);
        setDishes([]);
      } finally {
        setLoading(false);
      }
    };

    const handleAuthChanged = () => {
      syncData();
    };

    syncData();
    window.addEventListener('auth-changed', handleAuthChanged);
    window.addEventListener('storage', handleAuthChanged);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
      window.removeEventListener('storage', handleAuthChanged);
    };
  }, []);

  const refreshDistricts = useCallback(() => getAllDistricts().then(setDistricts), []);
  const refreshRestaurants = useCallback(() => getAllRestaurants().then(setRestaurants), []);
  const refreshDishes = useCallback(() => getAllDishes().then(setDishes), []);

  const addDistrict = useCallback(async (name) => {
    const newD = await svcAddDistrict(name);
    setDistricts((prev) => [newD, ...prev.filter((d) => String(d.id) !== String(newD.id))]);
    return newD;
  }, []);

  const updateDistrict = useCallback(async (id, name) => {
    const updated = await svcUpdateDistrict(id, name);
    setDistricts((prev) => prev.map((d) => (String(d.id) === String(id) ? updated : d)));
    return updated;
  }, []);

  const deleteDistrict = useCallback(async (id) => {
    const removed = await svcDeleteDistrict(id);
    setDistricts((prev) => prev.filter((d) => String(d.id) !== String(id)));
    setRestaurants((prev) => prev.filter((r) => String(r.district_id) !== String(id)));
    return removed;
  }, []);

  const addRestaurant = useCallback(async (data) => {
    const newR = await svcAddRestaurant(data);
    setRestaurants((prev) => [newR, ...prev.filter((r) => String(r.id) !== String(newR.id))]);
    return newR;
  }, []);

  const updateRestaurant = useCallback(async (id, data) => {
    const updated = await svcUpdateRestaurant(id, data);
    setRestaurants((prev) => prev.map((r) => (String(r.id) === String(id) ? updated : r)));
    return updated;
  }, []);

  const deleteRestaurant = useCallback(async (id) => {
    const removed = await svcDeleteRestaurant(id);
    setRestaurants((prev) => prev.filter((r) => String(r.id) !== String(id)));
    setDishes((prev) => prev.filter((d) => String(d.restaurant_id) !== String(id)));
    return removed;
  }, []);

  const addDish = useCallback(async (data) => {
    const newD = await svcAddDish(data);
    setDishes((prev) => [newD, ...prev.filter((d) => String(d.id) !== String(newD.id))]);
    return newD;
  }, []);

  const updateDish = useCallback(async (id, data) => {
    const updated = await svcUpdateDish(id, data);
    setDishes((prev) => prev.map((d) => (String(d.id) === String(id) ? updated : d)));
    return updated;
  }, []);

  const deleteDish = useCallback(async (id) => {
    const removed = await svcDeleteDish(id);
    setDishes((prev) => prev.filter((d) => String(d.id) !== String(id)));
    return removed;
  }, []);

  return (
    <AppContext.Provider
      value={{
        districts,
        restaurants,
        dishes,
        loading,
        refreshDishes,
        addDistrict,
        updateDistrict,
        deleteDistrict,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        addDish,
        updateDish,
        deleteDish,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
