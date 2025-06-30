import React, { useEffect, useState } from 'react';
import {
  Mail, CheckCircle, XCircle, Gift, Copy, LinkIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  getDoc
} from 'firebase/firestore';

interface Referral {
  id: string;
  email: string;
  isActive: boolean;
  investedAmount?: number;
}

const ReferralPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [bonusClaimed, setBonusClaimed] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode}`;

  useEffect(() => {
    if (!user) return;

    const fetchReferralData = async () => {
      setLoading(true);

      const referralUsersQuery = query(
        collection(db, 'users'),
        where('referredBy', '==', user.referralCode)
      );
      const usersSnap = await getDocs(referralUsersQuery);

      const referralList: Referral[] = [];

      for (const docSnap of usersSnap.docs) {
        const data = docSnap.data();
        const referralId = docSnap.id;

        const allocationsSnap = await getDocs(
          query(collection(db, 'allocations'), where('userId', '==', referralId))
        );

        const isActive = !allocationsSnap.empty;
        const investedAmount = allocationsSnap.docs.reduce((sum, alloc) => {
          const a = alloc.data();
          return sum + (a.investedAmount || 0);
        }, 0);

        referralList.push({
          id: referralId,
          email: data.email,
          isActive,
          investedAmount
        });
      }

      // Vérifie si bonus déjà réclamé
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const bonusClaimedStatus = userDoc.data()?.referralBonusClaimed || false;

      setReferrals(referralList);
      setBonusClaimed(bonusClaimedStatus);
      setLoading(false);
    };

    fetchReferralData();
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopyMessage('✅ Lien copié !');
    setTimeout(() => setCopyMessage(''), 3000);
  };

  const handleClaim = async () => {
    if (!user || bonusClaimed) return;

    const actifs = referrals.filter(r => r.isActive);
    const fixedBonus = actifs.length * 150;
    const percentBonus = actifs.reduce((sum, r) => sum + (r.investedAmount || 0) * 0.05, 0);
    const totalBonus = Math.floor(fixedBonus + percentBonus);
    const newBalance = user.balance + totalBonus;

    try {
      // 1. Met à jour le solde
      await updateDoc(doc(db, 'users', user.uid), {
        balance: newBalance,
        referralBonusClaimed: true
      });

      // 2. Mets à jour localement
      setUser({ ...user, balance: newBalance });
      setBonusClaimed(true);

      // 3. Enregistre dans la collection historique
      await addDoc(collection(db, 'referralBonuses'), {
        userId: user.uid,
        referralCode: user.referralCode,
        bonusAmount: totalBonus,
        timestamp: new Date()
      });

      setMessage(`🎉 Bonus de ${totalBonus} XAF réclamé avec succès.`);
    } catch (err: unknown) {
      console.error(err);
      setMessage('❌ Une erreur est survenue lors de la réclamation.');
    }
  };

  if (loading) {
    return <div className="text-white text-center">Chargement...</div>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">🤝 Parrainage</h1>

      {/* Code + lien de parrainage */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">
            Votre code de parrainage :
            <span className="font-bold text-primary-400 ml-2">{user.referralCode}</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-sm truncate text-gray-300">
            🔗 Lien : <span className="text-primary-300">{referralLink}</span>
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center bg-primary-500 hover:bg-primary-600 text-black font-semibold px-3 py-1 rounded-md"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copier
          </button>
        </div>
        {copyMessage && (
          <p className="text-green-400 text-sm">{copyMessage}</p>
        )}
      </div>

      {/* Filleuls */}
      <h2 className="text-xl font-semibold mb-2">👥 Mon Équipe</h2>
      <p className="mb-4 text-gray-300">
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

      {/* Bouton réclamer */}
      <button
        onClick={handleClaim}
        disabled={bonusClaimed}
        className={`px-6 py-3 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all ${
          bonusClaimed
            ? 'bg-gray-600 cursor-not-allowed text-gray-300'
            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
        }`}
      >
        <Gift className="w-5 h-5" />
        {bonusClaimed ? "Déjà réclamé" : "Réclamer mes récompenses"}
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

