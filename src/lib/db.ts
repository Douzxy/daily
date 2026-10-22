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

export async function ensureTableExists() {
  const sql = await getDbClient()
  await sql`
    CREATE TABLE IF NOT EXISTS daily_store (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
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
