import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import NotificationToast from './components/NotificationToast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Discover from './pages/Discover';
import TenantDashboard from './pages/TenantDashboard';
import LandlordDashboard from './pages/LandlordDashboard';

import MaintenanceView from './pages/MaintenanceView';

import UnitDetailView from './pages/UnitDetailView';
import CreatePropertyView from './pages/CreatePropertyView';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/unit/:id" element={<UnitDetailView />} />
            <Route path="/maintenance" element={<MaintenanceView />} />
            
                      <Route element={<GuestRoute />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                      </Route>
            <Route element={<ProtectedRoute allowedRoles={['tenant']} />}>
              <Route path="/my-bookings" element={<TenantDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['landlord']} />}>
              <Route path="/landlord-dashboard" element={<LandlordDashboard />} />
              <Route path="/landlord-dashboard/create-property" element={<CreatePropertyView />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <NotificationToast />
    </>
  );
}

export default App;