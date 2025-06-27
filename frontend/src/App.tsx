import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';
import DepositPage from './components/deposit/DepositPage';
import ServicesPage from './components/services/ServicesPage';
import ReferralPage from './components/referral/ReferralPage';
import WithdrawPage from './components/withdraw/WithdrawPage';
import Navigation from './components/layout/Navigation';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
          <div className="text-white">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/*" element={<AuthPage />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard onNavigate={() => {}} />} />
        <Route path="/deposit" element={<DepositPage onNavigate={() => {}} />} />
        <Route path="/services" element={<ServicesPage onNavigate={() => {}} />} />
        <Route path="/referral" element={<ReferralPage onNavigate={() => {}} />} />
        <Route path="/withdraw" element={<WithdrawPage onNavigate={() => {}} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Navigation currentPage="" onNavigate={() => {}} />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
