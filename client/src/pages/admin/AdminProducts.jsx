import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsAPI } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';

const formatCLP = (n) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (search) params.search = search;
    productsAPI
      .adminGetAll(params)
      .then((r) => {
        setProducts(r.data.products);
        setPages(r.data.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id) => {
    try {
      await productsAPI.delete(id);
      toast.success('Producto eliminado');
      setConfirmDelete(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar producto');
    }
  };

  return (
    <>
      <Helmet>
        <title>Productos — Admin RepuestosCL</title>
      </Helmet>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title !mb-0">Productos</h1>
          <Link to="/admin/productos/nuevo" className="btn-primary text-sm">
            + Nuevo producto
          </Link>
        </div>

        {/* Búsqueda */}
        <div className="flex gap-3 mb-6">
          <input
            type="search"
            placeholder="Buscar por nombre, marca o referencia..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field flex-1"
          />
        </div>

        {loading ? (
          <Spinner className="h-48" size="lg" />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Producto</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Marca</th>
                    <th className="px-4 py-3 font-medium">Precio</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Stock</th>
                    <th className="px-4 py-3 font-medium hidden lg:table-cell">Estado</th>
                    <th className="px-4 py-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                        No se encontraron productos
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images?.[0]?.url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6'/%3E%3C/svg%3E"}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[200px]">{p.name}</p>
                              {p.partNumber && (
                                <p className="text-xs text-gray-400">Ref: {p.partNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.brand || '—'}</td>
                        <td className="px-4 py-3 font-medium">{formatCLP(p.price)}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={`badge ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock < 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`badge ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/productos/editar/${p._id}`}
                              className="btn-secondary text-xs py-1 px-2"
                            >
                              Editar
                            </Link>
                            <button
                              onClick={() => setConfirmDelete(p)}
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

            {/* Paginación */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-600">{page} / {pages}</span>
                <button
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setConfirmDelete(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="card p-6 max-w-sm w-full">
              <h3 className="font-bold text-gray-900 mb-2">¿Eliminar producto?</h3>
              <p className="text-gray-500 text-sm mb-5">
                Se desactivará <strong>{confirmDelete.name}</strong>. Esta acción puede revertirse editando el producto.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(confirmDelete._id)}
                  className="btn-danger flex-1"
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="btn-secondary flex-1"
                >
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
