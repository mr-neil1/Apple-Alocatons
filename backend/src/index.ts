import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// Fonction CRON planifiée
export const updateDailyReturns = functions.pubsub
  .schedule('every 24 hours') // chaque jour
  .timeZone('Africa/Douala') // ajuster à ton fuseau horaire
  .onRun(async (context) => {
    console.log('Mise à jour des gains journaliers...');
    
    const allocationsSnap = await db.collection('allocations').get();

    for (const doc of allocationsSnap.docs) {
      const alloc = doc.data();
      const allocId = doc.id;

      const { userId, dailyReturn, totalEarned, createdAt, lastPayoutAt, duration } = alloc;

      const now = new Date();
      const last = lastPayoutAt?.toDate?.() ?? createdAt.toDate();
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0 || !userId) continue;

      const gain = dailyReturn * diffDays;

      // Mise à jour du solde utilisateur
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        balance: admin.firestore.FieldValue.increment(gain)
      });

      // Mise à jour de l'allocation
      const updateData: any = {
        totalEarned: totalEarned + gain,
        lastPayoutAt: admin.firestore.Timestamp.fromDate(now),
      };

      // Vérifier si allocation terminée
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

    return null;
  });
