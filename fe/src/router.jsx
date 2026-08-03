import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const DistrictBrowserPage = lazy(() => import('./pages/DistrictBrowserPage'));
const DistrictDetailPage = lazy(() => import('./pages/DistrictDetailPage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));

const Router = () => (
  <Suspense fallback={<LoadingSpinner fullPage />}>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/districts" element={<DistrictBrowserPage />} />
        <Route path="/districts/:id" element={<DistrictDetailPage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
        <Route path="/profile" element={<AccountPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>
    </Routes>
  </Suspense>
);

export default Router;
