import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { categoriesAPI } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const initialForm = { name: '', description: '' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchCategories = () => {
    setLoading(true);
    categoriesAPI
      .getAll()
      .then((r) => setCategories(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetchCategories, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSubmitting(true);
    try {
      if (editTarget) {
        await categoriesAPI.update(editTarget._id, form);
        toast.success('Categoría actualizada');
      } else {
        await categoriesAPI.create(form);
        toast.success('Categoría creada');
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    try {
      await categoriesAPI.delete(cat._id);
      toast.success('Categoría eliminada');
      setConfirmDelete(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar categoría');
    }
  };

  return (
    <>
      <Helmet>
        <title>Categorías — Admin RepuestosCL</title>
      </Helmet>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title !mb-0">Categorías</h1>
          <button onClick={openCreate} className="btn-primary text-sm">
            + Nueva categoría
          </button>
        </div>

        {loading ? (
          <Spinner className="h-48" size="lg" />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Slug</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Estado</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                      No hay categorías
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden md:table-cell">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`badge ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {cat.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(cat)}
                            className="btn-secondary text-xs py-1 px-2"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setConfirmDelete(cat)}
                            className="btn-danger text-xs py-1 px-2"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={closeModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="card p-6 w-full max-w-md">
              <h3 className="font-bold text-gray-900 mb-4">
                {editTarget ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Nombre *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="input-field"
                    placeholder="Motor, Frenos..."
                    required
                  />
                </div>
                <div>
                  <label className="label">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="input-field"
                    placeholder="Breve descripción de la categoría..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="card p-6 max-w-sm w-full">
              <h3 className="font-bold text-gray-900 mb-2">¿Eliminar categoría?</h3>
              <p className="text-gray-500 text-sm mb-5">
                Se eliminará <strong>{confirmDelete.name}</strong>. Los productos asociados no serán borrados.
              </p>
              <div className="flex gap-3">
                <button onClick={() => handleDelete(confirmDelete)} className="btn-danger flex-1">
                  Eliminar
                </button>
                <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
