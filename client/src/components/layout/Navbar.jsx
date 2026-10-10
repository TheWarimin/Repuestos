import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import useCartStore from '../../store/cartStore.js';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { items, openCart } = useCartStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/productos', label: 'Productos' },
  ];

  return (
    <nav
      className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🔧</span>
            <span className="text-xl font-bold text-primary-700 hidden sm:block">RepuestosCL</span>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium text-amber-700 hover:bg-amber-50 transition-colors"
              >
                Admin
              </NavLink>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Carrito de compras"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* User menu — desktop */}
            {isAuthenticated ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 animate-fade-in">
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mi perfil
                    </Link>
                    <Link
                      to="/mis-pedidos"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Mis pedidos
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Panel admin
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-1.5">
                  Ingresar
                </Link>
                <Link to="/registro" className="btn-primary text-sm py-1.5">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Menú"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className="block px-3 py-2 rounded-md text-sm font-medium text-amber-700 hover:bg-amber-50"
                onClick={() => setMenuOpen(false)}
              >
                Panel Admin
              </NavLink>
            )}
            <hr className="my-2 border-gray-100" />
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-500">
                  Hola, <span className="font-semibold text-gray-900">{user?.name}</span>
                </div>
                <Link
                  to="/perfil"
                  className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Mi perfil
                </Link>
                <Link
                  to="/mis-pedidos"
                  className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                  onClick={() => setMenuOpen(false)}
                >
                  Mis pedidos
                </Link>
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" className="flex-1 btn-secondary text-sm text-center" onClick={() => setMenuOpen(false)}>
                  Ingresar
                </Link>
                <Link to="/registro" className="flex-1 btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
