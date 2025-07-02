// backend/src/routes/deposit.routes.js
const express = require('express');
const router = express.Router();
const { initiateDeposit, handleNotify } = require('../controllers/deposit.controller');

router.post('/initiate', initiateDeposit);
router.post('/notify', handleNotify);

module.exports = router;
