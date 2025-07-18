import React, { useState, useEffect } from 'react';
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
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

import Card from '../ui/Card';
import Button from '../ui/Button';
import StatsCard from './StatsCard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [allocations, setAllocations] = useState<any[]>([]);

  const [stats, setStats] = useState({
  dailyEarnings: 0,
  totalEarnings: 0,
  activeAllocations: 0,
  activeReferrals: 0,
});

useEffect(() => {
  if (!user) return;

  const fetchStats = async () => {
    try {
      // 1. Allocations actives de l'utilisateur
      const allocRef = collection(db, 'allocations');
      const allocQuery = query(allocRef, where('userId', '==', user.uid));
      const allocSnap = await getDocs(allocQuery);

      let dailyTotal = 0;
      let totalEarned = 0;
      let activeCount = 0;

      allocSnap.forEach(doc => {
        const data = doc.data();
        totalEarned += data.totalEarned || 0;
        dailyTotal += data.dailyReturn || 0;
        if (data.status === 'active') activeCount++;
      });

      // 2. Filleuls actifs
      const userRef = collection(db, 'users');
      const referralQuery = query(userRef, where('referredBy', '==', user.referralCode));
      const referralSnap = await getDocs(referralQuery);

      let activeReferrals = 0;

      for (const doc of referralSnap.docs) {
        const refUserId = doc.id;
        const refAllocSnap = await getDocs(
          query(allocRef, where('userId', '==', refUserId), where('status', '==', 'active'))
        );
        if (!refAllocSnap.empty) activeReferrals++;
      }

      setStats({
        dailyEarnings: dailyTotal,
        totalEarnings: totalEarned,
        activeAllocations: activeCount,
        activeReferrals,
      });

    } catch (error) {
      console.error('Erreur chargement stats :', error);
    }
  };

  fetchStats();
}, [user]);


  useEffect(() => {
    const fetchAllocations = async () => {
      if (!user?.uid) return;

      const q = query(
        collection(db, 'allocations'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAllocations(list);
    };

    fetchAllocations();
  }, [user]);

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} XAF`;

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Bonjour, {user?.email?.split('@')[0]} 👋
          </h1>
          <p className="text-gray-400">Voici un aperçu de votre portefeuille</p>
        </div>

        {/* Solde principal */}
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

        {/* Allocations récentes */}
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
            {allocations.length === 0 ? (
              <p className="text-gray-400 text-sm">Aucune allocation trouvée.</p>
            ) : (
              allocations.map((a) => (
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
                    +{a.investedAmount?.toLocaleString()} XAF
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

