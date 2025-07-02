import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import cron from 'node-cron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Firebase Init
initializeApp({
  credential: applicationDefault()
});
const db = getFirestore();
const auth = getAuth();

// Type personnalisé
interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    name?: string;
    email?: string;
  };
}

// Middlewares
app.use(cors());
app.use(express.json());

// Auth middleware
async function authenticateFirebaseToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token requis' });
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    (req as AuthenticatedRequest).user = {
      uid: decoded.uid,
      name: decoded.name,
      email: decoded.email
    };
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide' });
  }
}

// Dépôt
app.post('/api/deposit', authenticateFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  const { amount, method, phoneNumber } = req.body;
  const user = (req as AuthenticatedRequest).user;
  const userId = user.uid;

  const transactionId = `TX-${Date.now()}`;
  const data = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id: transactionId,
    amount,
    currency: 'XAF',
    description: 'Dépôt Apple Allocations',
    notify_url: process.env.CINETPAY_NOTIFY_URL,
    return_url: process.env.CINETPAY_RETURN_URL,
    customer_name: user.name || '',
    customer_email: user.email || '',
    customer_phone_number: phoneNumber,
    channels: method
  };

  try {
    const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment', data);
    const paymentLink = response.data.data.payment_url;

    await db.collection('deposits').doc(transactionId).set({
      userId,
      amount,
      method,
      phoneNumber,
      status: 'pending',
      createdAt: new Date(),
      transactionId
    });

    res.json({ message: 'Paiement initié', paymentLink });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ error: 'Erreur CinetPay' });
  }
});

// Notification CinetPay
app.post('/api/cinetpay-notify', async (req: Request, res: Response): Promise<void> => {
  const { transaction_id } = req.body;

  try {
    const { data } = await axios.get(
      `https://api-checkout.cinetpay.com/v2/payment/check?apikey=${process.env.CINETPAY_API_KEY}&site_id=${process.env.CINETPAY_SITE_ID}&transaction_id=${transaction_id}`
    );

    if (data.data.status === 'ACCEPTED') {
      const depositRef = db.collection('deposits').doc(transaction_id);
      const depositDoc = await depositRef.get();
      if (!depositDoc.exists) {
        res.status(404).end();
        return;
      }

      const deposit = depositDoc.data();
      if (deposit?.status !== 'completed') {
        await depositRef.update({ status: 'completed' });

        const userRef = db.collection('users').doc(deposit.userId);
        await db.runTransaction(async (t) => {
          const userDoc = await t.get(userRef);
          if (!userDoc.exists) return;

          const currentBalance = userDoc.data()?.balance || 0;
          t.update(userRef, { balance: currentBalance + deposit.amount });
        });
      }
    }

    res.status(200).end();
  } catch (err: any) {
    console.error('Notification CinetPay erreur:', err.message);
    res.status(500).end();
  }
});

// Retrait
app.post('/api/withdraw', authenticateFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  const { amount, method, accountInfo } = req.body;
  const user = (req as AuthenticatedRequest).user;
  const userId = user.uid;

  if (amount < 3000) {
    res.status(400).json({ error: 'Montant min 3000 XAF' });
    return;
  }

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    res.status(404).json({ error: 'Utilisateur non trouvé' });
    return;
  }

  const userData = userDoc.data();
  const balance = userData?.balance || 0;
  if (balance < amount) {
    res.status(400).json({ error: 'Solde insuffisant' });
    return;
  }

  const referralSnap = await db.collection('users')
    .where('referredBy', '==', userData?.referralCode || '')
    .get();
  const activeReferrals = referralSnap.docs.filter(doc => doc.data().isActive).length;
  if (activeReferrals < 3) {
    res.status(403).json({ error: 'Minimum 3 filleuls actifs requis' });
    return;
  }

  const allocSnap = await db.collection('allocations')
    .where('userId', '==', userId)
    .get();
  if (allocSnap.empty) {
    res.status(403).json({ error: 'Aucune allocation active' });
    return;
  }

  await db.runTransaction(async (t) => {
    t.update(userRef, { balance: balance - amount });
    t.set(db.collection('withdrawals').doc(), {
      userId,
      amount,
      method,
      accountInfo,
      createdAt: new Date(),
      status: 'pending'
    });
  });

  res.json({ message: 'Retrait soumis avec succès' });
});

// Santé
app.get('/api/health', (_req, res: Response): void => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Cron automatique
cron.schedule('0 0 * * *', async () => {
  console.log('🕒 Mise à jour des gains journaliers...');
  const now = new Date();
  const allocationsSnap = await db.collection('allocations').get();

  for (const doc of allocationsSnap.docs) {
    const alloc = doc.data();
    const allocId = doc.id;
    const { userId, dailyReturn, totalEarned, createdAt, lastPayoutAt, duration } = alloc;

    if (!userId || !dailyReturn) continue;

    const last = lastPayoutAt?.toDate?.() || createdAt.toDate();
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) continue;

    const gain = dailyReturn * diffDays;
    const userRef = db.collection('users').doc(userId);

    await userRef.update({ balance: FieldValue.increment(gain) });

    const updateData: any = {
      totalEarned: (totalEarned || 0) + gain,
      lastPayoutAt: Timestamp.fromDate(now)
    };

    if (duration) {
      const start = createdAt.toDate();
      const end = new Date(start.getTime() + duration * 86400000);
      if (now >= end) updateData.status = 'completed';
    }

    await db.collection('allocations').doc(allocId).update(updateData);
    console.log(`✅ Allocation ${allocId} mise à jour pour ${userId}`);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend en ligne sur le port ${PORT}`);
});
