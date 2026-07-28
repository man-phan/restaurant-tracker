import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import './AppLayout.css';

const AppLayout = () => (
  <div className="app-layout">
    <Navbar />
    <main className="app-main">
      <Outlet />
    </main>
    <BottomNav />
  </div>
);

export default AppLayout;
