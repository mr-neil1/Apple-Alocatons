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
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StatsCard from './StatsCard';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  // Mock data - would come from API
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

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} XAF`;
  };

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

        {/* Balance Card */}
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
              onClick={() => onNavigate('deposit')}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 border-white/20"
              icon={Plus}
            >
              Dépôt
            </Button>
            <Button
              onClick={() => onNavigate('withdraw')}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 border-white/20"
              icon={ArrowUpRight}
            >
              Retrait
            </Button>
          </div>
        </Card>

        {/* Stats Grid */}
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

        {/* Quick Actions */}
        <Card className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => onNavigate('services')}
              variant="secondary"
              className="flex-col h-20"
              icon={Gift}
            >
              <span className="text-xs mt-1">Allouer</span>
            </Button>
            <Button
              onClick={() => onNavigate('referral')}
              variant="secondary"
              className="flex-col h-20"
              icon={Users}
            >
              <span className="text-xs mt-1">Mon Équipe</span>
            </Button>
            <Button
              onClick={() => onNavigate('allocations')}
              variant="secondary"
              className="flex-col h-20"
              icon={TrendingUp}
            >
              <span className="text-xs mt-1">Mes Allocations</span>
            </Button>
            <Button
              onClick={() => onNavigate('history')}
              variant="secondary"
              className="flex-col h-20"
              icon={ArrowDownLeft}
            >
              <span className="text-xs mt-1">Historique</span>
            </Button>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Transactions Récentes</h3>
            <Button
              onClick={() => onNavigate('history')}
              variant="secondary"
              size="sm"
            >
              Voir tout
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    transaction.type === 'earning' ? 'bg-green-500/20' :
                    transaction.type === 'deposit' ? 'bg-blue-500/20' : 'bg-orange-500/20'
                  }`}>
                    {transaction.type === 'earning' ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : transaction.type === 'deposit' ? (
                      <ArrowDownLeft className="w-4 h-4 text-blue-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-white font-medium">{transaction.description}</div>
                    <div className="text-gray-400 text-sm">
                      {transaction.date.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className={`font-semibold ${
                  transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
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