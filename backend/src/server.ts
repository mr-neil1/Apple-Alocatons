// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import cron from 'node-cron';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: '✅ Backend opérationnel !' });
});

// Firebase init
initializeApp({ credential: applicationDefault() });
const db = getFirestore();
const auth = getAuth();

// Authenticated request type
interface AuthReq extends Request {
  user?: { uid: string; name?: string; email?: string };
}

// Middleware d’authentification Firebase
async function authMiddleware(req: AuthReq, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') && authHeader.substring(7);
  if (!token) {
    res.status(401).json({ error: 'Token requis' });
    return;
  }
  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, name: decoded.name, email: decoded.email };
    next();
  } catch {
    res.status(403).json({ error: 'Token invalide' });
  }
}

// 📥 Dépôt
app.post('/api/deposit', authMiddleware, async (req: AuthReq, res: Response) => {
  try {
    const { amount, method, phoneNumber } = req.body;
    if (!req.user) { res.status(401).json({ error: 'Utilisateur manquant' }); return; }

    const transactionId = `TX-${Date.now()}`;
    const payload = {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id: transactionId,
      amount,
      currency: 'XAF',
      description: 'Dépôt',
      notify_url: process.env.CINETPAY_NOTIFY_URL,
      return_url: process.env.CINETPAY_RETURN_URL,
      customer_name: req.user.name || '',
      customer_email: req.user.email || '',
      customer_phone_number: phoneNumber,
      channels: method
    };

    const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment', payload);
    const paymentLink = response.data.data.payment_url;

    await db.collection('deposits').doc(transactionId).set({
      userId: req.user.uid, amount, method, phoneNumber,
      status: 'pending', createdAt: new Date(), transactionId
    });

    res.json({ paymentLink });
  } catch (err: any) {
    console.error('CinetPay error', err.message);
    res.status(500).json({ error: 'Erreur dépôt' });
  }
});

// 🔔 Notification CinetPay
app.post('/api/cinetpay-notify', async (req: Request, res: Response) => {
  const txId = (req.body.transaction_id as string) || '';
  if (!txId) { res.status(400).end(); return; }

  try {
    const check = await axios.get(`https://api-checkout.cinetpay.com/v2/payment/check?apikey=${process.env.CINETPAY_API_KEY}&site_id=${process.env.CINETPAY_SITE_ID}&transaction_id=${txId}`);
    if (check.data.data.status === 'ACCEPTED') {
      const ref = db.collection('deposits').doc(txId);
      const snap = await ref.get();
      const dep = snap.data();
      if (dep && dep.status !== 'completed') {
        await ref.update({ status: 'completed' });
        await db.runTransaction(async t => {
          const uref = db.collection('users').doc(dep.userId);
          const usna = await t.get(uref);
          const bal = usna.data()?.balance || 0;
          t.update(uref, { balance: FieldValue.increment(dep.amount) });
        });
      }
    }
    res.status(200).end();
  } catch (err: any) {
    console.error('Notify error', err.message);
    res.status(500).end();
  }
});

// 💸 Retrait
app.post('/api/withdraw', authMiddleware, async (req: AuthReq, res: Response) => {
  try {
    if (!req.user) { res.status(401).json({ error: 'Utilisateur manquant' }); return; }
    const { amount, method, accountInfo } = req.body;

    if (amount < 3000) { res.status(400).json({ error: 'Montant min 3000 XAF' }); return; }

    const uref = db.collection('users').doc(req.user.uid);
    const usnap = await uref.get();
    if (!usnap.exists) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }
    const udata = usnap.data()!;
    if (udata.balance < amount) { res.status(400).json({ error: 'Solde insuffisant' }); return; }

    const rSnap = await db.collection('users').where('referredBy', '==', udata.referralCode || '').get();
    const activeCount = rSnap.docs.filter(d => d.data().isActive).length;
    if (activeCount < 3) { res.status(403).json({ error: '3 filleuls actifs requis' }); return; }

    const allocSnap = await db.collection('allocations').where('userId', '==', req.user.uid).get();
    if (allocSnap.empty) { res.status(403).json({ error: 'Aucune allocation active' }); return; }

    await db.runTransaction(async (t) => {
  await t.update(uref, { balance: FieldValue.increment(-amount) });
  await t.set(db.collection('withdrawals').doc(), {
    userId: req.user!.uid,
    amount,
    method,
    accountInfo,
    status: 'pending',
    createdAt: new Date()
  });
});
    res.json({ message: 'Retrait déposé' });
  } catch (err: any) {
    console.error('Withdraw error', err.message);
    res.status(500).json({ error: 'Erreur retrait' });
  }
});

// 🕒 Cron journalier
cron.schedule('0 0 * * *', async () => {
  console.log('Mise à jour journalière...');
  const now = new Date();
  const snaps = await db.collection('allocations').get();
  for (const d of snaps.docs) {
    const o = d.data();
    const last = (o.lastPayoutAt || o.createdAt).toDate();
    const diff = Math.floor((now.getTime() - last.getTime()) / 86400000);
    if (diff <= 0) continue;
    const gain = o.dailyReturn * diff;
    await db.collection('users').doc(o.userId).update({ balance: FieldValue.increment(gain) });
    const upd: any = {
      totalEarned: (o.totalEarned || 0) + gain,
      lastPayoutAt: Timestamp.fromDate(now)
    };
    if (o.duration) {
      const start = o.createdAt.toDate();
      if (now.getTime() >= start.getTime() + o.duration * 86400000) upd.status = 'completed';
    }
    await db.collection('allocations').doc(d.id).update(upd);
  }
});

// Démarrage
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));