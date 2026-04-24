import { getDb, StoredProduct } from './client'

export const productsDb = {
  async findById(id: number): Promise<StoredProduct | undefined> {
    const db = await getDb()
    return db.get('products', id)
  },

  async findAll(): Promise<StoredProduct[]> {
    const db = await getDb()
    return db.getAll('products')
  },

  async saveMany(products: StoredProduct[]): Promise<void> {
    const db = await getDb()
    const tx = db.transaction('products', 'readwrite')
    await Promise.all([...products.map(p => tx.store.put(p)), tx.done])
  },

  async updateStock(productId: number, newStock: number): Promise<void> {
    const db = await getDb()
    const product = await db.get('products', productId)
    if (product) {
      await db.put('products', { ...product, quantity: newStock })
    }
  },

  async findByBarcode(barcode: string): Promise<StoredProduct | undefined> {
    const db = await getDb()
    const all = await db.getAll('products')
    return all.find(p => p.barcode === barcode)
  },

  async findByNameAndSize(name: string, sizeTypeId: number, sizeValueId: number): Promise<StoredProduct | undefined> {
    const db = await getDb()
    const all = await db.getAll('products')
    return all.find(p =>
      p.name === name &&
      p.sizeTypeId === sizeTypeId &&
      p.sizeValueId === sizeValueId
    )
  },
}