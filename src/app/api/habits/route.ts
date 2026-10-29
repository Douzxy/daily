import { NextResponse } from 'next/server'
import { getDbClient, ensureHabitTables } from '@/lib/db'
import { verifyAuthRequest } from '@/lib/auth'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

async function loadHabits() {
  const sql = await getDbClient()
  const [habitRows, logRows] = await Promise.all([
    sql`
      SELECT id, name, icon, category
      FROM daily_habits
      WHERE is_deleted IS NOT TRUE
      ORDER BY sort_order ASC, created_at ASC;
    `,
    sql`
      SELECT habit_id, date
      FROM daily_habit_logs
      WHERE done IS TRUE
        AND date >= TO_CHAR((NOW() AT TIME ZONE 'Asia/Jakarta') - INTERVAL '400 days', 'YYYY-MM-DD');
    `,
  ])

  const historyById = new Map<string, Record<string, boolean>>()
  for (const r of logRows as { habit_id: string; date: string }[]) {
    const h = historyById.get(r.habit_id) || {}
    h[r.date] = true
    historyById.set(r.habit_id, h)
  }

  return (habitRows as { id: string; name: string; icon: string; category: string }[]).map((h) => ({
    id: h.id,
    name: h.name,
    icon: h.icon || 'CircleCheck',
    category: h.category || 'Kesehatan',
    history: historyById.get(h.id) || {},
  }))
}

export async function GET(request: Request) {
  if (!(await verifyAuthRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureHabitTables()
    const habits = await loadHabits()
    return NextResponse.json({ success: true, habits })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await verifyAuthRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await ensureHabitTables()
    const sql = await getDbClient()
    const body = await request.json()
    const { action, id } = body || {}

    if (action === 'set_done' && id && DATE_RE.test(body.date || '')) {
      const done = Boolean(body.done)
      await sql`
        INSERT INTO daily_habit_logs (habit_id, date, done, updated_at)
        VALUES (${id}, ${body.date}, ${done}, NOW())
        ON CONFLICT (habit_id, date) DO UPDATE
        SET done = EXCLUDED.done, updated_at = NOW();
      `
    } else if (action === 'add' && body.habit?.id && body.habit?.name) {
      const h = body.habit
      await sql`
        INSERT INTO daily_habits (id, name, icon, category, sort_order, is_deleted, updated_at)
        VALUES (
          ${h.id},
          ${String(h.name).slice(0, 200)},
          ${h.icon || 'CircleCheck'},
          ${h.category || 'Kesehatan'},
          (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM daily_habits),
          FALSE,
          NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            icon = EXCLUDED.icon,
            category = EXCLUDED.category,
            is_deleted = FALSE,
            updated_at = NOW();
      `
    } else if (action === 'update' && id && body.updates) {
      const u = body.updates
      await sql`
        UPDATE daily_habits
        SET name = COALESCE(${u.name ? String(u.name).slice(0, 200) : null}, name),
            category = COALESCE(${u.category ?? null}, category),
            icon = COALESCE(${u.icon ?? null}, icon),
            updated_at = NOW()
        WHERE id = ${id};
      `
    } else if (action === 'delete' && id) {
      await sql`
        UPDATE daily_habits
        SET is_deleted = TRUE, updated_at = NOW()
        WHERE id = ${id};
      `
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action or payload' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
