// ReferralPage.tsx (Adapté pour bonus unique de 300 XAF sur premier dépôt uniquement)
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { Mail, Copy, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Referral {
  id: string;
  email: string;
  isActive: boolean;
  depositAmount: number;
  bonusGranted: boolean;
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

    const referralList: Referral[] = [];
    let bonusSum = 0;

    for (const snap of userSnaps.docs) {
      const data = snap.data();
      const referralId = snap.id;

      // Obtenir les dépôts de ce filleul
      const depositSnap = await getDocs(
        query(collection(db, 'deposits'), where('userId', '==', referralId), orderBy('createdAt', 'asc'))
      );

      const firstDeposit = depositSnap.docs[0];
      let depositAmount = 0;
      let bonusGranted = false;

      if (firstDeposit) {
        depositAmount = firstDeposit.data().amount || 0;
        const depositId = firstDeposit.id;

        const bonusDoc = await getDoc(doc(db, 'referralBonuses', depositId));
        if (bonusDoc.exists()) {
          bonusGranted = true;
        } else {
          bonusSum += 300;
        }
      }

      referralList.push({
        id: referralId,
        email: data.email,
        isActive: depositAmount > 0,
        depositAmount,
        bonusGranted
      });
    }

    setReferrals(referralList);
    setTotalBonus(bonusSum);
    setLoading(false);
  };

  const handleClaim = async () => {
    if (!user || totalBonus <= 0) return;
    setClaiming(true);

    try {
      for (const r of referrals) {
        if (!r.bonusGranted && r.depositAmount > 0) {
          const depositSnap = await getDocs(
            query(collection(db, 'deposits'), where('userId', '==', r.id), orderBy('createdAt', 'asc'))
          );
          const firstDeposit = depositSnap.docs[0];
          if (!firstDeposit) continue;

          const depositId = firstDeposit.id;
          await setDoc(doc(db, 'referralBonuses', depositId), {
            referralId: r.id,
            depositId,
            amount: 300,
            claimedAt: serverTimestamp(),
          });
        }
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
              !r.bonusGranted && r.depositAmount > 0 ? 'border-green-500 bg-green-900/10' : 'border-gray-600 bg-gray-800/40'
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
              Premier Dépôt : {r.depositAmount.toLocaleString()} XAF
            </div>
            {!r.bonusGranted && r.depositAmount > 0 && (
              <div className="text-sm text-green-400">
                <PlusCircle className="inline-block w-4 h-4 mr-1" /> Bonus disponible :{' '}
                <strong>300 XAF</strong>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReferralPage;

