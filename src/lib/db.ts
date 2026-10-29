import { neon } from '@neondatabase/serverless'

const getDbUrl = () => {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
}

export async function getDbClient() {
  const url = getDbUrl()
  if (!url) {
    throw new Error('DATABASE_URL or POSTGRES_URL environment variable is not defined')
  }
  return neon(url)
}

let isTableEnsured = false

export async function ensureTableExists() {
  if (isTableEnsured) return
  const sql = await getDbClient()
  await sql`
    CREATE TABLE IF NOT EXISTS daily_store (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  isTableEnsured = true
}

export async function getAllStoreData(): Promise<Record<string, any>> {
  try {
    const sql = await getDbClient()
    await ensureTableExists()
    const rows = await sql`SELECT key, value FROM daily_store;`
    const result: Record<string, any> = {}
    for (const r of rows as { key: string; value: any }[]) {
      result[r.key] = r.value
    }
    return result
  } catch (error) {
    console.error('Failed to get data from Neon PostgreSQL:', error)
    return {}
  }
}

export async function setStoreItem(key: string, value: any): Promise<boolean> {
  try {
    const sql = await getDbClient()
    await ensureTableExists()
    const jsonStr = JSON.stringify(value)
    await sql`
      INSERT INTO daily_store (key, value, updated_at)
      VALUES (${key}, ${jsonStr}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `
    return true
  } catch (error) {
    console.error(`Failed to save key ${key} to Neon PostgreSQL:`, error)
    return false
  }
}

const DEFAULT_HABITS = [
  { id: 'h-1', name: 'Minum Air 2.5 Liter', icon: 'Droplet', category: 'Kesehatan' },
  { id: 'h-2', name: 'Sholat 5 Waktu Tepat Waktu', icon: 'Moon', category: 'Ibadah' },
  { id: 'h-3', name: 'Workout / Gym 60 Menit', icon: 'Dumbbell', category: 'Fitness' },
  { id: 'h-4', name: 'Baca Buku 15 Menit', icon: 'BookOpen', category: 'Mindset' },
  { id: 'h-6', name: 'Tidur Sebelum Jam 23:00', icon: 'Clock', category: 'Recovery' },
]

let habitTablesReady: Promise<void> | null = null

/**
 * Relational habit storage:
 * - daily_habits: one row per habit definition (soft-deleted via is_deleted)
 * - daily_habit_logs: one row per (habit, date) check-in
 * Each toggle is an atomic row upsert, so multiple devices never overwrite each other.
 * On first run, the legacy `lifetime_habits` JSON blob from daily_store is migrated.
 */
export function ensureHabitTables(): Promise<void> {
  if (!habitTablesReady) {
    habitTablesReady = (async () => {
      const sql = await getDbClient()
      await ensureTableExists()
      await sql`
        CREATE TABLE IF NOT EXISTS daily_habits (
          id VARCHAR(100) PRIMARY KEY,
          name TEXT NOT NULL,
          icon VARCHAR(50) DEFAULT 'CircleCheck',
          category VARCHAR(100) DEFAULT 'Kesehatan',
          sort_order INTEGER DEFAULT 0,
          is_deleted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
      await sql`
        CREATE TABLE IF NOT EXISTS daily_habit_logs (
          habit_id VARCHAR(100) NOT NULL,
          date VARCHAR(10) NOT NULL,
          done BOOLEAN NOT NULL DEFAULT FALSE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          PRIMARY KEY (habit_id, date)
        );
      `

      const countRows = await sql`SELECT COUNT(*)::int AS c FROM daily_habits;`
      if (Number(countRows?.[0]?.c || 0) === 0) {
        const legacyRows = await sql`SELECT value FROM daily_store WHERE key = 'lifetime_habits';`
        const legacy = legacyRows?.[0]?.value
        const source: any[] = Array.isArray(legacy) && legacy.length > 0 ? legacy : DEFAULT_HABITS
        let order = 0
        for (const h of source) {
          if (!h || !h.id || !h.name) continue
          await sql`
            INSERT INTO daily_habits (id, name, icon, category, sort_order)
            VALUES (${h.id}, ${h.name}, ${h.icon || 'CircleCheck'}, ${h.category || 'Kesehatan'}, ${order++})
            ON CONFLICT (id) DO NOTHING;
          `
          const history = h.history && typeof h.history === 'object' ? h.history : {}
          for (const [date, done] of Object.entries(history)) {
            if (!done || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue
            await sql`
              INSERT INTO daily_habit_logs (habit_id, date, done)
              VALUES (${h.id}, ${date}, TRUE)
              ON CONFLICT (habit_id, date) DO NOTHING;
            `
          }
        }
      }
    })().catch((err) => {
      habitTablesReady = null
      throw err
    })
  }
  return habitTablesReady
}

export async function batchSetStoreItems(updates: Record<string, any>): Promise<boolean> {
  try {
    const sql = await getDbClient()
    await ensureTableExists()
    for (const [key, value] of Object.entries(updates)) {
      const jsonStr = JSON.stringify(value)
      await sql`
        INSERT INTO daily_store (key, value, updated_at)
        VALUES (${key}, ${jsonStr}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value, updated_at = NOW();
      `
    }
    return true
  } catch (error) {
    console.error('Failed to batch save to Neon PostgreSQL:', error)
    return false
  }
}
