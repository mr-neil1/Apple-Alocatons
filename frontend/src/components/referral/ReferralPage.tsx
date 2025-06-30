import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, XCircle, Gift } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from 'firebase/firestore';

interface Referral {
  id: string;
  email: string;
  isActive: boolean;
  investedAmount?: number; // Total investi s’il est actif
}

const ReferralPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState(false); // évite de réclamer plusieurs fois
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchReferrals = async () => {
      setLoading(true);

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referredBy', '==', user.referralCode));
      const userSnapshots = await getDocs(q);

      const referralList: Referral[] = [];

      for (const docSnap of userSnapshots.docs) {
        const data = docSnap.data();
        const referralId = docSnap.id;

        const allocQuery = query(
          collection(db, 'allocations'),
          where('userId', '==', referralId)
        );
        const allocSnap = await getDocs(allocQuery);

        const isActive = !allocSnap.empty;
        const totalInvested = allocSnap.docs.reduce((sum, alloc) => {
          const a = alloc.data();
          return sum + (a.investedAmount || 0);
        }, 0);

        referralList.push({
          id: referralId,
          email: data.email,
          isActive,
          investedAmount: totalInvested
        });
      }

      setReferrals(referralList);
      setLoading(false);
    };

    fetchReferrals();
  }, [user]);

  const handleClaim = async () => {
    if (!user || claimed) return;

    // 150 XAF par filleul actif + 5% sur leurs dépôts
    const actifs = referrals.filter(r => r.isActive);
    const fixedBonus = actifs.length * 150;
    const percentBonus = actifs.reduce((sum, r) => sum + (r.investedAmount || 0) * 0.05, 0);
    const totalBonus = Math.floor(fixedBonus + percentBonus);

    const newBalance = user.balance + totalBonus;

    try {
      await updateDoc(doc(db, 'users', user.id), { balance: newBalance });
      setUser({ ...user, balance: newBalance });
      setClaimed(true);
      setMessage(`🎉 Vous avez reçu ${totalBonus} XAF de bonus`);
    } catch (err) {
      setMessage("❌ Une erreur est survenue");
    }
  };

  if (loading) {
    return <div className="text-white text-center">Chargement...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">👥 Mon Équipe</h1>
      <p className="mb-2 text-gray-300">
        Total : <strong>{referrals.length}</strong> — Actifs :{" "}
        <strong>{referrals.filter(r => r.isActive).length}</strong>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {referrals.map(r => (
          <div
            key={r.id}
            className={`p-4 rounded-lg border ${
              r.isActive
                ? 'bg-green-800/20 border-green-500'
                : 'bg-gray-800/30 border-gray-600'
            }`}
          >
            <div className="flex items-center mb-2">
              <Mail className="w-4 h-4 text-primary-400 mr-2" />
              <span className="text-sm">{r.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span>
                Statut :{" "}
                {r.isActive ? (
                  <span className="text-green-400 font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Actif
                  </span>
                ) : (
                  <span className="text-gray-400 font-medium flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    Inactif
                  </span>
                )}
              </span>

              {r.isActive && (
                <span className="text-sm text-yellow-300">
                  +{r.investedAmount} XAF
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleClaim}
        disabled={claimed}
        className={`px-6 py-3 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
          claimed
            ? 'bg-gray-600 cursor-not-allowed text-gray-300'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
        }`}
      >
        <Gift className="w-5 h-5" />
        {claimed ? "Déjà réclamé" : "Réclamer mes récompenses"}
      </button>

      {message && (
        <div className="mt-4 text-center text-yellow-300 font-medium">
          {message}
        </div>
      )}
    </div>
  );
};

export default ReferralPage;

