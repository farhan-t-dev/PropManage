import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ConsoleLayout from "./layouts/ConsoleLayout";
import { GuestRoute, ProtectedRoute } from "./components/ProtectedRoute";
import { useAuthStore } from "./store/authStore";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Discover from "./pages/Discover";
import UnitDetailView from "./pages/UnitDetailView";
import MaintenanceView from "./pages/MaintenanceView";
import TenantDashboard from "./pages/TenantDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import CreatePropertyView from "./pages/CreatePropertyView";
import DocumentVault from "./pages/DocumentVault";
import NotFound from "./pages/NotFound";

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing surface — no console chrome */}
        <Route path="/" element={<Home />} />

        {/* Auth screens — their own split layout */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* The console */}
        <Route element={<ConsoleLayout />}>
          <Route path="/discover" element={<Discover />} />
          <Route path="/unit/:id" element={<UnitDetailView />} />
          <Route path="/maintenance" element={<MaintenanceView />} />

          <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
            <Route path="/my-bookings" element={<TenantDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["landlord"]} />}>
            <Route
              path="/landlord-dashboard"
              element={<LandlordDashboard />}
            />
            <Route
              path="/landlord-dashboard/create-property"
              element={<CreatePropertyView />}
            />
            <Route path="/documents" element={<DocumentVault />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
