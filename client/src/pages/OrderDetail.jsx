import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ordersAPI } from '../services/api.js';
import Spinner from '../components/ui/Spinner.jsx';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

const statusConfig = {
  pending: { label: 'Pendiente', class: 'bg-gray-100 text-gray-600' },
  processing: { label: 'En proceso', class: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Enviado', class: 'bg-amber-100 text-amber-700' },
  delivered: { label: 'Entregado', class: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-700' },
};

const paymentStatusConfig = {
  pending: { label: 'Pendiente', class: 'bg-gray-100 text-gray-600' },
  paid: { label: 'Pagado', class: 'bg-green-100 text-green-700' },
  failed: { label: 'Fallido', class: 'bg-red-100 text-red-700' },
  refunded: { label: 'Reembolsado', class: 'bg-purple-100 text-purple-700' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI
      .getById(id)
      .then((r) => setOrder(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner className="h-64" size="lg" />;
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Pedido no encontrado</p>
        <Link to="/mis-pedidos" className="btn-primary mt-4">Volver a mis pedidos</Link>
      </div>
    );
  }

  const st = statusConfig[order.status] || statusConfig.pending;
  const pst = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;

  return (
    <>
      <Helmet>
        <title>Pedido #{String(order._id).slice(-8).toUpperCase()} — Dreyes</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/mis-pedidos" className="text-primary-600 hover:underline text-sm">
            ← Mis pedidos
          </Link>
          <h1 className="section-title !mb-0">
            Pedido #{String(order._id).slice(-8).toUpperCase()}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Productos</h2>
              <ul className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <li key={i} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <img
                      src={item.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f3f4f6'/%3E%3C/svg%3E"}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatCLP(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-sm text-gray-900">
                      {formatCLP(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dirección */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-3">Dirección de envío</h2>
              <address className="not-italic text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{order.shippingAddress.recipientName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.commune}, {order.shippingAddress.city}</p>
                <p>{order.shippingAddress.region}</p>
                {order.shippingAddress.postalCode && <p>CP: {order.shippingAddress.postalCode}</p>}
                <p>📞 {order.shippingAddress.phone}</p>
              </address>
            </div>

            {/* Historial */}
            {order.statusHistory?.length > 0 && (
              <div className="card p-5">
                <h2 className="font-bold text-gray-900 mb-3">Historial de estado</h2>
                <ul className="space-y-2">
                  {order.statusHistory.map((h, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="text-gray-400 text-xs whitespace-nowrap">
                        {new Date(h.date).toLocaleDateString('es-CL')}
                      </span>
                      <span className={`badge ${statusConfig[h.status]?.class || ''}`}>
                        {statusConfig[h.status]?.label || h.status}
                      </span>
                      {h.note && <span className="text-gray-500">{h.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado</span>
                  <span className={`badge ${st.class}`}>{st.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pago</span>
                  <span className={`badge ${pst.class}`}>{pst.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('es-CL')}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCLP(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Envío</span>
                  <span className={order.shippingCost === 0 ? 'text-green-600' : ''}>
                    {order.shippingCost === 0 ? 'Gratis' : formatCLP(order.shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>{formatCLP(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
