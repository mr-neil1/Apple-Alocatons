// // backend/src/routes/deposit.routes.js
// const express = require('express');
// const router = express.Router();
// const { initiateDeposit, handleNotify } = require('../controllers/deposit.controller');
// const { authenticateUser } = require('../middlewares/auth.middleware');

// // Route utilisée par le frontend pour initier un dépôt
// router.post('/deposit', authenticateUser, initiateDeposit);

// // Route appelée automatiquement par CinetPay pour notifier le backend
// router.post('/cinetpay-notify', handleNotify);

// module.exports = router;
