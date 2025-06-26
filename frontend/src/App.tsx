import React, { useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState('dashboard');

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
    return <AuthPage />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'deposit':
        return <DepositPage onNavigate={setCurrentPage} />;
      case 'services':
        return <ServicesPage onNavigate={setCurrentPage} />;
      case 'referral':
        return <ReferralPage onNavigate={setCurrentPage} />;
      case 'withdraw':
        return <WithdrawPage onNavigate={setCurrentPage} />;
      case 'history':
        return <Dashboard onNavigate={setCurrentPage} />; // Placeholder
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="pb-16">
      {renderCurrentPage()}
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
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