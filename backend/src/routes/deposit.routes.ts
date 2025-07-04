import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createDeposit, notifyDeposit, checkDepositStatus } from '../controllers/deposit.controller';

const router = express.Router();

router.post('/initiate', authenticate, createDeposit);
router.post('/notify', notifyDeposit);
router.post('/check', authenticate, checkDepositStatus);

export default router;
