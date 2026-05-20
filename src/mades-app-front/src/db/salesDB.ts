import type { Product } from "../types/Types";

const DB_NAME = "mades-offline-db";
const DB_VERSION = 1;

export type PendingSale = {
  id?: number;
  items: Array<{ productId: number; quantity: number; price: number }>;
  notes?: string;
  createdAt: string;
  status: "pending" | "syncing" | "failed";
};

export type CachedProduct = Product & { cachedAt: string };

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("pendingSales")) {
        const store = db.createObjectStore("pendingSales", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("status", "status", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Products cache ──────────────────────────────────────────────────────────

export async function cacheProducts(products: Product[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("products", "readwrite");
    const store = tx.objectStore("products");

    store.clear();
    const now = new Date().toISOString();
    for (const product of products) {
      store.put({ ...product, cachedAt: now } satisfies CachedProduct);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedProducts(): Promise<CachedProduct[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("products", "readonly");
    const request = tx.objectStore("products").getAll();
    request.onsuccess = () => resolve(request.result as CachedProduct[]);
    request.onerror = () => reject(request.error);
  });
}

export async function updateCachedProductQuantity(
  productId: number,
  newQuantity: number
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("products", "readwrite");
    const store = tx.objectStore("products");
    const get = store.get(productId);

    get.onsuccess = () => {
      const product = get.result as CachedProduct | undefined;
      if (product) {
        store.put({ ...product, quantity: newQuantity });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };

    get.onerror = () => reject(get.error);
  });
}

// ── Pending sales ───────────────────────────────────────────────────────────

export async function savePendingSale(
  sale: Omit<PendingSale, "id">
): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingSales", "readwrite");
    const request = tx.objectStore("pendingSales").add(sale);
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getPendingSales(): Promise<PendingSale[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingSales", "readonly");
    const request = tx.objectStore("pendingSales").getAll();
    request.onsuccess = () => resolve(request.result as PendingSale[]);
    request.onerror = () => reject(request.error);
  });
}

export async function deletePendingSale(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingSales", "readwrite");
    const request = tx.objectStore("pendingSales").delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updatePendingSaleStatus(
  id: number,
  status: PendingSale["status"]
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pendingSales", "readwrite");
    const store = tx.objectStore("pendingSales");
    const get = store.get(id);

    get.onsuccess = () => {
      const sale = get.result as PendingSale | undefined;
      if (sale) {
        store.put({ ...sale, status });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };

    get.onerror = () => reject(get.error);
  });
}
