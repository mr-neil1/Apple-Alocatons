import React, { useState } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Gift, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatsCard from './StatsCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  // Données fictives
  const stats = {
    dailyEarnings: 250,
    totalEarnings: 15750,
    activeAllocations: 8,
    activeReferrals: 3,
  };

  const recentTransactions = [
    { id: '1', type: 'earning', amount: 125, description: 'Revenus Services Cloud', date: new Date() },
    { id: '2', type: 'allocation', amount: -2500, description: 'Allocation Trading Bot', date: new Date() },
    { id: '3', type: 'deposit', amount: 5000, description: 'Dépôt MTN MoMo', date: new Date() },
  ];

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} XAF`;

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Bonjour, {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-gray-400">Voici un aperçu de votre portefeuille</p>
        </div>

        {/* Solde */}
        <Card className="mb-8 bg-gradient-to-r from-primary-600 to-primary-700 border-primary-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Wallet className="w-8 h-8 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">Solde Principal</h2>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="mb-6">
            <div className="text-4xl font-bold text-white mb-2">
              {showBalance ? formatCurrency(user?.balance || 0) : '••••••'}
            </div>
            <div className="flex items-center text-green-200">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">+{formatCurrency(stats.dailyEarnings)} aujourd'hui</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/deposit')}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 border-white/20"
              icon={Plus}
            >
              Dépôt
            </Button>
            <Button
              onClick={() => navigate('/withdraw')}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 border-white/20"
              icon={ArrowUpRight}
            >
              Retrait
            </Button>
          </div>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Revenus/Jour"
            value={formatCurrency(stats.dailyEarnings)}
            icon={TrendingUp}
            color="primary"
          />
          <StatsCard
            title="Total Gains"
            value={formatCurrency(stats.totalEarnings)}
            icon={Wallet}
            color="success"
          />
          <StatsCard
            title="Allocations"
            value={stats.activeAllocations.toString()}
            icon={Gift}
            color="warning"
          />
          <StatsCard
            title="Filleuls"
            value={stats.activeReferrals.toString()}
            icon={Users}
            color="accent"
          />
        </div>

        {/* Actions rapides */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate('/services')}
              variant="secondary"
              className="flex-col h-20"
              icon={Gift}
            >
              <span className="text-xs mt-1">Allouer</span>
            </Button>
            <Button
              onClick={() => navigate('/referral')}
              variant="secondary"
              className="flex-col h-20"
              icon={Users}
            >
              <span className="text-xs mt-1">Mon Équipe</span>
            </Button>
            <Button
              onClick={() => navigate('/allocations')}
              variant="secondary"
              className="flex-col h-20"
              icon={TrendingUp}
            >
              <span className="text-xs mt-1">Mes Allocations</span>
            </Button>
            <Button
              onClick={() => navigate('/history')}
              variant="secondary"
              className="flex-col h-20"
              icon={ArrowDownLeft}
            >
              <span className="text-xs mt-1">Historique</span>
            </Button>
          </div>
        </Card>

        {/* Transactions */}
        <Card>
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-white">Mes dernières allocations</h3>
    <Button
      onClick={() => navigate('/history')}
      variant="secondary"
      size="sm"
    >
      Voir tout
    </Button>
  </div>

  <div className="space-y-3">
    {allocations.slice(0, 3).map((a) => (
      <div
        key={a.id}
        className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
      >
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mr-3">
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <div className="text-white font-medium">{a.serviceName}</div>
            <div className="text-gray-400 text-sm">
              {(a.createdAt?.toDate?.() ?? new Date()).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="text-green-400 font-semibold">
          +{a.investedAmount.toLocaleString()} XAF
        </div>
      </div>
    ))}
  </div>
</Card>

      </div>
    </div>
  );
};

export default Dashboard;
