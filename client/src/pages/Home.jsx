import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsAPI, categoriesAPI } from '../services/api.js';
import ProductCard from '../components/ui/ProductCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productsAPI.getFeatured(), categoriesAPI.getAll()])
      .then(([prodRes, catRes]) => {
        setFeatured(prodRes.data);
        setCategories(catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>RepuestosCL — Tu tienda de repuestos automotrices en Chile</title>
        <meta name="description" content="Encuentra los mejores repuestos automotrices para tu vehículo. Frenos, motor, suspensión, eléctrico y más. Envío a todo Chile." />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              Repuestos para tu{' '}
              <span className="text-accent-500">vehículo</span> al mejor precio
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Miles de repuestos disponibles. Envío express a todo Chile.
              Garantía en todos nuestros productos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/productos"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                Ver productos
              </Link>
              <Link
                to="/registro"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'Envío gratis', desc: 'En compras sobre $50.000' },
              { icon: '✅', title: 'Garantía', desc: 'En todos los productos' },
              { icon: '🔒', title: 'Pago seguro', desc: 'Con MercadoPago' },
              { icon: '📞', title: 'Soporte', desc: 'Lunes a sábado 9-18h' },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <span className="text-3xl">{b.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{b.title}</p>
                  <p className="text-xs text-gray-500">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Categorías</h2>
          <Link to="/productos" className="text-primary-600 text-sm font-medium hover:underline">
            Ver todas →
          </Link>
        </div>
        {loading ? (
          <Spinner className="h-24" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/productos?category=${cat._id}`}
                className="card flex flex-col items-center gap-2 py-4 px-2 hover:shadow-md hover:border-primary-200 border border-transparent transition-all group"
              >
                <span className="text-3xl">📦</span>
                <span className="text-xs font-medium text-center text-gray-700 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Productos destacados */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Productos destacados</h2>
          <Link to="/productos" className="text-primary-600 text-sm font-medium hover:underline">
            Ver todos →
          </Link>
        </div>
        {loading ? (
          <Spinner className="h-48" />
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No hay productos destacados por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Banner CTA */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-3xl font-bold mb-4">¿No encontraste lo que buscas?</h2>
          <p className="text-gray-400 mb-6">
            Contáctanos y te ayudamos a encontrar el repuesto que necesitas.
          </p>
          <a
            href="https://wa.me/56912345678"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
          >
            <span>💬</span>
            Contactar por WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}
