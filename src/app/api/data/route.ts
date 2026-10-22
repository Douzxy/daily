import { NextResponse } from 'next/server'
import { getAllStoreData, setStoreItem, batchSetStoreItems, getDbClient } from '@/lib/db'

export async function GET() {
  try {
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
  try {
    const body = await request.json()

    if (body.updates && typeof body.updates === 'object') {
      const ok = await batchSetStoreItems(body.updates)
      return NextResponse.json({ success: ok, count: Object.keys(body.updates).length })
    }

    if (body.key && body.value !== undefined) {
      const ok = await setStoreItem(body.key, body.value)

      // Auto-sync relational tables in Neon PostgreSQL
      if (body.key === 'lifetime_transactions' && Array.isArray(body.value)) {
        try {
          const sql = await getDbClient()
          for (const tx of body.value) {
            if (!tx || !tx.id) continue
            await sql`
              INSERT INTO daily_transactions (id, date, amount, type, category, description, payment_method, created_at)
              VALUES (
                ${tx.id},
                ${tx.date || new Date().toISOString().split('T')[0]},
                ${tx.amount || 0},
                ${tx.type || 'expense'},
                ${tx.category || 'Lainnya'},
                ${tx.description || ''},
                ${tx.paymentMethod || 'cash'},
                NOW()
              )
              ON CONFLICT (id) DO UPDATE
              SET amount = EXCLUDED.amount,
                  type = EXCLUDED.type,
                  category = EXCLUDED.category,
                  description = EXCLUDED.description,
                  payment_method = EXCLUDED.payment_method;
            `
          }
        } catch (e) {
          console.warn('Relational sync for transactions failed:', e)
        }
      }

      if (body.key === 'lifetime_weekly_weight_logs' && Array.isArray(body.value)) {
        try {
          const sql = await getDbClient()
          for (const w of body.value) {
            if (!w || !w.id) continue
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
          }
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
