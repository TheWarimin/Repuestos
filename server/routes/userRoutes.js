const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  updateAddresses,
  adminUpdateUser,
} = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken);

router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/addresses', updateAddresses);

// Admin
router.get('/', isAdmin, getUsers);
router.get('/:id', isAdmin, getUserById);
router.put('/:id', isAdmin, adminUpdateUser);

module.exports = router;
