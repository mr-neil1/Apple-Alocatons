// ✅ src/services/cinetpay.service.ts
import axios from 'axios';

const CINETPAY_BASE = 'https://api-checkout.cinetpay.com/v2';

export async function verifyCinetpayTransaction(transaction_id: string) {
  const { data } = await axios.get(`${CINETPAY_BASE}/payment/check`, {
    params: {
      apikey: process.env.CINETPAY_API_KEY,
      site_id: process.env.CINETPAY_SITE_ID,
      transaction_id,
    },
  });
  return data;
}
