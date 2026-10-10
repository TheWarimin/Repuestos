const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/stats', isAdmin, getOrderStats);
router.get('/', isAdmin, getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', isAdmin, updateOrderStatus);

module.exports = router;
