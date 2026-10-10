import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ordersAPI, paymentAPI } from '../services/api.js';
import useCartStore from '../store/cartStore.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

const REGIONS = [
  'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
  'Valparaíso', 'Metropolitana de Santiago', "O'Higgins", 'Maule',
  'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos',
  'Aysén', 'Magallanes',
];

const initialForm = {
  recipientName: '',
  street: '',
  city: '',
  region: '',
  commune: '',
  postalCode: '',
  phone: '',
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart } = useCartStore();
  const [form, setForm] = useState({ ...initialForm, recipientName: user?.name || '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const subtotal = items.reduce((a, i) => a + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 50000 ? 0 : 3990;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <Link to="/productos" className="btn-primary mt-4">Ver productos</Link>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.recipientName.trim()) e.recipientName = 'El nombre es obligatorio';
    if (!form.street.trim()) e.street = 'La calle es obligatoria';
    if (!form.city.trim()) e.city = 'La ciudad es obligatoria';
    if (!form.region) e.region = 'La región es obligatoria';
    if (!form.phone.trim()) e.phone = 'El teléfono es obligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Crear la orden
      const orderRes = await ordersAPI.create({
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: form,
      });

      const orderId = orderRes.data._id;

      // 2. Crear preferencia de pago
      const payRes = await paymentAPI.createPreference(orderId);
      const { sandboxInitPoint, initPoint } = payRes.data;

      clearCart();

      // 3. Redirigir a MercadoPago
      window.location.href =
        process.env.NODE_ENV === 'production' ? initPoint : sandboxInitPoint;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al procesar el pedido';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout — RepuestosCL</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="section-title mb-8">Finalizar compra</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Datos de envío */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-5">Datos de envío</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="recipientName" className="label">Nombre del destinatario</label>
                  <input id="recipientName" name="recipientName" type="text" value={form.recipientName} onChange={handleChange} placeholder="Tu nombre completo" className={`input-field ${errors.recipientName ? 'border-red-400' : ''}`} />
                  {errors.recipientName && <p className="text-xs text-red-500 mt-1">{errors.recipientName}</p>}
                </div>
                <div>
                  <label htmlFor="street" className="label">Calle y número</label>
                  <input id="street" name="street" type="text" value={form.street} onChange={handleChange} placeholder="Av. Ejemplo 1234" className={`input-field ${errors.street ? 'border-red-400' : ''}`} />
                  {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                </div>
                <div>
                  <label htmlFor="commune" className="label">Comuna</label>
                  <input id="commune" name="commune" type="text" value={form.commune} onChange={handleChange} placeholder="Las Condes" className="input-field" />
                </div>
                <div>
                  <label htmlFor="city" className="label">Ciudad</label>
                  <input id="city" name="city" type="text" value={form.city} onChange={handleChange} placeholder="Santiago" className={`input-field ${errors.city ? 'border-red-400' : ''}`} />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="region" className="label">Región</label>
                  <select id="region" name="region" value={form.region} onChange={handleChange} className={`input-field ${errors.region ? 'border-red-400' : ''}`}>
                    <option value="">Selecciona una región</option>
                    {REGIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                  </select>
                  {errors.region && <p className="text-xs text-red-500 mt-1">{errors.region}</p>}
                </div>
                <div>
                  <label htmlFor="postalCode" className="label">Código postal (opcional)</label>
                  <input id="postalCode" name="postalCode" type="text" value={form.postalCode} onChange={handleChange} placeholder="7500000" className="input-field" />
                </div>
                <div>
                  <label htmlFor="phone" className="label">Teléfono de contacto</label>
                  <input id="phone" name="phone" type="text" value={form.phone} onChange={handleChange} placeholder="+56 9 1234 5678" className={`input-field ${errors.phone ? 'border-red-400' : ''}`} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-3">Método de pago</h2>
              <div className="flex items-center gap-3 p-4 border-2 border-primary-500 rounded-xl bg-primary-50">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  MP
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">MercadoPago</p>
                  <p className="text-xs text-gray-500">Tarjetas, transferencia, efectivo y más</p>
                </div>
                <span className="ml-auto badge bg-primary-100 text-primary-700">Seleccionado</span>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Resumen del pedido</h2>
              <ul className="space-y-3 mb-4">
                {items.map((i) => (
                  <li key={i._id} className="flex gap-3">
                    <img
                      src={i.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Crect width='48' height='48' fill='%23f3f4f6'/%3E%3C/svg%3E"}
                      alt={i.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{i.name}</p>
                      <p className="text-xs text-gray-500">x{i.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-900">{formatCLP(i.price * i.quantity)}</p>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCLP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-medium' : ''}>
                    {shippingCost === 0 ? 'Gratis' : formatCLP(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>{formatCLP(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-5"
              >
                {loading ? (
                  <><Spinner size="sm" />Procesando...</>
                ) : (
                  'Pagar con MercadoPago'
                )}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                Serás redirigido a MercadoPago para completar el pago de forma segura.
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
