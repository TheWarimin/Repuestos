const express = require('express');
const router = express.Router();
const {
  getProducts,
  getVehicleOptions,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  deleteImage,
} = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { upload } = require('../utils/upload');

// Rutas públicas
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/vehicles', getVehicleOptions);
router.get('/slug/:slug', getProductBySlug);

// Rutas admin
router.get('/admin/all', verifyToken, isAdmin, getAllProductsAdmin);
router.get('/:id', verifyToken, isAdmin, getProductById);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

// Subida de imágenes (admin)
router.post('/upload-image', verifyToken, isAdmin, upload.single('image'), uploadImage);
router.delete('/delete-image', verifyToken, isAdmin, deleteImage);

module.exports = router;
