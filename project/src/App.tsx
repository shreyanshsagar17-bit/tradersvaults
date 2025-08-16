import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades';
import Analytics from './pages/Analytics';
import Social from './pages/Social';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import PendingApproval from './pages/PendingApproval';
import CustomStrategies from './pages/CustomStrategies';
import AIAnalytics from './pages/AIAnalytics';
import CustomPortfolio from './pages/CustomPortfolio';
import Calculator from './pages/Calculator';
import BrokerConnect from './pages/BrokerConnect';
import PricingPage from './pages/PricingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import SubscriptionManagement from './pages/SubscriptionManagement';
import AdminSubscriptions from './pages/AdminSubscriptions';
import SubscriptionGuard from './components/subscription/SubscriptionGuard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <div className="min-h-screen bg-black">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/pay" element={<PaymentPage />} />
              <Route path="/pay/success" element={<PaymentSuccessPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <Dashboard />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/calculator" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <Calculator />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/trades" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <Trades />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <Analytics />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/strategies" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <CustomStrategies />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/ai-analytics" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <AIAnalytics />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/portfolio" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <CustomPortfolio />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/brokers" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <BrokerConnect />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/social" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <Social />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <SubscriptionGuard>
                  <Layout>
                    <Profile />
                  </Layout>
                  </SubscriptionGuard>
                </ProtectedRoute>
              } />
              <Route path="/subscription" element={
                <ProtectedRoute>
                  <Layout>
                    <SubscriptionManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <AdminPanel />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin/subscriptions" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <AdminSubscriptions />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;