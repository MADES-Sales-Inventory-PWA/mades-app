import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Box,
  House,
  ShoppingCart,
  Users,
  Search,
  Scan,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sliders,
  ArrowUpDown,
} from "lucide-react";
import { SideBar } from "../../components/SideBar";
import { Header } from "../../components/Header";
import { constants } from "../../constants/Constants";
import { ProductCard } from "../../components/ProductCard";
import { getTotalUnits, mockProducts } from "../../data/products";

type InventoryItem = {
  id: string;
  nombre: string;
  descripcion: string;
  codigoBarras: string;
  talla: string;
  precio: number;
  cantidadDisponible: number;
  cantidadAlerta: number;
  imagen?: string;
};

type SortOption = "nombre" | "precio" | "unidades" | "disponibles";
type FilterOption = "bajo" | "agotado" | "normal";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  enabled: boolean;
};

const getStockStatus = (disponible: number, alerta: number) => {
  if (disponible === 0) return "agotado";
  if (disponible <= alerta) return "bajo";
  return "normal";
};

export default function InventoryPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("nombre");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [unitsRange, setUnitsRange] = useState({ min: 0, max: 500 });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const inventoryItems = useMemo<InventoryItem[]>(
    () =>
      mockProducts.map((product) => {
        const firstSize = product.tallasRegistradas[0];
        return {
          id: product.sku,
          nombre: product.nombre,
          descripcion: product.descripcion,
          codigoBarras: product.sku,
          talla: firstSize?.talla ?? "N/A",
          precio: product.precio,
          cantidadDisponible: getTotalUnits(product),
          cantidadAlerta: Math.max(...product.tallasRegistradas.map((size) => size.unidadesAlerta)),
          imagen: product.imagen,
        };
      }),
    []
  );

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: "Inicio",
        icon: <House size={18} />,
        path: "/inicio-admin",
        enabled: true,
      },
      {
        label: "Inventario",
        icon: <Box size={18} />,
        path: "/inventario",
        enabled: true,
      },
      {
        label: "Carrito",
        icon: <ShoppingCart size={18} />,
        path: "/carrito",
        enabled: false,
      },
      {
        label: "Reportes",
        icon: <BarChart3 size={18} />,
        path: "/reportes",
        enabled: false,
      },
      {
        label: "Empleados",
        icon: <Users size={18} />,
        path: "/empleados",
        enabled: false,
      },
    ],
    []
  );

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    let resultado = inventoryItems.filter((producto) => {
      const matchBusqueda =
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.codigoBarras.includes(searchTerm);

      const status = getStockStatus(producto.cantidadDisponible, producto.cantidadAlerta);
      const matchFiltro =
        selectedFilters.length === 0 || selectedFilters.includes(status as FilterOption);

      const matchPriceRange = producto.precio >= priceRange.min && producto.precio <= priceRange.max;
      const matchUnitsRange = producto.cantidadDisponible >= unitsRange.min && producto.cantidadDisponible <= unitsRange.max;

      return matchBusqueda && matchFiltro && matchPriceRange && matchUnitsRange;
    });

    // Ordenar
    if (sortBy === "nombre") {
      resultado.sort((a, b) => {
        const comparison = a.nombre.localeCompare(b.nombre);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "precio") {
      resultado.sort((a, b) => {
        const comparison = a.precio - b.precio;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "unidades") {
      resultado.sort((a, b) => {
        const comparison = a.cantidadDisponible - b.cantidadDisponible;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "disponibles") {
      resultado.sort((a, b) => {
        const comparison = b.cantidadDisponible - a.cantidadDisponible;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return resultado;
  }, [searchTerm, sortBy, sortDirection, selectedFilters, priceRange, unitsRange, inventoryItems]);

  // Paginación
  const itemsPerPage = 30;
  const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const productosVisibles = productosFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterToggle = (filtro: FilterOption) => {
    setSelectedFilters((prev) =>
      prev.includes(filtro) ? prev.filter((f) => f !== filtro) : [...prev, filtro]
    );
    setCurrentPage(1);
  };

  return (
    <>
      <style>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="min-h-screen w-full bg-gradient-to-tr from-background to-background-2">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
          <aside className="hidden lg:block">
            <SideBar roleid={constants.ADMIN_ROLE_ID} />
          </aside>

          <main className="flex min-h-screen w-full flex-col pb-24 lg:pb-8">
            <Header title="Inventario de Productos" showMobileIcon={true} enableLogoMenu={true} />

            <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 p-4 lg:p-6">
              {/* Controles superiores */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Búsqueda y escaneo */}
                <div className="flex gap-2">
                  <div className="relative flex-1 lg:w-80">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full rounded-xl border border-input-border bg-white py-2 pl-10 pr-4 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary-blue"
                    />
                  </div>
                  <button
                    type="button"
                    className="rounded-xl bg-primary-blue p-2 text-white transition hover:bg-primary-blue-hover"
                    aria-label="Escanear código de barras"
                  >
                    <Scan size={20} />
                  </button>
                </div>

                {/* Botón agregar producto */}
                <button
                  type="button"
                  onClick={() => navigate("/productos/crear")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-blue px-4 py-2 text-white transition hover:bg-primary-blue-hover"
                >
                  <Plus size={18} />
                  <span className="font-semibold">Agregar Producto</span>
                </button>
              </div>

              {/* Controles de filtro y orden */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {/* Ordenar */}
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
                    <ArrowUpDown size={18} className="text-slate-500" />
                    <div className="flex items-center gap-2">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                      >
                        <option value="nombre">Orden alfabético</option>
                        <option value="precio">Por precio</option>
                        <option value="unidades">Por unidades</option>
                        <option value="disponibles">Disponibles</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700 transition hover:bg-slate-100"
                      >
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </button>
                    </div>
                  </div>

                  {/* Filtro */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowFilters(!showFilters)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Sliders size={18} />
                      Filtros
                    </button>

                    {showFilters && (
                      <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-700">Rango de Precio</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                                className="w-1/2 rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary-blue"
                              />
                              <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                                className="w-1/2 rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary-blue"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-700">Rango de Unidades</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="Min"
                                value={unitsRange.min}
                                onChange={(e) => setUnitsRange({...unitsRange, min: Number(e.target.value)})}
                                className="w-1/2 rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary-blue"
                              />
                              <input
                                type="number"
                                placeholder="Max"
                                value={unitsRange.max}
                                onChange={(e) => setUnitsRange({...unitsRange, max: Number(e.target.value)})}
                                className="w-1/2 rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-primary-blue"
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedFilters.includes("bajo")}
                              onChange={() => handleFilterToggle("bajo")}
                              className="h-4 w-4 rounded accent-primary-blue"
                            />
                            <span className="text-sm text-slate-700">Stocks Bajos</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedFilters.includes("agotado")}
                              onChange={() => handleFilterToggle("agotado")}
                              className="h-4 w-4 rounded accent-primary-blue"
                            />
                            <span className="text-sm text-slate-700">Stocks Agotados</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedFilters.includes("normal")}
                              onChange={() => handleFilterToggle("normal")}
                              className="h-4 w-4 rounded accent-primary-blue"
                            />
                            <span className="text-sm text-slate-700">Stocks Normales</span>
                          </label>
                        </div>
                        {selectedFilters.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFilters([]);
                              setCurrentPage(1);
                            }}
                            className="mt-3 w-full rounded-lg bg-slate-100 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contador de resultados */}
                <p className="text-sm text-slate-600">
                  {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Grid de productos */}
              {productosVisibles.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {productosVisibles.map((producto) => {
                    return (
                      <ProductCard
                        key={producto.id}
                        id={producto.id}
                        nombre={producto.nombre}
                        descripcion={producto.descripcion}
                        codigoBarras={producto.codigoBarras}
                        talla={producto.talla}
                        precio={producto.precio}
                        cantidadDisponible={producto.cantidadDisponible}
                        cantidadAlerta={producto.cantidadAlerta}
                        imagen={producto.imagen}
                        onView={(id) => navigate(`/productos/${id}`)}
                        onEdit={(id) => navigate(`/productos/editar/${id}`)}
                        onAddToCart={(id) => navigate(`/productos/${id}?accion=carrito`)}
                        onDeactivate={(id) => navigate(`/productos/${id}?accion=eliminar`)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                  <Box size={48} className="mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-600">No se encontraron productos</p>
                </div>
              )}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="disabled:text-slate-300 rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                          page === currentPage
                            ? "bg-primary-blue text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="disabled:text-slate-300 rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 disabled:hover:bg-transparent"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <span className="text-sm text-slate-600">
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
              )}
            </section>
          </main>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white px-1 py-2 shadow-[0_-6px_20px_rgba(15,23,42,0.08)] lg:hidden">
          <div className="mx-auto grid max-w-[700px] grid-cols-5 gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={`mobile-${item.path}`}
                  type="button"
                  onClick={() => {
                    if (item.enabled) {
                      navigate(item.path);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-side-button shadow-sm text-primary-blue"
                      : item.enabled
                        ? "text-slate-500 hover:bg-white hover:text-primary-blue"
                        : "cursor-not-allowed text-slate-400"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
