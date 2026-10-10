import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import CartDrawer from './components/ui/CartDrawer.jsx';
import PrivateRoute from './components/guards/PrivateRoute.jsx';
import AdminRoute from './components/guards/AdminRoute.jsx';

import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import CheckoutSuccess from './pages/CheckoutSuccess.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLayout from './components/layout/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminOrderDetail from './pages/admin/AdminOrderDetail.jsx';

export default function App() {
  return (
    <>
      <Routes>
        {/* Rutas públicas con Navbar */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <CartDrawer />
              <main className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/productos" element={<Products />} />
                  <Route path="/productos/:slug" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Register />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/checkout/failure" element={<CheckoutSuccess status="failure" />} />
                  <Route path="/checkout/pending" element={<CheckoutSuccess status="pending" />} />

                  {/* Rutas privadas */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/perfil" element={<Profile />} />
                    <Route path="/mis-pedidos" element={<Orders />} />
                    <Route path="/mis-pedidos/:id" element={<OrderDetail />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />

        {/* Rutas admin */}
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="productos/nuevo" element={<ProductForm />} />
          <Route path="productos/editar/:id" element={<ProductForm />} />
          <Route path="categorias" element={<AdminCategories />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="pedidos/:id" element={<AdminOrderDetail />} />
        </Route>
      </Routes>
    </>
  );
}
