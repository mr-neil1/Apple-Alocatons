import { Request, Response } from 'express';
import axios from 'axios';
import { db } from '../config/firebase';

// ➤ Créer un dépôt
export async function createDeposit(req: Request, res: Response) {
  const { amount, method, phoneNumber } = req.body;
  const user = (req as any).user;
  const transaction_id = `TX-${Date.now()}`;

  const payload = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id,
    amount,
    currency: 'XAF',
    description: 'Dépôt Apple Allocations',
    customer_name: user.name || '',
    customer_email: user.email || '',
    customer_phone_number: phoneNumber,
    channels: method,
    notify_url: process.env.CINETPAY_NOTIFY_URL || '', // Peut être défini dans .env
  };

  try {
    const response = await axios.post(
      'https://api-checkout.cinetpay.com/v2/payment',
      payload
    );

    await db.collection('deposits').doc(transaction_id).set({
      userId: user.uid,
      amount,
      method,
      phoneNumber,
      status: 'pending',
      createdAt: new Date(),
      transactionId: transaction_id,
    });

    res.status(200).json({ payment: response.data.data });
  } catch (error: any) {
    console.error('Erreur CinetPay:', error.message);
    res.status(500).json({ error: 'Erreur de dépôt' });
  }
}

// ➤ Notification de paiement depuis CinetPay (Webhook)
export const notifyDeposit = async (req: Request, res: Response) => {
  const { transaction_id } = req.body;

  try {
    const { data } = await axios.get(
      `https://api-checkout.cinetpay.com/v2/payment/check?apikey=${process.env.CINETPAY_API_KEY}&site_id=${process.env.CINETPAY_SITE_ID}&transaction_id=${transaction_id}`
    );

    const status = data.data.status;

    const depositRef = db.collection('deposits').doc(transaction_id);
    const depositDoc = await depositRef.get();

    if (!depositDoc.exists) {
      return res.status(404).json({ error: 'Transaction introuvable' });
    }

    const deposit = depositDoc.data() as {
      
      userId: string;
      amount: number;
      status: string;
    };


    if (deposit?.status !== 'completed' && status === 'ACCEPTED') {
      await depositRef.update({ status: 'completed' });

      const userRef = db.collection('users').doc(deposit.userId);
      await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) return;

        const currentBalance = userDoc.data()?.balance || 0;
        t.update(userRef, { balance: currentBalance + deposit.amount });
      });
    }

    res.status(200).json({ message: 'Notification traitée' });
  } catch (error: any) {
    console.error('Erreur Webhook CinetPay:', error.message);
    res.status(500).json({ error: 'Erreur lors du traitement de la notification' });
  }
};

// ➤ Vérifier manuellement le statut d’un paiement
export const checkDepositStatus = async (req: Request, res: Response) => {
  const { transaction_id } = req.query;

  if (!transaction_id) {
    return res.status(400).json({ error: 'transaction_id requis' });
  }

  try {
    const { data } = await axios.get(
      `https://api-checkout.cinetpay.com/v2/payment/check?apikey=${process.env.CINETPAY_API_KEY}&site_id=${process.env.CINETPAY_SITE_ID}&transaction_id=${transaction_id}`
    );

    res.status(200).json({ status: data.data.status });
  } catch (error: any) {
    console.error('Erreur vérification:', error.message);
    res.status(500).json({ error: 'Erreur lors de la vérification du paiement' });
  }
};
