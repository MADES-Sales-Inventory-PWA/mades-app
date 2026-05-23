import React from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Clock,
  RefreshCw,
  Barcode,
} from "lucide-react";
import { Input } from "./Input";
import { BarcodeScanner } from "./BarcodeScanner";
import type { Product } from "../types/Types";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useToast } from "./ToastProvider";
import { fetchProducts } from "../services/products";
import { createSale, syncPendingSales, getPendingSalesCount } from "../services/sales";
import { productsDb } from "../sw/db/products.db";
import { salesDb } from "../sw/db/sales.db";

type CartItem = Product & { cartQuantity: number };

export const SalesContent = () => {
  const isOnline = useOnlineStatus();
  const { showToast } = useToast();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);

  // ── Data loading ────────────────────────────────────────────────────────

  const loadPendingCount = React.useCallback(async () => {
    const count = await getPendingSalesCount();
    setPendingCount(count);
  }, []);

  const loadProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await fetchProducts();
      setProducts(all.filter((p) => p.isActive));
    } catch {
      try {
        const stored = await productsDb.findAll();
        setProducts(
          stored
            .filter((p) => p.state)
            .map((p) => ({
              id: p.id,
              name: p.name,
              sizeTypeId: p.sizeTypeId,
              sizeValueId: p.sizeValueId,
              sellingPrice: p.purchasePrice,
              size: String(p.sizeValueId),
              barcode: p.barcode ?? "",
              description: p.description ?? "",
              imageUrl: p.imageUrl ?? "",
              purchasePrice: p.purchasePrice,
              quantity: p.quantity,
              minQuantity: p.minQuantity,
              isActive: p.state,
            }))
        );
      } catch {
        showToast("No se pudieron cargar los productos", "info");
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // ── Sync ────────────────────────────────────────────────────────────────

  const handleSync = React.useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      const { synced, failed } = await syncPendingSales();

      if (synced > 0) {
        showToast(`${synced} venta(s) sincronizada(s) correctamente.`, "success");
        await loadProducts();
      }

      if (failed > 0) {
        showToast(`${failed} venta(s) no se pudieron sincronizar.`);
      }

      if (synced === 0 && failed === 0) {
        showToast("No hay ventas pendientes de sincronizar.", "info");
      }

      await loadPendingCount();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Error al sincronizar ventas"
      );
      await loadPendingCount();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, showToast, loadProducts, loadPendingCount]);

  

  React.useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      void handleSync();
    }
  }, [isOnline, pendingCount, isSyncing, handleSync]);

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

  // ── Barcode scanner ─────────────────────────────────────────────────────

  const handleBarcodeDetected = React.useCallback((barcode: string) => {
    setShowScanner(false);
    const product = products.find(
      (p) => p.barcode.toLowerCase() === barcode.toLowerCase()
    );
    if (!product) {
      showToast(`Código "${barcode}" no encontrado en el inventario.`);
      return;
    }
    addToCart(product);
    showToast(`"${product.name}" agregado al carrito.`, "success");
  }, [products, showToast]); // eslint-disable-line react-hooks/exhaustive-deps

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
      if (!isOnline) {
        // Offline: validate + persist to IndexedDB directly (no SW needed)
        for (const item of cart) {
          const stored = await productsDb.findById(item.id);
          if (!stored) {
            showToast(`"${item.name}" no existe en el inventario local.`);
            return;
          }
          if (stored.quantity < item.cartQuantity) {
            showToast(
              `Stock insuficiente para "${item.name}". Disponible: ${stored.quantity}`
            );
            return;
          }
        }

        for (const item of cart) {
          const stored = await productsDb.findById(item.id);
          if (stored) {
            await productsDb.updateStock(item.id, stored.quantity - item.cartQuantity);
          }
        }

        await salesDb.save({
          items: saleItems,
          createdAt: new Date().toISOString(),
          status: "pending",
        });

        setProducts((prev) =>
          prev.map((p) => {
            const inCart = cart.find((c) => c.id === p.id);
            return inCart ? { ...p, quantity: p.quantity - inCart.cartQuantity } : p;
          })
        );
        await loadPendingCount();
        showToast(
          "Venta guardada localmente. Se sincronizará al recuperar la conexión.",
          "success"
        );
      } else {
        // Online: send to backend
        await createSale({ items: saleItems });
        showToast("Venta registrada exitosamente.", "success");
        await loadProducts();
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
    <div className="px-3 py-3 sm:px-6 sm:py-4 lg:flex lg:h-[calc(100vh-6rem)] lg:min-h-0 lg:flex-col lg:px-10">
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}
      {/* Header */}
      <div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between lg:flex-none">
        <div className="min-w-0 space-y-1">
          <h2 className="text-xl font-semibold text-gray-800 sm:text-3xl">
            Registro de ventas
          </h2>
          <p className="text-sm leading-5 text-gray-600">
            Las ventas se registran en tiempo real y los pendientes se sincronizan
            automáticamente cuando vuelve la conexión.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5 lg:grid-cols-2 lg:gap-5 lg:min-h-0 lg:flex-1">
        {/* ── Product list ─────────────────────────────────────────────── */}
        <div className="flex h-[28rem] flex-col overflow-hidden lg:h-auto lg:min-h-0">
          <div className="mb-3 flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por nombre o código de barras..."
                onChange={setSearchTerm}
                value={searchTerm}
                icon={<Search />}
                height="h-8"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              title="Escanear código de barras"
              className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Barcode size={16} />
              <span className="hidden sm:inline">Escanear</span>
            </button>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
              Cargando productos...
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-600 sm:p-6">
              No se encontraron productos.
            </div>
          ) : (
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 lg:flex lg:min-h-0 lg:flex-col lg:gap-2 lg:space-y-0">
              {displayedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800 sm:text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs leading-5 text-gray-500">
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
                    className="flex w-full items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 sm:ml-3 sm:w-auto sm:py-1.5"
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
        <div className="flex h-[24rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:h-[26rem] sm:p-4 lg:h-auto lg:min-h-0">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShoppingCart size={18} className="text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800 sm:text-base">
              Carrito ({cart.length} producto{cart.length !== 1 ? "s" : ""})
            </h3>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-8 text-sm text-slate-400 sm:py-10">
              Agrega productos para registrar una venta.
            </div>
          ) : (
            <div className="mt-3 flex-1 space-y-2 overflow-y-auto pr-1 lg:flex lg:min-h-0 lg:flex-col lg:gap-2 lg:space-y-0">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:gap-2 sm:p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs leading-5 text-gray-500">
                      ${item.sellingPrice.toLocaleString("es-CO")} c/u
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-1 sm:justify-start">
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

                  <p className="shrink-0 text-right text-sm font-semibold text-gray-800 sm:w-24">
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
