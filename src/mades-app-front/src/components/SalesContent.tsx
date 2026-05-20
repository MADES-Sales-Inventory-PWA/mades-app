import React from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Wifi,
  WifiOff,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Input } from "./Input";
import type { Product } from "../types/Types";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useToast } from "./ToastProvider";
import { fetchProducts } from "../services/products";
import { createSale, syncPendingSales, refreshProductsCache } from "../services/sales";
import {
  cacheProducts,
  getCachedProducts,
  savePendingSale,
  getPendingSales,
  updateCachedProductQuantity,
} from "../db/salesDB";

type CartItem = Product & { cartQuantity: number };

export const SalesContent = () => {
  const isOnline = useOnlineStatus();
  const { showToast } = useToast();
  const wasOnlineRef = React.useRef(isOnline);

  const [products, setProducts] = React.useState<Product[]>([]);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // ── Data loading ────────────────────────────────────────────────────────

  const loadPendingCount = React.useCallback(async () => {
    const pending = await getPendingSales();
    setPendingCount(
      pending.filter((s) => s.status === "pending" || s.status === "failed").length
    );
  }, []);

  const loadProducts = React.useCallback(
    async (forceOnline = false) => {
      setIsLoading(true);
      try {
        if (isOnline || forceOnline) {
          const remote = await fetchProducts();
          await cacheProducts(remote);
          setProducts(remote.filter((p) => p.isActive));
        } else {
          const cached = await getCachedProducts();
          setProducts(cached.filter((p) => p.isActive));
        }
      } catch {
        try {
          const cached = await getCachedProducts();
          setProducts(cached.filter((p) => p.isActive));
          if (isOnline) {
            showToast(
              "No se pudieron obtener los productos del servidor. Mostrando datos locales.",
              "info"
            );
          }
        } catch {
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isOnline, showToast]
  );

  // ── Sync ────────────────────────────────────────────────────────────────

  const handleSync = React.useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      const { synced, failed } = await syncPendingSales();

      if (synced > 0) {
        showToast(
          `${synced} venta(s) sincronizada(s) correctamente.`,
          "success"
        );
        await refreshProductsCache();
        await loadProducts(true);
        await loadPendingCount();
      }

      if (failed > 0) {
        showToast(`${failed} venta(s) no se pudieron sincronizar.`);
      }

      if (synced === 0 && failed === 0) {
        showToast("No hay ventas pendientes de sincronizar.", "info");
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error al sincronizar ventas"
      );
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, showToast, loadProducts, loadPendingCount]);

  // ── Auto-sync when connection is restored ───────────────────────────────

  React.useEffect(() => {
    if (isOnline && !wasOnlineRef.current) {
      void handleSync();
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline, handleSync]);

  React.useEffect(() => {
    void loadProducts();
    void loadPendingCount();
  }, [loadProducts, loadPendingCount]);

  // ── Filtered product list ───────────────────────────────────────────────

  const displayedProducts = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  // ── Cart operations ─────────────────────────────────────────────────────

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        if (existing.cartQuantity >= product.quantity) {
          showToast(
            `Stock insuficiente para "${product.name}". Disponible: ${product.quantity}`
          );
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }

      if (product.quantity < 1) {
        showToast(`"${product.name}" no tiene stock disponible.`);
        return prev;
      }

      return [...prev, { ...product, cartQuantity: 1 }];
    });
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }

  function updateCartQuantity(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) return item;
          const next = item.cartQuantity + delta;
          if (next <= 0) return null;
          if (next > item.quantity) {
            showToast(
              `Stock insuficiente para "${item.name}". Disponible: ${item.quantity}`
            );
            return item;
          }
          return { ...item, cartQuantity: next };
        })
        .filter(Boolean) as CartItem[]
    );
  }

  const cartTotal = React.useMemo(
    () => cart.reduce((sum, item) => sum + item.sellingPrice * item.cartQuantity, 0),
    [cart]
  );

  // ── Register / queue sale ───────────────────────────────────────────────

  async function handleRegisterSale() {
    if (cart.length === 0) {
      showToast("El carrito está vacío.");
      return;
    }

    setIsSubmitting(true);

    const saleItems = cart.map((item) => ({
      productId: item.id,
      quantity: item.cartQuantity,
      price: item.sellingPrice,
    }));

    try {
      if (isOnline) {
        await createSale({ items: saleItems });

        for (const item of cart) {
          await updateCachedProductQuantity(
            item.id,
            item.quantity - item.cartQuantity
          );
        }

        showToast("Venta registrada exitosamente.", "success");
        await loadProducts(true);
      } else {
        await savePendingSale({
          items: saleItems,
          createdAt: new Date().toISOString(),
          status: "pending",
        });

        for (const item of cart) {
          await updateCachedProductQuantity(
            item.id,
            item.quantity - item.cartQuantity
          );
        }

        setProducts((prev) =>
          prev.map((p) => {
            const inCart = cart.find((c) => c.id === p.id);
            return inCart
              ? { ...p, quantity: p.quantity - inCart.cartQuantity }
              : p;
          })
        );

        await loadPendingCount();
        showToast(
          "Venta guardada localmente. Se sincronizará al recuperar la conexión.",
          "success"
        );
      }

      setCart([]);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "No se pudo registrar la venta"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="px-4 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
            Registro de ventas
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {isOnline
              ? "Modo online — las ventas se registran en tiempo real."
              : "Modo offline — las ventas se guardarán localmente."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
              isOnline
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isOnline ? "Online" : "Offline"}
          </span>

          {pendingCount > 0 && (
            <button
              type="button"
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-200 disabled:opacity-60"
            >
              {isSyncing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Clock size={14} />
              )}
              {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
            </button>
          )}
        </div>
      </div>

      {/* Offline warning — HU-05 */}
      {!isOnline && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Sin conexión: las ventas se almacenarán localmente y se sincronizarán
          automáticamente al recuperar la red. La edición de productos está
          deshabilitada.
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* ── Product list ─────────────────────────────────────────────── */}
        <div>
          <div className="mb-3">
            <Input
              type="text"
              placeholder="Buscar por nombre o código de barras..."
              onChange={setSearchTerm}
              value={searchTerm}
              icon={<Search />}
              height="h-8"
            />
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
              Cargando productos...
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              No se encontraron productos.
            </div>
          ) : (
            <div className="max-h-[calc(100vh-360px)] space-y-2 overflow-y-auto pr-1">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${product.sellingPrice.toLocaleString("es-CO")} · Stock:{" "}
                      {product.quantity}
                    </p>
                    {product.barcode && (
                      <p className="text-xs text-gray-400">{product.barcode}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={product.quantity === 0}
                    className="ml-3 flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    <Plus size={14} />
                    Añadir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Cart ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShoppingCart size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">
              Carrito ({cart.length} producto{cart.length !== 1 ? "s" : ""})
            </h3>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10 text-sm text-slate-400">
              Agrega productos para registrar una venta.
            </div>
          ) : (
            <div className="mt-3 max-h-72 flex-1 space-y-2 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${item.sellingPrice.toLocaleString("es-CO")} c/u
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.id, -1)}
                      className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-gray-600 hover:bg-gray-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.cartQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(item.id, 1)}
                      className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-white text-gray-600 hover:bg-gray-50"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="ml-1 flex h-6 w-6 items-center justify-center rounded border border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <p className="w-24 shrink-0 text-right text-sm font-semibold text-gray-800">
                    ${(item.sellingPrice * item.cartQuantity).toLocaleString("es-CO")}
                  </p>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-sm font-semibold text-gray-800">
                <span>Total</span>
                <span>${cartTotal.toLocaleString("es-CO")}</span>
              </div>

              <button
                type="button"
                onClick={handleRegisterSale}
                disabled={isSubmitting}
                className="mt-3 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isSubmitting
                  ? "Registrando..."
                  : isOnline
                  ? "Registrar venta"
                  : "Guardar venta offline"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
