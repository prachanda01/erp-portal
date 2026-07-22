import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Challans } from './pages/Challans';
import { CreateChallan } from './pages/CreateChallan';
import { ChallanDetail } from './pages/ChallanDetail';
import { AuditLogs } from './pages/AuditLogs';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090f1e] flex items-center justify-center">
        <LoadingSpinner message="Authenticating portal session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login initialRegister={true} />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="customers/:id" element={<CustomerDetail />} />
              <Route path="products" element={<Products />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="challans" element={<Challans />} />
              <Route path="challans/create" element={<CreateChallan />} />
              <Route path="challans/:id" element={<ChallanDetail />} />
              <Route
                path="audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'ACCOUNTS']}>
                    <AuditLogs />
                  </ProtectedRoute>
                }
              />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
