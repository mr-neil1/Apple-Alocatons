"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Firebase Admin SDK
(0, app_1.initializeApp)({
    credential: (0, app_1.applicationDefault)()
});
const db = (0, firestore_1.getFirestore)();
const auth = (0, auth_1.getAuth)();
// 🔐 Middleware Firebase Auth
async function authenticateFirebaseToken(req, res, next) {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token)
        return res.status(401).json({ error: 'Token requis' });
    try {
        const decoded = await auth.verifyIdToken(token);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(403).json({ error: 'Token invalide' });
    }
}
// 📤 INIT DEPOT
app.post('/api/deposit', authenticateFirebaseToken, async (req, res) => {
    const { amount, method, phoneNumber } = req.body;
    const userId = req.user.uid;
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
        customer_name: req.user.name || '',
        customer_email: req.user.email || '',
        customer_phone_number: phoneNumber,
        channels: method // 'MOBILE_MONEY'
    };
    try {
        const response = await axios_1.default.post('https://api-checkout.cinetpay.com/v2/payment', data);
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
    }
    catch (error) {
        console.error('Erreur CinetPay:', error.response?.data || error.message);
        res.status(500).json({ error: 'Échec de l\'initialisation du dépôt' });
    }
});
// 🔔 NOTIFICATION CINETPAY
app.post('/api/cinetpay-notify', async (req, res) => {
    const { transaction_id } = req.body;
    try {
        const { data } = await axios_1.default.get(`https://api-checkout.cinetpay.com/v2/payment/check?apikey=${process.env.CINETPAY_API_KEY}&site_id=${process.env.CINETPAY_SITE_ID}&transaction_id=${transaction_id}`);
        if (data.data.status === 'ACCEPTED') {
            const depositRef = db.collection('deposits').doc(transaction_id);
            const depositDoc = await depositRef.get();
            if (!depositDoc.exists)
                return res.status(404).end();
            const deposit = depositDoc.data();
            if (deposit?.status !== 'completed') {
                await depositRef.update({ status: 'completed' });
                const userRef = db.collection('users').doc(deposit.userId);
                await db.runTransaction(async (t) => {
                    const userDoc = await t.get(userRef);
                    if (!userDoc.exists)
                        return;
                    const currentBalance = userDoc.data()?.balance || 0;
                    t.update(userRef, { balance: currentBalance + deposit.amount });
                });
            }
        }
        res.status(200).end();
    }
    catch (err) {
        console.error('Notification CinetPay erreur:', err.message);
        res.status(500).end();
    }
});
// 💸 RETRAIT
app.post('/api/withdraw', authenticateFirebaseToken, async (req, res) => {
    const { amount, method, accountInfo } = req.body;
    const userId = req.user.uid;
    if (amount < 3000)
        return res.status(400).json({ error: 'Montant min 3000 XAF' });
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists)
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const user = userDoc.data();
    const balance = user?.balance || 0;
    if (balance < amount)
        return res.status(400).json({ error: 'Solde insuffisant' });
    // Vérifie 3 filleuls actifs
    const referralSnap = await db.collection('users')
        .where('referredBy', '==', user.referralCode)
        .get();
    const activeReferrals = referralSnap.docs.filter(doc => doc.data().isActive).length;
    if (activeReferrals < 3)
        return res.status(403).json({ error: 'Minimum 3 filleuls actifs requis' });
    // Vérifie une allocation active
    const allocSnap = await db.collection('allocations')
        .where('userId', '==', userId)
        .get();
    if (allocSnap.empty)
        return res.status(403).json({ error: 'Aucune allocation active' });
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
// ✅ Santé
app.get('/api/health', (_, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`✅ Backend prêt sur le port ${PORT}`);
});
const node_cron_1 = __importDefault(require("node-cron"));
const firestore_2 = require("firebase-admin/firestore");
// 🕒 Tâche CRON : tous les jours à minuit (Africa/Douala)
node_cron_1.default.schedule('0 0 * * *', async () => {
    console.log('🕒 Lancement de la mise à jour des gains journaliers...');
    const now = new Date();
    const allocationsSnap = await db.collection('allocations').get();
    for (const doc of allocationsSnap.docs) {
        const alloc = doc.data();
        const allocId = doc.id;
        const { userId, dailyReturn, totalEarned, createdAt, lastPayoutAt, duration } = alloc;
        if (!userId || !dailyReturn)
            continue;
        const last = (lastPayoutAt?.toDate?.() || createdAt?.toDate?.());
        const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 0)
            continue;
        const gain = dailyReturn * diffDays;
        // 💰 Mettre à jour le solde de l'utilisateur
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            balance: firestore_2.FieldValue.increment(gain)
        });
        // 📈 Mettre à jour l'allocation
        const updateData = {
            totalEarned: (totalEarned || 0) + gain,
            lastPayoutAt: firestore_2.Timestamp.fromDate(now)
        };
        // 🛑 Vérifier si la durée est atteinte
        if (duration) {
            const start = createdAt.toDate();
            const end = new Date(start.getTime() + duration * 86400000);
            if (now >= end) {
                updateData.status = 'completed';
            }
        }
        await db.collection('allocations').doc(allocId).update(updateData);
        console.log(`✅ Allocation ${allocId} mise à jour pour l'utilisateur ${userId}`);
    }
    console.log('✅ Mise à jour des allocations terminée');
});
