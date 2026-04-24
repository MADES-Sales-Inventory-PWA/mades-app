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

export interface StoredSizeType {
  id: number
  name: string
}

export interface StoredSizeValue {
  id: number
  sizeTypeId: number
  value: string
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
  sizeTypes: {
    key: number
    value: StoredSizeType
  }
  sizeValues: {
    key: number
    value: StoredSizeValue
    indexes: {
      'by-sizeTypeId': number
    }
  }
}

let _db: IDBPDatabase<MADESDb> | null = null

export async function getDb(): Promise<IDBPDatabase<MADESDb>> {
  if (_db) return _db

  _db = await openDB<MADESDb>('mades-db', 2, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('adjustments')) {
        const adjStore = db.createObjectStore('adjustments', { keyPath: 'id' })
        adjStore.createIndex('by-product', 'productId')
        adjStore.createIndex('by-type', 'type')
        adjStore.createIndex('by-date', 'createdAt')
      }

      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' })
      }

      if (oldVersion < 2) {
        db.createObjectStore('sizeTypes', { keyPath: 'id' })

        const sizeValuesStore = db.createObjectStore('sizeValues', { keyPath: 'id' })
        sizeValuesStore.createIndex('by-sizeTypeId', 'sizeTypeId', { unique: false })
      }
    },
  })

  return _db
}