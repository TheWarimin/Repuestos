import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function CheckoutSuccess({ status }) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const resolvedStatus = status || 'success';

  const config = {
    success: {
      icon: '🎉',
      title: '¡Pago exitoso!',
      message: 'Tu pedido ha sido confirmado. Recibirás un correo con los detalles de tu compra.',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    failure: {
      icon: '❌',
      title: 'Pago fallido',
      message: 'No se pudo procesar tu pago. Puedes intentarlo nuevamente desde el detalle de tu pedido.',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
    pending: {
      icon: '⏳',
      title: 'Pago pendiente',
      message: 'Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
  };

  const c = config[resolvedStatus];

  return (
    <>
      <Helmet>
        <title>
          {resolvedStatus === 'success' ? 'Pago exitoso' : resolvedStatus === 'failure' ? 'Pago fallido' : 'Pago pendiente'}{' '}
          — RepuestosCL
        </title>
      </Helmet>

      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className={`card p-8 border ${c.border} ${c.bg}`}>
          <p className="text-6xl mb-4">{c.icon}</p>
          <h1 className={`text-2xl font-bold mb-3 ${c.color}`}>{c.title}</h1>
          <p className="text-gray-600 mb-6">{c.message}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            {orderId && (
              <Link to={`/mis-pedidos/${orderId}`} className="btn-primary flex-1">
                Ver pedido
              </Link>
            )}
            <Link to="/productos" className="btn-secondary flex-1">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
