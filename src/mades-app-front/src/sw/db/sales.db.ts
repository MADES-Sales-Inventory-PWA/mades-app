import { getDb } from './client'
import type { StoredPendingSale } from './client'

export const salesDb = {
  async save(sale: StoredPendingSale): Promise<number> {
    const db = await getDb()
    return db.add('pendingSales', sale) as Promise<number>
  },

  async findAll(): Promise<StoredPendingSale[]> {
    const db = await getDb()
    return db.getAll('pendingSales')
  },

  async findPending(): Promise<StoredPendingSale[]> {
    const db = await getDb()
    return db.getAllFromIndex('pendingSales', 'by-status', 'pending')
  },

  async updateStatus(id: number, status: StoredPendingSale['status']): Promise<void> {
    const db = await getDb()
    const sale = await db.get('pendingSales', id)
    if (sale) {
      await db.put('pendingSales', { ...sale, status })
    }
  },

  async delete(id: number): Promise<void> {
    const db = await getDb()
    await db.delete('pendingSales', id)
  },

  async countPending(): Promise<number> {
    const pending = await salesDb.findPending()
    return pending.length
  },
}
