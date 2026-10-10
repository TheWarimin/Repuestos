import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ordersAPI } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

const statusConfig = {
  pending: { label: 'Pendiente', class: 'bg-gray-100 text-gray-600' },
  processing: { label: 'En proceso', class: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Enviado', class: 'bg-amber-100 text-amber-700' },
  delivered: { label: 'Entregado', class: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-700' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (statusFilter) params.status = statusFilter;
    ordersAPI
      .adminGetAll(params)
      .then((r) => {
        setOrders(r.data.orders);
        setPages(r.data.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(fetchOrders, [fetchOrders]);

  return (
    <>
      <Helmet>
        <title>Pedidos — Admin RepuestosCL</title>
      </Helmet>

      <div>
        <h1 className="section-title mb-6">Pedidos</h1>

        {/* Filtro de estado */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[['', 'Todos'], ...Object.entries(statusConfig).map(([k, v]) => [k, v.label])].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <Spinner className="h-48" size="lg" />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Pedido</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Cliente</th>
                    <th className="px-4 py-3 font-medium">Total</th>
                    <th className="px-4 py-3 font-medium">Estado</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Fecha</th>
                    <th className="px-4 py-3 font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                        No hay pedidos
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const st = statusConfig[order.status] || statusConfig.pending;
                      return (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs text-gray-700">
                            #{order._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-gray-700 hidden md:table-cell">
                            {order.user?.name || '—'}
                          </td>
                          <td className="px-4 py-3 font-medium">{formatCLP(order.total)}</td>
                          <td className="px-4 py-3">
                            <span className={`badge ${st.class}`}>{st.label}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                            {new Date(order.createdAt).toLocaleDateString('es-CL')}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              to={`/admin/pedidos/${order._id}`}
                              className="btn-secondary text-xs py-1 px-2"
                            >
                              Ver
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-600">{page} / {pages}</span>
                <button
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
