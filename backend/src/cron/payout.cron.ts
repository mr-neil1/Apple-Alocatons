// ✅ src/cron/payout.cron.ts
import { db } from '../config/firebase';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function runPayoutCron() {
  console.log('🕒 Début du cron de paiement journalier...');
  const now = new Date();
  const allocationsSnap = await db.collection('allocations').get();

  for (const doc of allocationsSnap.docs) {
    const alloc = doc.data();
    const allocId = doc.id;

    if (!alloc.userId || !alloc.dailyReturn) continue;

    const last = alloc.lastPayoutAt?.toDate?.() || alloc.createdAt.toDate();
    const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) continue;

    const gain = alloc.dailyReturn * diffDays;
    const userRef = db.collection('users').doc(alloc.userId);

    await userRef.update({ balance: FieldValue.increment(gain) });

    const updateData: any = {
      totalEarned: (alloc.totalEarned || 0) + gain,
      lastPayoutAt: Timestamp.fromDate(now),
    };

    if (alloc.duration) {
      const start = alloc.createdAt.toDate();
      const end = new Date(start.getTime() + alloc.duration * 86400000);
      if (now >= end) updateData.status = 'completed';
    }

    await db.collection('allocations').doc(allocId).update(updateData);
    console.log(`✅ Allocation ${allocId} mise à jour`);
  }
}