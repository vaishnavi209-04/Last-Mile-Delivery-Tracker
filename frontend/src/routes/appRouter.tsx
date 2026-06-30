// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protectedRoute';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import DashboardLayout from '../components/layout/dashboardLayout';

// Admin Pages
import AdminDashboard from '../pages/admin/dashboard';
import AdminOrders from '../pages/admin/orders/index';
import AdminAgents from '../pages/admin/agents/index';
import AdminZones from '../pages/admin/zones/index';
import AdminSettings from '../pages/admin/settings/index';

// Customer Pages
import CustomerDashboard from '../pages/customer/dashboard';
import CreateOrder from '../pages/customer/createOrder/index';
import OrderHistory from '../pages/customer/orderHistory';
import TrackingDetails from '../pages/customer/trackingDetails';

// Agent Pages
import AgentDashboard from '../pages/agent/dashboard';
import ActiveRun from '../pages/agent/activeRun';
import AssignedOrders from '../pages/agent/assignedOrders';
import OrderTracking from '../pages/agent/orderTracking';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/agents" element={<AdminAgents />} />
            <Route path="/admin/zones" element={<AdminZones />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/orders/create" element={<CreateOrder />} />
            <Route path="/customer/orders/history" element={<OrderHistory />} />
            <Route path="/customer/orders/:id" element={<TrackingDetails />} />
          </Route>
        </Route>

        {/* Agent Routes */}
        <Route element={<ProtectedRoute allowedRoles={['AGENT']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/active" element={<ActiveRun />} />
            <Route path="/agent/assigned" element={<AssignedOrders />} />
            <Route path="/agent/orders/:id" element={<OrderTracking />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};