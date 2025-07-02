// backend/src/controllers/deposit.controller.js
const { createCinetpayTransaction } = require('../services/cinetpay.service');

const initiateDeposit = async (req, res) => {
  try {
    const { amount, userId, email } = req.body;
    const transaction_id = `${userId}_${Date.now()}`;

    const response = await createCinetpayTransaction({
      amount,
      transaction_id,
      customer_email: email
    });

    // Tu peux stocker la transaction ici dans Firestore ou MongoDB (optionnel)

    res.json(response);
  } catch (err) {
    console.error('Erreur dépôt :', err);
    res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
};

const handleNotify = (req, res) => {
  // CinetPay renvoie les infos de paiement ici
  console.log('Notification reçue :', req.body);

  // ⚠️ Vérifie la validité et mets à jour le solde ici
  res.status(200).send('OK');
};

module.exports = { initiateDeposit, handleNotify };
