const express = require('express');
const router = express.Router();
const { createPreference, webhook } = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

router.post('/create-preference', verifyToken, createPreference);
// El webhook no lleva auth JWT ya que lo llama MercadoPago directamente
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
