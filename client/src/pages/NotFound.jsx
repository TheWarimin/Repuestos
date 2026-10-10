import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Página no encontrada — RepuestosCL</title>
      </Helmet>

      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-8xl font-black text-gray-100 select-none">404</p>
        <p className="text-5xl -mt-8 mb-6">🔧</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Esta página no existe
        </h1>
        <p className="text-gray-500 mb-8">
          La dirección que buscas no está disponible o fue movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-primary">
            Ir al inicio
          </Link>
          <Link to="/productos" className="btn-secondary">
            Ver productos
          </Link>
        </div>
      </div>
    </>
  );
}
