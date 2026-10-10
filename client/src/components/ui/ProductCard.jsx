import { Link } from 'react-router-dom';
import useCartStore from '../../store/cartStore.js';
import toast from 'react-hot-toast';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock < 1) return;
    addItem(product);
    toast.success(`${product.name} agregado al carrito`);
    openCart();
  };

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  return (
    <Link to={`/productos/${product.slug}`} className="card group flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0]?.url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='24' fill='%239ca3af'%3ESin imagen%3C/text%3E%3C/svg%3E"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discount && (
          <span className="absolute top-2 left-2 badge bg-red-100 text-red-700">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge bg-gray-200 text-gray-600 text-sm">Sin stock</span>
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 badge bg-amber-100 text-amber-700">
            Destacado
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {product.brand && (
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        {product.partNumber && (
          <p className="text-xs text-gray-400 mt-1">Ref: {product.partNumber}</p>
        )}

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-lg font-bold text-primary-700">{formatCLP(product.price)}</p>
            {product.comparePrice && product.comparePrice > product.price && (
              <p className="text-xs text-gray-400 line-through">{formatCLP(product.comparePrice)}</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="btn-primary text-xs py-2 px-3 flex-shrink-0"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Agregar
          </button>
        </div>

        <p className={`text-xs mt-2 ${product.stock < 5 && product.stock > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
          {product.stock === 0
            ? 'Sin stock'
            : product.stock < 5
            ? `¡Solo ${product.stock} disponibles!`
            : `${product.stock} en stock`}
        </p>
      </div>
    </Link>
  );
}
