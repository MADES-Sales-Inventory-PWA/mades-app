import { getDb } from './client'
import { SizeTypeDTO, SizeValueDTO } from '../handlers/sizes.schema'

// ── SizeTypes ─────────────────────────────────────────────────────────────────

export const sizeTypesDb = {

  async findAll(): Promise<SizeTypeDTO[]> {
    const db = await getDb()
    return db.getAll('sizeTypes')
  },

  async findById(id: number): Promise<SizeTypeDTO | undefined> {
    const db = await getDb()
    return db.get('sizeTypes', id)
  },

  async saveMany(types: SizeTypeDTO[]): Promise<void> {
    const db = await getDb()
    const tx = db.transaction('sizeTypes', 'readwrite')
    await Promise.all([...types.map(t => tx.store.put(t)), tx.done])
  },
}

// ── SizeValues ────────────────────────────────────────────────────────────────

export const sizeValuesDb = {

  async findByTypeId(sizeTypeId: number): Promise<SizeValueDTO[]> {
    const db = await getDb()
    // Usa el índice 'by-sizeTypeId' definido en el upgrade del cliente IDB
    return db.getAllFromIndex('sizeValues', 'by-sizeTypeId', sizeTypeId)
  },

  async saveMany(values: SizeValueDTO[]): Promise<void> {
    const db = await getDb()
    const tx = db.transaction('sizeValues', 'readwrite')
    await Promise.all([...values.map(v => tx.store.put(v)), tx.done])
  },
}