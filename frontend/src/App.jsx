import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminServices from './pages/AdminServices';
import AdminInvoices from './pages/AdminInvoices';
import ImeiCheck from './pages/ImeiCheck';
import AddFunds from './pages/AddFunds';
import Orders from './pages/Orders';
import Invoices from './pages/Invoices';
import Profile from './pages/Profile';
import ApiKeys from './pages/ApiKeys';
import RoleRoute from './components/RoleRoute';

function ProtectedRoute({ children }) {
  const { token, authLoading } = useAuth();
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function DashboardEntry() {
  const { user } = useAuth();
  if (user?.user_type === 'admin' || user?.user_type === 'superadmin') {
    return <AdminDashboard />;
  }
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardEntry />} />
            <Route path="imei-check" element={<ImeiCheck />} />
            <Route path="add-funds" element={<AddFunds />} />
            <Route path="orders" element={<Orders />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="api-access" element={<ApiKeys />} />
            <Route path="profile" element={<Profile />} />
            <Route
              path="admin/services"
              element={(
                <RoleRoute allowed={['admin', 'superadmin']}>
                  <AdminServices />
                </RoleRoute>
              )}
            />
            <Route
              path="admin/users"
              element={(
                <RoleRoute allowed={['superadmin']}>
                  <AdminUsers />
                </RoleRoute>
              )}
            />
            <Route
              path="admin/invoices"
              element={(
                <RoleRoute allowed={['superadmin']}>
                  <AdminInvoices />
                </RoleRoute>
              )}
            />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
