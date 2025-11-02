import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/services/ServicesPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './store';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />

            {/* Auth Routes (Public only) */}
            <Route path="/login" element={
              <PublicRoute>
                <div>登录页面 - 待开发</div>
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <div>注册页面 - 待开发</div>
              </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div>仪表板页面 - 待开发</div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div>个人资料页面 - 待开发</div>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <div>订单页面 - 待开发</div>
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <div>消息页面 - 待开发</div>
              </ProtectedRoute>
            } />

            {/* Service Detail */}
            <Route path="/services/:id" element={
              <div>服务详情页面 - 待开发</div>
            } />

            {/* Other Pages */}
            <Route path="/categories" element={
              <div>分类页面 - 待开发</div>
            } />
            <Route path="/become-seller" element={
              <div>成为卖家页面 - 待开发</div>
            } />
            <Route path="/how-it-works" element={
              <div>工作原理页面 - 待开发</div>
            } />
            <Route path="/help" element={
              <div>帮助中心页面 - 待开发</div>
            } />
            <Route path="/contact" element={
              <div>联系我们页面 - 待开发</div>
            } />

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;