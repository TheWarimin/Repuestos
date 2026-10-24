import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productsAPI, categoriesAPI } from '../services/api.js';
import ProductCard from '../components/ui/ProductCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtros
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [year, setYear] = useState(searchParams.get('year') || '');
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data)).catch(console.error);
    productsAPI.getVehicles().then((r) => setVehicles(r.data)).catch(console.error);
  }, []);

  const modelOptions = vehicles.find((v) => v.make === make)?.models || [];

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 12, sort };
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (make) params.make = make;
    if (model) params.model = model;
    if (year) params.year = year;

    productsAPI
      .getAll(params)
      .then((r) => {
        setProducts(r.data.products);
        setPages(r.data.pages);
        setTotal(r.data.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, search, selectedCategory, sort, minPrice, maxPrice, make, model, year]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applyFilters = () => {
    setPage(1);
    const params = {};
    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (sort) params.sort = sort;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (make) params.make = make;
    if (model) params.model = model;
    if (year) params.year = year;
    setSearchParams(params);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setMake('');
    setModel('');
    setYear('');
    setPage(1);
    setSearchParams({});
  };

  const hasFilters = search || selectedCategory || minPrice || maxPrice || make || model || year;

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Vehículo</h3>
        <div className="space-y-2">
          <select
            value={make}
            onChange={(e) => { setMake(e.target.value); setModel(''); }}
            className="input-field text-sm"
          >
            <option value="">Todas las marcas</option>
            {vehicles.map((v) => (
              <option key={v.make} value={v.make}>{v.make}</option>
            ))}
          </select>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={!make}
            className="input-field text-sm"
          >
            <option value="">Todos los modelos</option>
            {modelOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Año"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="input-field text-sm"
            min="1950"
            max="2100"
          />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categoría</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => setSelectedCategory('')}
              className="text-primary-600"
            />
            <span className="text-sm text-gray-700">Todas</span>
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat._id}
                onChange={() => setSelectedCategory(cat._id)}
                className="text-primary-600"
              />
              <span className="text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Precio (CLP)</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín."
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input-field text-sm"
            min="0"
          />
          <input
            type="number"
            placeholder="Máx."
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-field text-sm"
            min="0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button onClick={applyFilters} className="btn-primary w-full">
          Aplicar filtros
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-secondary w-full text-sm">
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Productos — Dreyes</title>
        <meta name="description" content="Explora nuestra amplia selección de repuestos automotrices para todo tipo de vehículos." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="section-title mb-2">Productos</h1>
          {total > 0 && (
            <p className="text-gray-500 text-sm">{total} resultados encontrados</p>
          )}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Buscar repuesto, marca, referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="input-field pl-10"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input-field sm:w-48"
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
            <option value="popular">Más vendidos</option>
          </select>
          <button
            onClick={() => setFiltersOpen(true)}
            className="btn-secondary lg:hidden flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros {hasFilters && <span className="badge bg-primary-100 text-primary-700">•</span>}
          </button>
          <button onClick={applyFilters} className="btn-primary hidden sm:flex">
            Buscar
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filtros — desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-4 sticky top-24">
              <h2 className="font-bold text-gray-900 mb-4">Filtros</h2>
              {FilterPanel()}
            </div>
          </aside>

          {/* Mobile filtros drawer */}
          {filtersOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setFiltersOpen(false)} />
              <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl p-4 overflow-y-auto lg:hidden animate-slide-in-right">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Filtros</h2>
                  <button onClick={() => setFiltersOpen(false)} className="p-1">✕</button>
                </div>
                {FilterPanel()}
              </div>
            </>
          )}

          {/* Productos */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <Spinner className="h-48" size="lg" />
            ) : products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-medium text-gray-600">No se encontraron productos</p>
                <p className="text-sm mt-1">Prueba con otros filtros o términos de búsqueda</p>
                <button onClick={clearFilters} className="btn-primary mt-4">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </div>

                {/* Paginación */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                    >
                      ← Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                      Página {page} de {pages}
                    </span>
                    <button
                      disabled={page === pages}
                      onClick={() => setPage(page + 1)}
                      className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
