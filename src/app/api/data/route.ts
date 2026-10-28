import { NextResponse } from 'next/server'
import { getAllStoreData, setStoreItem, batchSetStoreItems, getDbClient } from '@/lib/db'
import { verifyAuthRequest } from '@/lib/auth'

export async function GET(request: Request) {
  if (!(await verifyAuthRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('status_only') === '1') {
      const sql = await getDbClient()
      const rows = await sql`
        SELECT 
          GREATEST(
            COALESCE((SELECT MAX(updated_at) FROM daily_store), '1970-01-01'::timestamptz),
            COALESCE((SELECT MAX(updated_at) FROM daily_todos), '1970-01-01'::timestamptz),
            COALESCE((SELECT MAX(updated_at) FROM daily_prayers), '1970-01-01'::timestamptz)
          ) AS latest_update,
          (SELECT COUNT(*) FROM daily_transactions) AS tx_count,
          (SELECT COUNT(*) FROM daily_todos WHERE is_deleted IS FALSE OR is_deleted IS NULL) AS todo_count;
      `
      return NextResponse.json({
        success: true,
        latestUpdate: rows?.[0]?.latest_update || null,
        txCount: Number(rows?.[0]?.tx_count || 0),
        todoCount: Number(rows?.[0]?.todo_count || 0),
        timestamp: Date.now(),
      })
    }

    const data = await getAllStoreData()
    return NextResponse.json({
      success: true,
      data,
      source: 'neon_postgres',
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Database fetch failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!(await verifyAuthRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (body.updates && typeof body.updates === 'object') {
      const ok = await batchSetStoreItems(body.updates)
      return NextResponse.json({
        success: ok,
        count: Object.keys(body.updates).length,
        updatedAt: new Date().toISOString(),
      })
    }

    if (body.key && body.value !== undefined) {
      let finalValue = body.value
      const sql = await getDbClient()

      if (body.key === 'lifetime_transactions' && Array.isArray(body.value)) {
        // If explicit clear was requested
        if (body.action === 'clear') {
          await sql`DELETE FROM daily_transactions;`
          await setStoreItem('lifetime_transactions', [])
          return NextResponse.json({ success: true, key: body.key, data: [], updatedAt: new Date().toISOString() })
        }

        const filteredIncoming = body.value.filter(
          (tx: any) => tx && !['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5'].includes(tx.id)
        )

        // Read deleted IDs so we never resurrect deleted transactions
        let deletedIdsSet = new Set<string>()
        try {
          const delRows = await sql`SELECT value FROM daily_store WHERE key = 'lifetime_deleted_tx_ids';`
          if (delRows && delRows[0] && Array.isArray(delRows[0].value)) {
            deletedIdsSet = new Set(delRows[0].value)
          }
        } catch {}

        // Read existing transactions from DB to merge safely without wiping other devices' data
        let existingList: any[] = []
        try {
          const rows = await sql`SELECT value FROM daily_store WHERE key = 'lifetime_transactions';`
          if (rows && rows.length > 0 && Array.isArray(rows[0].value)) {
            existingList = rows[0].value
          }
        } catch {}

        const incomingMap = new Map(filteredIncoming.map((tx: any) => [tx.id, tx]))
        const merged = [...filteredIncoming]
        for (const ext of existingList) {
          if (ext && ext.id && !incomingMap.has(ext.id) && !deletedIdsSet.has(ext.id)) {
            merged.push(ext)
          }
        }

        // Sort by date descending
        merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

        finalValue = merged
        await setStoreItem('lifetime_transactions', finalValue)

        // Upsert into relational daily_transactions table
        try {
          await Promise.all(
            finalValue.map(async (tx: any) => {
              if (!tx || !tx.id) return
              await sql`
                INSERT INTO daily_transactions (id, date, amount, type, category, description, payment_method, created_at)
                VALUES (
                  ${tx.id},
                  ${tx.date || new Date().toISOString().split('T')[0]},
                  ${tx.amount || 0},
                  ${tx.type || 'expense'},
                  ${tx.category || 'Lainnya'},
                  ${tx.description || ''},
                  ${tx.paymentMethod || 'QRIS'},
                  NOW()
                )
                ON CONFLICT (id) DO UPDATE
                SET amount = EXCLUDED.amount,
                    type = EXCLUDED.type,
                    category = EXCLUDED.category,
                    description = EXCLUDED.description,
                    payment_method = EXCLUDED.payment_method;
              `
            })
          )
        } catch (e) {
          console.warn('Relational upsert for transactions failed:', e)
        }

        return NextResponse.json({ success: true, key: body.key, data: finalValue })
      }

      if (body.key === 'lifetime_deleted_tx_ids' && Array.isArray(body.value)) {
        try {
          const ids = body.value.filter(Boolean)
          if (ids.length > 0) {
            await sql`DELETE FROM daily_transactions WHERE id = ANY(${ids});`
            const rows = await sql`SELECT value FROM daily_store WHERE key = 'lifetime_transactions';`
            if (rows && rows[0] && Array.isArray(rows[0].value)) {
              const cleaned = rows[0].value.filter((t: any) => !ids.includes(t.id))
              await setStoreItem('lifetime_transactions', cleaned)
            }
          }
        } catch (e) {
          console.warn('Failed to delete transaction ids in DB:', e)
        }
      }

      const ok = await setStoreItem(body.key, finalValue)

      if (body.key === 'lifetime_weekly_weight_logs' && Array.isArray(body.value)) {
        try {
          const sql = await getDbClient()
          await Promise.all(
            body.value.map(async (w: any) => {
              if (!w || !w.id) return
              await sql`
                INSERT INTO daily_weight_logs (id, date, week_label, weight_kg, notes, created_at)
                VALUES (
                  ${w.id},
                  ${w.date || new Date().toISOString().split('T')[0]},
                  ${w.weekLabel || ''},
                  ${w.weightKg || 57.5},
                  ${w.notes || ''},
                  NOW()
                )
                ON CONFLICT (id) DO UPDATE
                SET weight_kg = EXCLUDED.weight_kg,
                    week_label = EXCLUDED.week_label,
                    notes = EXCLUDED.notes;
              `
            })
          )
        } catch (e) {
          console.warn('Relational sync for weight logs failed:', e)
        }
      }

      return NextResponse.json({ success: ok, key: body.key })
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Database update failed' },
      { status: 500 }
    )
  }
}
