import { NextResponse } from 'next/server'
import { getDbClient } from '@/lib/db'
import { verifyAuthRequest } from '@/lib/auth'

function mapDbRowToTodo(r: any) {
  return {
    id: r.id,
    text: r.text,
    done: Boolean(r.done),
    priority: r.priority || 'medium',
    category: r.category || 'Umum',
    status: r.status || (r.is_archived ? 'archived' : r.done ? 'done' : 'todo'),
    isArchived: Boolean(r.is_archived),
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
    completedDate:
      r.completed_date ||
      (r.completed_at
        ? new Date(r.completed_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
        : undefined),
    recentNote: r.recent_note || undefined,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
  }
}

export async function GET(request: Request) {
  if (!(await verifyAuthRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sql = await getDbClient()

    // 1. Active (non-archived, non-deleted) todos
    const activeRows = await sql`
      SELECT id, text, done, priority, category, status, is_archived, completed_at, completed_date, recent_note, created_at 
      FROM daily_todos 
      WHERE (is_deleted IS FALSE OR is_deleted IS NULL)
        AND (is_archived IS FALSE OR is_archived IS NULL)
      ORDER BY created_at DESC;
    `

    // 2. Archived / historical completed todos
    const archivedRows = await sql`
      SELECT id, text, done, priority, category, status, is_archived, completed_at, completed_date, recent_note, created_at 
      FROM daily_todos 
      WHERE (is_deleted IS FALSE OR is_deleted IS NULL)
        AND (is_archived IS TRUE OR status = 'archived')
      ORDER BY completed_at DESC NULLS LAST, updated_at DESC;
    `

    const deletedRows = await sql`
      SELECT id 
      FROM daily_todos 
      WHERE is_deleted IS TRUE;
    `

    return NextResponse.json({
      success: true,
      todos: activeRows.map(mapDbRowToTodo),
      archivedTodos: archivedRows.map(mapDbRowToTodo),
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
    const { action, id, todo, todos, done, updates } = body
    const sql = await getDbClient()

    if (action === 'add' && todo) {
      const isDone = Boolean(todo.done)
      const isArchived = Boolean(todo.isArchived || todo.status === 'archived')
      const status = todo.status || (isArchived ? 'archived' : isDone ? 'done' : 'todo')

      await sql`
        INSERT INTO daily_todos (
          id, text, done, priority, category, status, is_archived, 
          completed_at, completed_date, recent_note, is_deleted, created_at, updated_at
        )
        VALUES (
          ${todo.id}, 
          ${todo.text}, 
          ${isDone}, 
          ${todo.priority ?? 'medium'}, 
          ${todo.category ?? 'Umum'}, 
          ${status},
          ${isArchived},
          ${todo.completedAt ? new Date(todo.completedAt) : isDone ? new Date() : null},
          ${todo.completedDate ?? (isDone ? new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) : null)},
          ${todo.recentNote ?? null},
          false, 
          ${todo.createdAt ? new Date(todo.createdAt) : new Date()}, 
          NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET text = EXCLUDED.text,
            done = EXCLUDED.done,
            priority = EXCLUDED.priority,
            category = EXCLUDED.category,
            status = EXCLUDED.status,
            is_archived = EXCLUDED.is_archived,
            completed_at = EXCLUDED.completed_at,
            completed_date = EXCLUDED.completed_date,
            recent_note = EXCLUDED.recent_note,
            is_deleted = false,
            updated_at = NOW();
      `
    } else if (action === 'add_completed' && todo) {
      // Directly log a completed/archived task (e.g. for past or today)
      const completedDate =
        todo.completedDate || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
      const completedAt = todo.completedAt ? new Date(todo.completedAt) : new Date()

      await sql`
        INSERT INTO daily_todos (
          id, text, done, priority, category, status, is_archived, 
          completed_at, completed_date, recent_note, is_deleted, created_at, updated_at
        )
        VALUES (
          ${todo.id}, 
          ${todo.text}, 
          true, 
          ${todo.priority ?? 'medium'}, 
          ${todo.category ?? 'Umum'}, 
          'archived',
          true,
          ${completedAt},
          ${completedDate},
          ${todo.recentNote ?? null},
          false, 
          ${completedAt}, 
          NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET text = EXCLUDED.text,
            done = true,
            priority = EXCLUDED.priority,
            category = EXCLUDED.category,
            status = 'archived',
            is_archived = true,
            completed_at = EXCLUDED.completed_at,
            completed_date = EXCLUDED.completed_date,
            recent_note = EXCLUDED.recent_note,
            is_deleted = false,
            updated_at = NOW();
      `
    } else if (action === 'toggle' && id) {
      await sql`
        UPDATE daily_todos 
        SET done = NOT done, 
            status = CASE WHEN NOT done THEN 'done' ELSE 'todo' END,
            completed_at = CASE WHEN NOT done THEN NOW() ELSE NULL END,
            completed_date = CASE WHEN NOT done THEN TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') ELSE NULL END,
            updated_at = NOW() 
        WHERE id = ${id};
      `
    } else if (action === 'set_done' && id) {
      const isDone = Boolean(done)
      await sql`
        UPDATE daily_todos 
        SET done = ${isDone}, 
            status = CASE WHEN ${isDone} THEN 'done' ELSE 'todo' END,
            completed_at = CASE WHEN ${isDone} THEN COALESCE(completed_at, NOW()) ELSE NULL END,
            completed_date = CASE WHEN ${isDone} THEN COALESCE(completed_date, TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD')) ELSE NULL END,
            updated_at = NOW() 
        WHERE id = ${id};
      `
    } else if (action === 'archive_completed') {
      // Archive all currently completed active tasks
      await sql`
        UPDATE daily_todos 
        SET is_archived = TRUE, 
            status = 'archived',
            completed_at = COALESCE(completed_at, NOW()),
            completed_date = COALESCE(completed_date, TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD')),
            updated_at = NOW() 
        WHERE done IS TRUE AND (is_deleted IS FALSE OR is_deleted IS NULL);
      `
    } else if (action === 'archive_one' && id) {
      await sql`
        UPDATE daily_todos 
        SET is_archived = TRUE, 
            status = 'archived',
            completed_at = COALESCE(completed_at, NOW()),
            completed_date = COALESCE(completed_date, TO_CHAR(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD')),
            updated_at = NOW() 
        WHERE id = ${id};
      `
    } else if (action === 'unarchive' && id) {
      // Restore task from archive back to active list
      await sql`
        UPDATE daily_todos 
        SET is_archived = FALSE,
            status = 'done',
            updated_at = NOW() 
        WHERE id = ${id};
      `
    } else if (action === 'update' && id && updates) {
      const isDone = updates.done !== undefined ? Boolean(updates.done) : undefined
      const isArchived = updates.isArchived !== undefined ? Boolean(updates.isArchived) : undefined
      await sql`
        UPDATE daily_todos 
        SET text = COALESCE(${updates.text ?? null}, text),
            priority = COALESCE(${updates.priority ?? null}, priority),
            category = COALESCE(${updates.category ?? null}, category),
            status = COALESCE(${updates.status ?? null}, status),
            recent_note = COALESCE(${updates.recentNote ?? null}, recent_note),
            completed_date = COALESCE(${updates.completedDate ?? null}, completed_date),
            done = CASE WHEN ${isDone !== undefined} THEN ${isDone} ELSE done END,
            is_archived = CASE WHEN ${isArchived !== undefined} THEN ${isArchived} ELSE is_archived END,
            updated_at = NOW()
        WHERE id = ${id};
      `
    } else if (action === 'delete' && id) {
      await sql`
        UPDATE daily_todos 
        SET is_deleted = TRUE, updated_at = NOW() 
        WHERE id = ${id};
      `
    } else if (action === 'sync_batch' && Array.isArray(todos)) {
      for (const t of todos) {
        if (!t || !t.id || !t.text) continue
        const isDone = Boolean(t.done)
        const isArchived = Boolean(t.isArchived || t.status === 'archived')
        const status = t.status || (isArchived ? 'archived' : isDone ? 'done' : 'todo')

        await sql`
          INSERT INTO daily_todos (
            id, text, done, priority, category, status, is_archived, 
            completed_at, completed_date, recent_note, is_deleted, created_at, updated_at
          )
          VALUES (
            ${t.id}, 
            ${t.text}, 
            ${isDone}, 
            ${t.priority ?? 'medium'}, 
            ${t.category ?? 'Umum'}, 
            ${status},
            ${isArchived},
            ${t.completedAt ? new Date(t.completedAt) : isDone ? new Date() : null},
            ${t.completedDate ?? (isDone ? new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) : null)},
            ${t.recentNote ?? null},
            false, 
            ${t.createdAt ? new Date(t.createdAt) : new Date()}, 
            NOW()
          )
          ON CONFLICT (id) DO UPDATE
          SET text = EXCLUDED.text,
              done = EXCLUDED.done,
              priority = EXCLUDED.priority,
              category = EXCLUDED.category,
              status = EXCLUDED.status,
              is_archived = EXCLUDED.is_archived,
              completed_at = COALESCE(EXCLUDED.completed_at, daily_todos.completed_at),
              completed_date = COALESCE(EXCLUDED.completed_date, daily_todos.completed_date),
              recent_note = COALESCE(EXCLUDED.recent_note, daily_todos.recent_note),
              is_deleted = false,
              updated_at = NOW();
        `
      }
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action or payload' }, { status: 400 })
    }

    // Sync back active items to daily_store cache
    const activeRows = await sql`
      SELECT id, text, done, priority, category, status, is_archived, completed_at, completed_date, recent_note, created_at 
      FROM daily_todos 
      WHERE (is_deleted IS FALSE OR is_deleted IS NULL)
        AND (is_archived IS FALSE OR is_archived IS NULL)
      ORDER BY created_at DESC;
    `
    const mappedActive = activeRows.map(mapDbRowToTodo)
    await sql`
      INSERT INTO daily_store (key, value, updated_at)
      VALUES ('lifetime_todos', ${JSON.stringify(mappedActive)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `

    return NextResponse.json({ success: true, count: mappedActive.length })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
