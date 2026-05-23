import { getDb, StoredAdjustment } from './client'

export const inventoryDb = {
  async save(adjustment: StoredAdjustment): Promise<void> {
    const db = await getDb()
    await db.put('adjustments', adjustment)
  },

  async saveMany(adjustments: StoredAdjustment[]): Promise<void> {
    const db = await getDb()
    const tx = db.transaction('adjustments', 'readwrite')
    await Promise.all([...adjustments.map(a => tx.store.put(a)), tx.done])
  },

  async findById(id: number): Promise<StoredAdjustment | undefined> {
    const db = await getDb()
    return db.get('adjustments', id)
  },

  async findAll(): Promise<StoredAdjustment[]> {
    const db = await getDb()
    return db.getAll('adjustments')
  },

  async nextLocalId(): Promise<number> {
    const db = await getDb()
    const all = await db.getAll('adjustments')
    const localIds = all.filter(a => a.isLocal).map(a => a.id)
    return localIds.length > 0 ? Math.min(...localIds) - 1 : -1
  },
}