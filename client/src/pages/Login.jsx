import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('¡Bienvenido de vuelta!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Iniciar sesión — RepuestosCL</title>
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="card w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-700 mb-4">
              <span>🔧</span>RepuestosCL
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="text-gray-500 text-sm mt-1">Accede a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="label">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@correo.cl"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <><Spinner size="sm" />Ingresando...</> : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-primary-600 font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
