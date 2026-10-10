import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsAPI, categoriesAPI } from '../../services/api.js';

import Spinner from '../../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  description: '',
  price: '',
  comparePrice: '',
  stock: '',
  brand: '',
  partNumber: '',
  category: '',
  isFeatured: false,
  isActive: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data)).catch(console.error);

    if (isEditing) {
      productsAPI
        .getById(id)
        .then((r) => {
          const p = r.data;
          setForm({
            name: p.name || '',
            description: p.description || '',
            price: p.price || '',
            comparePrice: p.comparePrice || '',
            stock: p.stock ?? '',
            brand: p.brand || '',
            partNumber: p.partNumber || '',
            category: p.category?._id || p.category || '',
            isFeatured: p.isFeatured || false,
            isActive: p.isActive !== undefined ? p.isActive : true,
          });
          setImages(p.images || []);
        })
        .catch(() => toast.error('No se pudo cargar el producto'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    setUploadingImage(true);
    try {
      const res = await productsAPI.uploadImage(data);
      setImages((prev) => [...prev, res.data]);
      toast.success('Imagen subida correctamente');
    } catch {
      toast.error('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async (publicId, idx) => {
    try {
      await productsAPI.deleteImage({ publicId });
      setImages((prev) => prev.filter((_, i) => i !== idx));
    } catch {
      toast.error('Error al eliminar imagen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) {
      toast.error('Completa los campos obligatorios: nombre, precio y stock');
      return;
    }

    const payload = {
      ...form,
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      stock: Number(form.stock),
      images,
    };

    setSubmitting(true);
    try {
      if (isEditing) {
        await productsAPI.update(id, payload);
        toast.success('Producto actualizado');
      } else {
        await productsAPI.create(payload);
        toast.success('Producto creado');
      }
      navigate('/admin/productos');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar producto');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner className="h-64" size="lg" />;

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar producto' : 'Nuevo producto'} — Admin RepuestosCL</title>
      </Helmet>

      <div className="max-w-3xl">
        <h1 className="section-title mb-6">
          {isEditing ? 'Editar producto' : 'Nuevo producto'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Información básica</h2>

            <div>
              <label className="label">Nombre del producto *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Ej: Pastillas de freno delanteras Bosch"
                required
              />
            </div>

            <div>
              <label className="label">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="input-field min-h-[100px] resize-y"
                placeholder="Descripción detallada del producto..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Marca</label>
                <input
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Bosch, NGK, Monroe..."
                />
              </div>
              <div>
                <label className="label">Referencia / Parte Nº</label>
                <input
                  name="partNumber"
                  value={form.partNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="GDB1234"
                />
              </div>
            </div>

            <div>
              <label className="label">Categoría</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Precio y stock */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Precio y stock</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Precio (CLP) *</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="25000"
                  required
                />
              </div>
              <div>
                <label className="label">Precio antes de oferta (CLP)</label>
                <input
                  name="comparePrice"
                  type="number"
                  min="0"
                  value={form.comparePrice}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="32000"
                />
              </div>
            </div>

            <div>
              <label className="label">Stock *</label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                className="input-field"
                placeholder="10"
                required
              />
            </div>
          </div>

          {/* Imágenes */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-gray-900">Imágenes</h2>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.url}
                      alt={`Imagen ${idx + 1}`}
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.publicId, idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
              {uploadingImage ? (
                <><Spinner size="sm" /><span className="text-sm text-gray-500">Subiendo imagen...</span></>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">Haz clic para subir imagen (JPG, PNG, WebP · máx. 5MB)</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
          </div>

          {/* Opciones */}
          <div className="card p-6 space-y-3">
            <h2 className="font-bold text-gray-900 mb-2">Opciones</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">Mostrar en sección "Destacados"</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="text-sm text-gray-700">Producto activo (visible en la tienda)</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? <><Spinner size="sm" />Guardando...</> : isEditing ? 'Actualizar producto' : 'Crear producto'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/productos')}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
