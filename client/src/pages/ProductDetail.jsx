import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsAPI } from '../services/api.js';
import useCartStore from '../store/cartStore.js';
import Spinner from '../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem, openCart } = useCartStore();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    productsAPI
      .getBySlug(slug)
      .then((r) => setProduct(r.data))
      .catch(() => setError('Producto no encontrado'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product || product.stock < 1) return;
    addItem(product, quantity);
    toast.success(`${product.name} agregado al carrito`);
    openCart();
  };

  if (loading) return <Spinner className="h-96" size="lg" />;
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
        <Link to="/productos" className="btn-primary mt-4">
          Ver todos los productos
        </Link>
      </div>
    );
  }

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  return (
    <>
      <Helmet>
        <title>{product.name} — RepuestosCL</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/productos" className="hover:text-gray-700">Productos</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Imágenes */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
              <img
                src={product.images?.[activeImage]?.url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='%239ca3af'%3ESin imagen%3C/text%3E%3C/svg%3E"}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-colors ${
                      activeImage === idx ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {product.brand && (
              <p className="text-sm text-gray-500 uppercase tracking-widest">{product.brand}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>

            {product.partNumber && (
              <p className="text-sm text-gray-500">
                Referencia: <span className="font-medium text-gray-700">{product.partNumber}</span>
              </p>
            )}

            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-primary-700">
                  {formatCLP(product.price)}
                </span>
                {discount && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatCLP(product.comparePrice)}
                    </span>
                    <span className="badge bg-red-100 text-red-700">-{discount}%</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">Precio en pesos chilenos (CLP)</p>
            </div>

            {/* Stock */}
            <div>
              {product.stock === 0 ? (
                <span className="badge bg-red-100 text-red-700 text-sm">Sin stock</span>
              ) : product.stock < 5 ? (
                <span className="badge bg-amber-100 text-amber-700 text-sm">
                  ¡Solo {product.stock} disponibles!
                </span>
              ) : (
                <span className="badge bg-green-100 text-green-700 text-sm">
                  En stock ({product.stock} disponibles)
                </span>
              )}
            </div>

            {/* Cantidad + Agregar */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
                <button onClick={handleAddToCart} className="btn-primary flex-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Agregar al carrito
                </button>
              </div>
            )}

            {/* Beneficios */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 space-y-2">
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <span>🚚</span> Envío gratis en compras sobre {formatCLP(50000)}
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <span>✅</span> Garantía de calidad en todos los productos
              </p>
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <span>🔒</span> Pago 100% seguro con MercadoPago
              </p>
            </div>

            {/* Descripción */}
            <div>
              <h2 className="font-bold text-gray-900 mb-2">Descripción</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Vehículos compatibles */}
            {product.compatibleVehicles?.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 mb-2">Vehículos compatibles</h2>
                <div className="flex flex-wrap gap-2">
                  {product.compatibleVehicles.map((v, i) => (
                    <span key={i} className="badge bg-blue-50 text-blue-700 text-sm">
                      {v.make} {v.model} {v.yearFrom}-{v.yearTo}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
