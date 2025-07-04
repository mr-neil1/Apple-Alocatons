// ✅ src/routes/withdrawal.routes.ts
import express from 'express';
import { submitWithdrawal } from '../controllers/withdrawal.controller';
import { authenticateFirebaseToken } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authenticateFirebaseToken, submitWithdrawal);

export default router;