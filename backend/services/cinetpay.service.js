// backend/src/services/cinetpay.service.js
const axios = require('axios');

const CINETPAY_URL = 'https://api-checkout.cinetpay.com/v2/payment';

async function createCinetpayTransaction({ amount, transaction_id, customer_email }) {
  const body = {
    apikey: process.env.CINETPAY_API_KEY,
    site_id: process.env.CINETPAY_SITE_ID,
    transaction_id,
    amount,
    currency: 'XAF',
    description: 'Dépôt Apple Allocations',
    notify_url: process.env.CINETPAY_NOTIFY_URL,
    customer_email,
    channels: 'ALL',
    lang: 'fr',
  };

  const res = await axios.post(CINETPAY_URL, body);
  return res.data;
}

module.exports = { createCinetpayTransaction };
