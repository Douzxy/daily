import crypto from 'crypto'
import { getDbClient, ensureTableExists } from '@/lib/db'

const getSecret = () => {
  return (
    process.env.AUTH_SECRET ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'daily_os_edo_vault_2026_super_secret'
  )
}

export function createSessionToken(payload: { sub: string; exp?: number } = { sub: 'edo' }): string {
  const secret = getSecret()
  const exp = payload.exp || Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
  const data = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifySessionToken(token: string): { sub: string; exp: number } | null {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, sig] = parts
  const secret = getSecret()
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url')
  if (sig !== expectedSig) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    if (payload.exp && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export async function getStoredAppPassword(): Promise<string> {
  try {
    const sql = await getDbClient()
    await ensureTableExists()
    const rows = await sql`SELECT value FROM daily_store WHERE key = 'lifetime_app_password';`
    if (rows && rows.length > 0 && rows[0].value) {
      const val = rows[0].value
      if (typeof val === 'string') return val
      if (typeof val === 'number') return String(val)
      return JSON.stringify(val).replace(/^"|"$/g, '')
    }
  } catch (err) {
    console.warn('Could not read app password from db, fallback to default:', err)
  }
  return '080808'
}

export async function setStoredAppPassword(newPass: string): Promise<boolean> {
  try {
    const sql = await getDbClient()
    await ensureTableExists()
    await sql`
      INSERT INTO daily_store (key, value, updated_at)
      VALUES ('lifetime_app_password', ${JSON.stringify(newPass)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `
    return true
  } catch (err) {
    console.error('Failed to update app password in db:', err)
    return false
  }
}

export function extractTokenFromRequest(request: Request): string | null {
  // 1. Check Header x-daily-auth
  const headerToken = request.headers.get('x-daily-auth')
  if (headerToken) return headerToken.trim()

  // 2. Check Authorization Header: Bearer <token>
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7).trim()
  }

  // 3. Check Cookie daily_session
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/daily_session=([^;]+)/)
  if (match && match[1]) {
    return decodeURIComponent(match[1]).trim()
  }

  return null
}

export async function verifyAuthRequest(request: Request): Promise<boolean> {
  const token = extractTokenFromRequest(request)
  if (!token) return false
  const valid = verifySessionToken(token)
  return Boolean(valid)
}
