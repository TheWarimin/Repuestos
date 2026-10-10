import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { connectAdminSocket, disconnectSocket } from '../../services/socket.js';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/productos', label: 'Productos', icon: '📦' },
  { to: '/admin/categorias', label: 'Categorías', icon: '📂' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: '🛒' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socket = connectAdminSocket(token);

    socket.on('newOrder', (data) => {
      setNotifCount((c) => c + 1);
      toast.custom(
        (t) => (
          <div
            className={`bg-white border-l-4 border-primary-600 rounded-lg shadow-lg p-4 max-w-sm flex gap-3 ${
              t.visible ? 'animate-fade-in' : ''
            }`}
          >
            <span className="text-2xl">🛒</span>
            <div>
              <p className="font-semibold text-gray-900">Nuevo pedido recibido</p>
              <p className="text-sm text-gray-500">
                Total: {formatCLP(data.total)}
              </p>
            </div>
          </div>
        ),
        { duration: 6000 }
      );
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const formatCLP = (n) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar overlay - mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 h-16 border-b border-gray-700 flex-shrink-0">
          <span className="text-xl">🔧</span>
          <span className="font-bold text-lg">RepuestosCL</span>
          <span className="ml-auto text-xs bg-amber-500 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.label === 'Pedidos' && notifCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {notifCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-gray-700 px-4 py-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            Cerrar sesión →
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-4 ml-auto">
            {notifCount > 0 && (
              <button
                onClick={() => { setNotifCount(0); navigate('/admin/pedidos'); }}
                className="relative p-2 text-gray-500 hover:text-primary-600"
                title="Ver pedidos nuevos"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              </button>
            )}
            <NavLink
              to="/"
              target="_blank"
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              Ver tienda ↗
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
