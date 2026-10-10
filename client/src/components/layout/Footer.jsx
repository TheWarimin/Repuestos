import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔧</span>
              <span className="text-xl font-bold text-white">RepuestosCL</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Tu tienda de confianza para repuestos automotrices. Calidad garantizada y los mejores
              precios de Chile.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link to="/productos" className="hover:text-white transition-colors">Productos</Link></li>
              <li><Link to="/mis-pedidos" className="hover:text-white transition-colors">Mis pedidos</Link></li>
              <li><Link to="/perfil" className="hover:text-white transition-colors">Mi cuenta</Link></li>
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">Preguntas frecuentes</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Política de devoluciones</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Términos y condiciones</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Política de privacidad</span></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>contacto@repuestoscl.cl</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Santiago, Chile</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Facebook" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors text-sm">f</a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors text-sm">ig</a>
              <a href="#" aria-label="WhatsApp" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors text-sm">wa</a>
            </div>
          </div>
        </div>

        <hr className="border-gray-700 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {year} RepuestosCL. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2">
            <span>Pagos seguros con</span>
            <span className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-xs font-medium">MercadoPago</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
