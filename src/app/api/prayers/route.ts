import { NextResponse } from 'next/server'
import { getDbClient } from '@/lib/db'
import { verifyAuthRequest } from '@/lib/auth'

function getTodayWIB() {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

function calculatePrayerStreak(
  history: Array<{ date: string; subuh: boolean; dzuhur: boolean; ashar: boolean; maghrib: boolean; isya: boolean }>,
  todayStr: string
) {
  if (!history || history.length === 0) return 0
  const historyMap = new Map(history.map((r) => [r.date, r]))
  const isFull = (r?: { subuh: boolean; dzuhur: boolean; ashar: boolean; maghrib: boolean; isya: boolean }) =>
    Boolean(r && r.subuh && r.dzuhur && r.ashar && r.maghrib && r.isya)

  const todayRecord = historyMap.get(todayStr)
  let streak = 0
  const checkDate = new Date(todayStr)

  if (isFull(todayRecord)) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  } else {
    // Today not yet complete, check from yesterday
    checkDate.setDate(checkDate.getDate() - 1)
  }

  // Count backwards
  for (let i = 0; i < 30; i++) {
    const dateStr = checkDate.toISOString().split('T')[0]
    const rec = historyMap.get(dateStr)
    if (isFull(rec)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export async function GET(request: Request) {
  if (!(await verifyAuthRequest(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const today = searchParams.get('date') || getTodayWIB()
    const sql = await getDbClient()

    // 1. Get today's prayer record or create if not exists
    let todayRows = await sql`
      SELECT date, subuh, dzuhur, ashar, maghrib, isya 
      FROM daily_prayers 
      WHERE date = ${today};
    `

    if (todayRows.length === 0) {
      // Check if daily_store has today's record
      const storeRow = await sql`
        SELECT value FROM daily_store WHERE key = 'lifetime_prayers';
      `
      let initialPrayers = { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false }
      if (storeRow.length > 0 && storeRow[0].value && storeRow[0].value.date === today && storeRow[0].value.prayers) {
        initialPrayers = { ...initialPrayers, ...storeRow[0].value.prayers }
      }

      await sql`
        INSERT INTO daily_prayers (date, subuh, dzuhur, ashar, maghrib, isya, updated_at)
        VALUES (${today}, ${initialPrayers.subuh}, ${initialPrayers.dzuhur}, ${initialPrayers.ashar}, ${initialPrayers.maghrib}, ${initialPrayers.isya}, NOW())
        ON CONFLICT (date) DO NOTHING;
      `

      todayRows = await sql`
        SELECT date, subuh, dzuhur, ashar, maghrib, isya 
        FROM daily_prayers 
        WHERE date = ${today};
      `
    }

    // 2. Get prayer history for weekly & monthly evaluation (up to 365 days)
    const historyRows = await sql`
      SELECT date, subuh, dzuhur, ashar, maghrib, isya 
      FROM daily_prayers 
      ORDER BY date DESC 
      LIMIT 365;
    `

    const todayRecord = todayRows[0] || {
      date: today,
      subuh: false,
      dzuhur: false,
      ashar: false,
      maghrib: false,
      isya: false,
    }

    const streak = calculatePrayerStreak(historyRows as any, today)

    return NextResponse.json({
      success: true,
      today: {
        date: todayRecord.date,
        streak,
        prayers: {
          subuh: Boolean(todayRecord.subuh),
          dzuhur: Boolean(todayRecord.dzuhur),
          ashar: Boolean(todayRecord.ashar),
          maghrib: Boolean(todayRecord.maghrib),
          isya: Boolean(todayRecord.isya),
        },
      },
      history: historyRows,
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
    const { action, prayer, done, date } = body
    const targetDate = date || getTodayWIB()
    const sql = await getDbClient()

    if (action === 'toggle' && prayer) {
      // Ensure record exists
      await sql`
        INSERT INTO daily_prayers (date, subuh, dzuhur, ashar, maghrib, isya, updated_at)
        VALUES (${targetDate}, false, false, false, false, false, NOW())
        ON CONFLICT (date) DO NOTHING;
      `

      // Toggle or set specific prayer column
      if (prayer === 'subuh') {
        await sql`UPDATE daily_prayers SET subuh = ${done !== undefined ? Boolean(done) : sql`NOT subuh`}, updated_at = NOW() WHERE date = ${targetDate};`
      } else if (prayer === 'dzuhur') {
        await sql`UPDATE daily_prayers SET dzuhur = ${done !== undefined ? Boolean(done) : sql`NOT dzuhur`}, updated_at = NOW() WHERE date = ${targetDate};`
      } else if (prayer === 'ashar') {
        await sql`UPDATE daily_prayers SET ashar = ${done !== undefined ? Boolean(done) : sql`NOT ashar`}, updated_at = NOW() WHERE date = ${targetDate};`
      } else if (prayer === 'maghrib') {
        await sql`UPDATE daily_prayers SET maghrib = ${done !== undefined ? Boolean(done) : sql`NOT maghrib`}, updated_at = NOW() WHERE date = ${targetDate};`
      } else if (prayer === 'isya') {
        await sql`UPDATE daily_prayers SET isya = ${done !== undefined ? Boolean(done) : sql`NOT isya`}, updated_at = NOW() WHERE date = ${targetDate};`
      }
    } else if (action === 'set_all' && body.prayers) {
      const p = body.prayers
      await sql`
        INSERT INTO daily_prayers (date, subuh, dzuhur, ashar, maghrib, isya, updated_at)
        VALUES (${targetDate}, ${Boolean(p.subuh)}, ${Boolean(p.dzuhur)}, ${Boolean(p.ashar)}, ${Boolean(p.maghrib)}, ${Boolean(p.isya)}, NOW())
        ON CONFLICT (date) DO UPDATE
        SET subuh = EXCLUDED.subuh,
            dzuhur = EXCLUDED.dzuhur,
            ashar = EXCLUDED.ashar,
            maghrib = EXCLUDED.maghrib,
            isya = EXCLUDED.isya,
            updated_at = NOW();
      `
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    // Retrieve updated record & history for dynamic streak
    const [updatedRows, allHistory] = await Promise.all([
      sql`
        SELECT date, subuh, dzuhur, ashar, maghrib, isya 
        FROM daily_prayers 
        WHERE date = ${targetDate};
      `,
      sql`
        SELECT date, subuh, dzuhur, ashar, maghrib, isya 
        FROM daily_prayers 
        ORDER BY date DESC 
        LIMIT 30;
      `,
    ])
    const updated = updatedRows[0]
    const streak = calculatePrayerStreak(allHistory as any, targetDate)

    // Sync to daily_store as well
    const storePayload = {
      date: targetDate,
      streak,
      prayers: {
        subuh: Boolean(updated.subuh),
        dzuhur: Boolean(updated.dzuhur),
        ashar: Boolean(updated.ashar),
        maghrib: Boolean(updated.maghrib),
        isya: Boolean(updated.isya),
      },
    }
    await sql`
      INSERT INTO daily_store (key, value, updated_at)
      VALUES ('lifetime_prayers', ${JSON.stringify(storePayload)}::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `

    return NextResponse.json({ success: true, today: storePayload })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
