// backend/src/controllers/deposit.controller.js
const { createCinetpayTransaction } = require('../services/cinetpay.service');
const { db } = require('../firebase');
const { collection, addDoc } = require('firebase/firestore');

async function initiateDeposit(req, res) {
  const { amount, method, phoneNumber } = req.body;
  const user = req.user;

  if (!user || !amount || !method) {
    return res.status(400).json({ error: 'Champs manquants ou utilisateur non connecté' });
  }

  const transaction_id = 'TX-' + Date.now();
  const email = user.email;

  try {
    const { payment_url } = await createCinetpayTransaction({
      amount,
      transaction_id,
      customer_email: email,
    });

    // Sauvegarde dans Firebase
    await addDoc(collection(db, 'deposits'), {
      userId: user.uid,
      amount,
      method,
      phoneNumber: phoneNumber || '',
      transaction_id,
      status: 'pending',
      createdAt: new Date(),
    });

    res.json({ paymentLink: payment_url });
  } catch (err) {
    console.error('❌ Erreur dépôt:', err.message);
    res.status(500).json({ error: 'Erreur lors du dépôt' });
  }
}

module.exports = {
  initiateDeposit,
  handleNotify,
};
