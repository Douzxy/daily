import { NextResponse } from 'next/server'
import { getDbClient } from '@/lib/db'
import { verifyAuthRequest } from '@/lib/auth'

export async function GET(request: Request) {
  if (!(await verifyAuthRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sql = await getDbClient()
    const rows = await sql`
      SELECT id, text, done, priority, category 
      FROM daily_todos 
      WHERE (is_deleted IS FALSE OR is_deleted IS NULL)
      ORDER BY created_at DESC;
    `
    const deletedRows = await sql`
      SELECT id 
      FROM daily_todos 
      WHERE is_deleted IS TRUE;
    `
    return NextResponse.json({
      success: true,
      todos: rows,
      deletedIds: deletedRows.map((r) => r.id),
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!(await verifyAuthRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action, id, todo, todos, done } = body
    const sql = await getDbClient()

    if (action === 'add' && todo) {
      await sql`
        INSERT INTO daily_todos (id, text, done, priority, category, is_deleted, created_at, updated_at)
        VALUES (
          ${todo.id}, 
          ${todo.text}, 
          ${todo.done ?? false}, 
          ${todo.priority ?? 'medium'}, 
          ${todo.category ?? 'Umum'}, 
          false, 
          NOW(), 
          NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET text = EXCLUDED.text,
            done = EXCLUDED.done,
            priority = EXCLUDED.priority,
            category = EXCLUDED.category,
            is_deleted = false,
            updated_at = NOW();
      `
    } else if (action === 'sync_batch' && Array.isArray(todos)) {
      for (const t of todos) {
        if (!t || !t.id || !t.text) continue
        await sql`
          INSERT INTO daily_todos (id, text, done, priority, category, is_deleted, created_at, updated_at)
          VALUES (
            ${t.id}, 
            ${t.text}, 
            ${t.done ?? false}, 
            ${t.priority ?? 'medium'}, 
            ${t.category ?? 'Umum'}, 
            false, 
            NOW(), 
            NOW()
          )
          ON CONFLICT (id) DO UPDATE
          SET text = EXCLUDED.text,
              done = EXCLUDED.done,
              priority = EXCLUDED.priority,
              category = EXCLUDED.category,
              is_deleted = false,
              updated_at = NOW();
        `
      }
    } else if (action === 'toggle' && id) {
      await sql`
        UPDATE daily_todos 
        SET done = NOT done, updated_at = NOW() 
        WHERE id = ${id};
      `
    } else if (action === 'set_done' && id) {
      await sql`
        UPDATE daily_todos 
        SET done = ${Boolean(done)}, updated_at = NOW() 
        WHERE id = ${id};
      `
    } else if (action === 'delete' && id) {
      await sql`
        UPDATE daily_todos 
        SET is_deleted = TRUE, updated_at = NOW() 
        WHERE id = ${id};
      `
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action or payload' }, { status: 400 })
    }

    // Sync back active items to daily_store cache
    const activeRows = await sql`
      SELECT id, text, done, priority, category 
      FROM daily_todos 
      WHERE (is_deleted IS FALSE OR is_deleted IS NULL)
      ORDER BY created_at DESC;
    `
    await sql`
      INSERT INTO daily_store (key, value, updated_at)
      VALUES ('lifetime_todos', ${JSON.stringify(activeRows)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `

    return NextResponse.json({ success: true, count: activeRows.length })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
