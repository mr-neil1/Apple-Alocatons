// ReferralPage.tsx (Version améliorée avec bonus dynamiques, gestion du solde, style propre)
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Mail, Copy, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Referral {
  id: string;
  email: string;
  isActive: boolean;
  investedAmount: number;
  newBonus: number;
  alreadyClaimed: number;
}

const ReferralPage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [totalBonus, setTotalBonus] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchReferralData();
  }, [user]);

  const fetchReferralData = async () => {
    setLoading(true);
    const q = query(collection(db, 'users'), where('referredBy', '==', user.referralCode));
    const userSnaps = await getDocs(q);
    const bonuses = await getDocs(
      query(collection(db, 'referralBonuses'), where('userId', '==', user.uid))
    );

    const claimedMap = new Map();
    bonuses.docs.forEach((b) => {
      const data = b.data();
      claimedMap.set(data.referralId, (claimedMap.get(data.referralId) || 0) + data.bonusAmount);
    });

    let bonusTotal = 0;
    const referralList: Referral[] = [];

    for (const snap of userSnaps.docs) {
      const data = snap.data();
      const referralId = snap.id;

      const allocSnap = await getDocs(
        query(collection(db, 'allocations'), where('userId', '==', referralId))
      );

      let invested = 0;
      allocSnap.docs.forEach((a) => (invested += a.data().investedAmount));

      const alreadyClaimed = claimedMap.get(referralId) || 0;
      const fixedBonus = 150;
      const percentBonus = invested * 0.05;
      const totalBonus = fixedBonus + percentBonus;
      const newBonus = totalBonus - alreadyClaimed;
      if (newBonus > 0) bonusTotal += newBonus;

      referralList.push({
        id: referralId,
        email: data.email,
        isActive: invested > 0,
        investedAmount: invested,
        alreadyClaimed,
        newBonus,
      });
    }

    setReferrals(referralList);
    setTotalBonus(bonusTotal);
    setLoading(false);
  };

  const handleClaim = async () => {
    if (!user || totalBonus <= 0) return;
    setClaiming(true);

    const batch = referrals.filter((r) => r.newBonus > 0);
    try {
      for (const r of batch) {
        await addDoc(collection(db, 'referralBonuses'), {
          userId: user.uid,
          referralId: r.id,
          bonusAmount: r.newBonus,
          claimedAt: serverTimestamp(),
        });
      }
      await updateDoc(doc(db, 'users', user.uid), {
        balance: user.balance + totalBonus,
      });
      setUser({ ...user, balance: user.balance + totalBonus });
      await fetchReferralData();
    } catch (err) {
      console.error('Erreur réclamation bonus :', err);
    }
    setClaiming(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user?.referralCode}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mes Filleuls</h1>

      <Card className="bg-gray-800/50 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-sm mb-2 sm:mb-0">
          <div className="text-gray-400">Code de parrainage :</div>
          <div className="text-primary-400 font-semibold">{user?.referralCode}</div>
        </div>
        <Button onClick={copyToClipboard} size="sm" variant="secondary" icon={copySuccess ? CheckCircle : Copy}>
          {copySuccess ? 'Copié !' : 'Copier lien'}
        </Button>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <p>
          Total filleuls : <strong>{referrals.length}</strong> — Actifs :{' '}
          <strong>{referrals.filter((r) => r.isActive).length}</strong>
        </p>
        <Button
          onClick={handleClaim}
          disabled={totalBonus <= 0 || claiming}
          variant="primary"
          size="sm"
        >
          {claiming ? 'Réclamation...' : `Réclamer ${totalBonus.toLocaleString()} XAF`}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {referrals.map((r) => (
          <Card
            key={r.id}
            className={`p-4 space-y-2 border-l-4 ${
              r.newBonus > 0 ? 'border-green-500 bg-green-900/10' : 'border-gray-600 bg-gray-800/40'
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" /> <span>{r.email}</span>
            </div>
            <div className="text-sm">
              Statut :{' '}
              {r.isActive ? (
                <span className="text-green-400">✅ Actif</span>
              ) : (
                <span className="text-gray-400">❌ Inactif</span>
              )}
            </div>
            <div className="text-sm text-gray-300">
              Dépôts : {r.investedAmount.toLocaleString()} XAF
            </div>
            {r.newBonus > 0 && (
              <div className="text-sm text-green-400">
                <PlusCircle className="inline-block w-4 h-4 mr-1" /> Nouveau bonus :{' '}
                <strong>{r.newBonus.toLocaleString()} XAF</strong>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReferralPage;
