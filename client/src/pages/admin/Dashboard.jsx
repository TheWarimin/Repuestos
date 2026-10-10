import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ordersAPI } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersAPI.getStats(),
      ordersAPI.adminGetAll({ limit: 5, sort: 'newest' }),
    ])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.orders || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="h-64" size="lg" />;

  const statCards = [
    { label: 'Pedidos hoy', value: stats?.todayOrders ?? 0, icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Total pedidos', value: stats?.totalOrders ?? 0, icon: '🗂️', color: 'bg-gray-50 text-gray-700' },
    { label: 'Pendientes', value: stats?.pendingOrders ?? 0, icon: '⏳', color: 'bg-amber-50 text-amber-700' },
    { label: 'Ingresos totales', value: formatCLP(stats?.totalRevenue ?? 0), icon: '💰', color: 'bg-green-50 text-green-700' },
  ];

  const statusConfig = {
    pending: { label: 'Pendiente', class: 'bg-gray-100 text-gray-600' },
    processing: { label: 'En proceso', class: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'Enviado', class: 'bg-amber-100 text-amber-700' },
    delivered: { label: 'Entregado', class: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-700' },
  };

  return (
    <>
      <Helmet>
        <title>Dashboard — Admin RepuestosCL</title>
      </Helmet>

      <div>
        <h1 className="section-title mb-6">Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="card p-5">
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Últimos pedidos */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Últimos pedidos</h2>
            <Link to="/admin/pedidos" className="text-primary-600 text-sm hover:underline">
              Ver todos →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No hay pedidos todavía</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2 font-medium">Pedido</th>
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Total</th>
                    <th className="pb-2 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => {
                    const st = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="py-2.5">
                          <Link to={`/admin/pedidos/${order._id}`} className="font-mono text-primary-600 hover:underline">
                            #{order._id.slice(-8).toUpperCase()}
                          </Link>
                        </td>
                        <td className="py-2.5 text-gray-700">{order.user?.name || '—'}</td>
                        <td className="py-2.5 font-medium">{formatCLP(order.total)}</td>
                        <td className="py-2.5">
                          <span className={`badge ${st.class}`}>{st.label}</span>
                        </td>
                        <td className="py-2.5 text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('es-CL')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
