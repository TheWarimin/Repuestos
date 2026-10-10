import useCartStore from '../../store/cartStore.js';
import { Link } from 'react-router-dom';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 50000 ? 0 : 3990;
  const total = subtotal + shippingCost;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-96 bg-white shadow-xl transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            Tu carrito{' '}
            {items.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({items.reduce((a, i) => a + i.quantity, 0)} items)
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <span className="text-6xl">🛒</span>
              <p className="text-gray-500">Tu carrito está vacío</p>
              <button onClick={closeCart} className="btn-primary">
                Ver productos
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item._id} className="flex gap-3">
                  <img
                    src={item.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%239ca3af'%3ESin imagen%3C/text%3E%3C/svg%3E"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-sm text-primary-600 font-semibold">{formatCLP(item.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCLP(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-4 space-y-3">
            <div className="space-y-1 text-sm">
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
              {shippingCost > 0 && (
                <p className="text-xs text-gray-400">
                  Envío gratis en compras sobre {formatCLP(50000)}
                </p>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCLP(total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center"
            >
              Ir al checkout
            </Link>
            <button
              onClick={closeCart}
              className="btn-secondary w-full text-sm"
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
