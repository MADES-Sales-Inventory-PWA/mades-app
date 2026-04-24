import { openDB, DBSchema, IDBPDatabase } from 'idb'

export interface StoredAdjustment {
  id: number
  productId: number
  barcode: string
  productName: string
  type: 'LOSS' | 'GAIN'
  quantity: number
  description: string
  createdAt: string
  previousQty?: number
  newQty?: number
  isLocal?: boolean
}

export interface StoredProduct {
  id: number
  name: string
  state: boolean
  sizeTypeId: number
  sizeValueId: number
  barcode: string
  description: string | null
  imageUrl: string | null
  purchasePrice: number
  quantity: number
  minQuantity: number
}

interface MADESDb extends DBSchema {
  adjustments: {
    key: number
    value: StoredAdjustment
    indexes: {
      'by-product': number
      'by-type': string
      'by-date': string
    }
  }
  products: {
    key: number
    value: StoredProduct
  }
}

let _db: IDBPDatabase<MADESDb> | null = null

export async function getDb(): Promise<IDBPDatabase<MADESDb>> {
  if (_db) return _db

  _db = await openDB<MADESDb>('mades-db', 1, {
    upgrade(db) {
      const adjStore = db.createObjectStore('adjustments', { keyPath: 'id' })
      adjStore.createIndex('by-product', 'productId')
      adjStore.createIndex('by-type', 'type')
      adjStore.createIndex('by-date', 'createdAt')

      db.createObjectStore('products', { keyPath: 'id' })
    },
  })

  return _db
}