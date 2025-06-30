import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, CheckCircle2, TrendingUp, Calendar, Hourglass } from 'lucide-react';
import Card from '../ui/Card';

interface Allocation {
  id: string;
  serviceName: string;
  investedAmount: number;
  dailyReturn: number;
  createdAt: any;
  duration: number;
  status: 'active' | 'completed';
}

const History: React.FC = () => {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAllocations = async () => {
      setLoading(true);
      const allocRef = collection(db, 'allocations');
      const q = query(allocRef, where('userId', '==', user.uid));
      const snap = await getDocs(q);

      const result: Allocation[] = snap.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();
        const now = new Date();
        const daysPassed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const status = daysPassed >= data.duration ? 'completed' : 'active';

        return {
          id: doc.id,
          serviceName: data.serviceName,
          investedAmount: data.investedAmount,
          dailyReturn: data.dailyReturn,
          createdAt,
          duration: data.duration,
          status,
        };
      });

      setAllocations(result);
      setLoading(false);
    };

    fetchAllocations();
  }, [user]);

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} XAF`;

  const active = allocations.filter(a => a.status === 'active');
  const completed = allocations.filter(a => a.status === 'completed');

  if (loading) return <div className="text-white text-center">Chargement des allocations...</div>;

  const renderAllocationCard = (a: Allocation) => {
    const totalGain = a.dailyReturn * a.duration;
    const now = new Date();
    const daysPassed = Math.min(
      Math.floor((now.getTime() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      a.duration
    );
    const gainedSoFar = a.dailyReturn * daysPassed;

    return (
      <Card key={a.id} className="bg-gray-800 border border-gray-600 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{a.serviceName}</h3>
          {a.status === 'active' ? (
            <span className="text-yellow-400 flex items-center text-sm">
              <Hourglass className="w-4 h-4 mr-1" /> En cours
            </span>
          ) : (
            <span className="text-green-400 flex items-center text-sm">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Terminé
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary-400" />
            {a.duration} jours
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-primary-400" />
            Démarré le {a.createdAt.toLocaleDateString()}
          </div>
          <div className="flex items-center">
            💰 Investi : <span className="ml-2 font-medium">{formatCurrency(a.investedAmount)}</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
            Gain total : {formatCurrency(totalGain)}
          </div>
          <div className="col-span-2 text-xs text-gray-400">
            {a.status === 'active'
              ? `Gain actuel estimé : ${formatCurrency(gainedSoFar)}`
              : `Gain final perçu : ${formatCurrency(totalGain)}`}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl text-white font-bold mb-6">Historique de mes Allocations</h1>

      {active.length > 0 && (
        <>
          <h2 className="text-xl text-primary-400 font-semibold mb-3">🟡 Allocations en cours</h2>
          <div className="space-y-4 mb-6">{active.map(renderAllocationCard)}</div>
        </>
      )}

      {completed.length > 0 && (
        <>
          <h2 className="text-xl text-green-500 font-semibold mb-3">✅ Allocations terminées</h2>
          <div className="space-y-4">{completed.map(renderAllocationCard)}</div>
        </>
      )}

      {allocations.length === 0 && (
        <div className="text-center text-gray-400">Aucune allocation pour le moment.</div>
      )}
    </div>
  );
};

export default History;
