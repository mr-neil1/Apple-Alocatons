// ✅ src/controllers/withdrawal.controller.ts
import { Request, Response } from 'express';
import { db } from '../config/firebase';

export async function submitWithdrawal(req: Request, res: Response) {
  const { amount, method, accountInfo } = req.body;
  const userId = (req as any).user.uid;

  if (amount < 3000) return res.status(400).json({ error: 'Minimum 3000 XAF' });

  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();
  if (!userSnap.exists) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  const user = userSnap.data();
  if ((user?.balance || 0) < amount)
    return res.status(400).json({ error: 'Solde insuffisant' });

  await db.runTransaction(async (t) => {
    t.update(userRef, { balance: user!.balance - amount });
    t.set(db.collection('withdrawals').doc(), {
      userId,
      amount,
      method,
      accountInfo,
      status: 'pending',
      createdAt: new Date(),
    });
  });

  return res.json({ message: '✅ Retrait soumis' });
}