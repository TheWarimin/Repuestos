import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext.jsx';
import { usersAPI } from '../services/api.js';
import Spinner from '../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileChange = (e) =>
    setProfileForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handlePasswordChange = (e) =>
    setPasswordForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await usersAPI.updateProfile(profileForm);
      updateUser(res.data);
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setPasswordLoading(true);
    try {
      await usersAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Contraseña actualizada correctamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Mi perfil — RepuestosCL</title>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="section-title mb-6">Mi perfil</h1>

        {/* Avatar */}
        <div className="card p-6 flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`badge text-xs mt-1 ${user?.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
              {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {['profile', 'password'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'profile' ? 'Datos personales' : 'Contraseña'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div className="card p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre completo</label>
                <input
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="input-field"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="label">Correo electrónico</label>
                <input
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="input-field"
                  placeholder="tu@correo.cl"
                />
              </div>
              <div>
                <label className="label">Teléfono</label>
                <input
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="input-field"
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <button type="submit" disabled={profileLoading} className="btn-primary">
                {profileLoading ? <><Spinner size="sm" />Guardando...</> : 'Guardar cambios'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="card p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label">Contraseña actual</label>
                <input
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="label">Nueva contraseña</label>
                <input
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label className="label">Confirmar nueva contraseña</label>
                <input
                  name="confirmNewPassword"
                  type="password"
                  value={passwordForm.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="input-field"
                  placeholder="Repite la nueva contraseña"
                />
              </div>
              <button type="submit" disabled={passwordLoading} className="btn-primary">
                {passwordLoading ? <><Spinner size="sm" />Actualizando...</> : 'Cambiar contraseña'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
