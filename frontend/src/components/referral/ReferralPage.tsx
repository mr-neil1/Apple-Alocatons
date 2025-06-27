import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface Referral {
  id: string;
  email: string;
  isActive: boolean;
}

const ReferralPage: React.FC = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReferrals = async () => {
      setLoading(true);

      // 1. Cherche tous les filleuls
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referredBy', '==', user.referralCode));
      const userSnapshots = await getDocs(q);

      const referralList: Referral[] = [];

      for (const docSnap of userSnapshots.docs) {
        const data = docSnap.data();
        const referralId = docSnap.id;

        // 2. Vérifie s’il a des allocations actives
        const allocationsRef = collection(db, 'allocations');
        const allocQuery = query(
          allocationsRef,
          where('userId', '==', referralId),
          where('status', '==', 'active')
        );
        const allocSnap = await getDocs(allocQuery);

        referralList.push({
          id: referralId,
          email: data.email,
          isActive: !allocSnap.empty,
        });
      }

      setReferrals(referralList);
      setLoading(false);
    };

    fetchReferrals();
  }, [user]);

  if (loading) {
    return <div className="text-white text-center">Chargement...</div>;
  }

  const total = referrals.length;
  const actifs = referrals.filter(r => r.isActive).length;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Mes filleuls</h1>

      <p className="mb-4">
        Total : <strong>{total}</strong> — Actifs : <strong>{actifs}</strong>
      </p>

      <div className="space-y-2">
        {referrals.map((r, index) => (
          <div
            key={r.id}
            className={`p-4 rounded-lg ${r.isActive ? 'bg-green-800/30 border border-green-500' : 'bg-gray-800/30 border border-gray-500'}`}
          >
            <p>Email : <strong>{r.email}</strong></p>
            <p>Status : {r.isActive ? '✅ Actif' : '❌ Inactif'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReferralPage;
