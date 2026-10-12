import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ordersAPI } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'processing', label: 'En proceso' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

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

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    ordersAPI
      .getById(id)
      .then((r) => {
        setOrder(r.data);
        setNewStatus(r.data.status);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) {
      toast('El estado no cambió');
      return;
    }
    setUpdating(true);
    try {
      const res = await ordersAPI.updateStatus(id, { status: newStatus, note: statusNote });
      setOrder(res.data);
      setStatusNote('');
      toast.success('Estado actualizado');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Spinner className="h-64" size="lg" />;
  if (!order) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Pedido no encontrado</p>
        <Link to="/admin/pedidos" className="btn-primary mt-4">Volver a pedidos</Link>
      </div>
    );
  }

  const st = statusConfig[order.status] || statusConfig.pending;
  const pst = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;

  return (
    <>
      <Helmet>
        <title>Pedido #{String(order._id).slice(-8).toUpperCase()} — Admin Dreyes</title>
      </Helmet>

      <div>
        <div className="flex items-center gap-4 mb-6">
          <Link to="/admin/pedidos" className="text-primary-600 text-sm hover:underline">
            ← Pedidos
          </Link>
          <h1 className="section-title !mb-0">
            Pedido #{String(order._id).slice(-8).toUpperCase()}
          </h1>
          <span className={`badge ${st.class} ml-auto`}>{st.label}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productos y dirección */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Productos</h2>
              <ul className="divide-y divide-gray-100">
                {order.items.map((item, i) => (
                  <li key={i} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                    <img
                      src={item.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f3f4f6'/%3E%3C/svg%3E"}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{formatCLP(item.price)} × {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatCLP(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-3">Datos del cliente</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Nombre</p>
                  <p className="font-medium">{order.user?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Correo</p>
                  <p>{order.user?.email || '—'}</p>
                </div>
              </div>
            </div>

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
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-gray-400 text-xs whitespace-nowrap pt-0.5">
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

          {/* Panel lateral */}
          <div className="space-y-4">
            {/* Resumen monetario */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pago</span>
                  <span className={`badge ${pst.class}`}>{pst.label}</span>
                </div>
                {order.paymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID MercadoPago</span>
                    <span className="font-mono text-xs">{order.paymentId}</span>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCLP(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Envío</span>
                  <span>{order.shippingCost === 0 ? 'Gratis' : formatCLP(order.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                  <span>Total</span>
                  <span>{formatCLP(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Cambiar estado */}
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-4">Cambiar estado</h2>
              <div className="space-y-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-field"
                >
                  {statusOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Nota (opcional, ej: N° de seguimiento)"
                  className="input-field text-sm"
                />
                <button
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="btn-primary w-full"
                >
                  {updating ? 'Actualizando...' : 'Actualizar estado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
