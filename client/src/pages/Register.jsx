import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    if (!form.email) e.email = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido';
    if (!form.password) e.password = 'La contraseña es obligatoria';
    else if (form.password.length < 8) e.password = 'Mínimo 8 caracteres';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Debe incluir mayúsculas, minúsculas y números';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden';
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
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      toast.success('¡Cuenta creada! Bienvenido a RepuestosCL');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear la cuenta';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Registrarse — RepuestosCL</title>
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
        <div className="card w-full max-w-md p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary-700 mb-4">
              <span>🔧</span>RepuestosCL
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-gray-500 text-sm mt-1">Únete y empieza a comprar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="label">Nombre completo</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Juan Pérez"
                className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@correo.cl"
                className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="label">Teléfono (opcional)</label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                placeholder="+56 9 1234 5678"
                className="input-field"
                autoComplete="tel"
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  className={`input-field pr-10 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className={`input-field ${errors.confirmPassword ? 'border-red-400' : ''}`}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <><Spinner size="sm" />Creando cuenta...</> : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Al registrarte aceptas nuestros{' '}
            <span className="underline cursor-pointer">Términos de uso</span> y{' '}
            <span className="underline cursor-pointer">Política de privacidad</span>.
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
