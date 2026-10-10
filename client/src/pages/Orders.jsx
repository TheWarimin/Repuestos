import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI
      .getMyOrders()
      .then((r) => setOrders(r.data.orders || r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="h-64" size="lg" />;

  return (
    <>
      <Helmet>
        <title>Mis pedidos — RepuestosCL</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="section-title mb-6">Mis pedidos</h1>

        {orders.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <p className="text-5xl mb-4">📦</p>
            <p className="font-medium text-gray-600 text-lg">Aún no tienes pedidos</p>
            <Link to="/productos" className="btn-primary mt-4 inline-block">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order._id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">
                        #{order._id.slice(-8).toUpperCase()} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString('es-CL', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </p>
                      <p className="font-bold text-gray-900 mt-0.5">{formatCLP(order.total)}</p>
                    </div>
                    <span className={`badge ${st.class} self-start`}>{st.label}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-2 py-1">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-400">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={`/mis-pedidos/${order._id}`}
                    className="btn-secondary text-sm py-1.5"
                  >
                    Ver detalles →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
