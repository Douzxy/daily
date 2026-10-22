import { NextResponse } from 'next/server'
import { getDbClient } from '@/lib/db'

function getTodayWIB() {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export async function GET() {
  try {
    const sql = await getDbClient()
    const today = getTodayWIB()

    // 1. Sholat Analytics from daily_prayers
    const prayerRows = await sql`
      SELECT date, subuh, dzuhur, ashar, maghrib, isya 
      FROM daily_prayers 
      ORDER BY date DESC 
      LIMIT 30;
    `
    // Last 7 days
    const last7DaysPrayers = prayerRows.slice(0, 7)
    let weeklyPrayersDone = 0
    const prayerBreakdown = { subuh: 0, dzuhur: 0, ashar: 0, maghrib: 0, isya: 0 }

    for (const r of last7DaysPrayers) {
      if (r.subuh) { weeklyPrayersDone++; prayerBreakdown.subuh++ }
      if (r.dzuhur) { weeklyPrayersDone++; prayerBreakdown.dzuhur++ }
      if (r.ashar) { weeklyPrayersDone++; prayerBreakdown.ashar++ }
      if (r.maghrib) { weeklyPrayersDone++; prayerBreakdown.maghrib++ }
      if (r.isya) { weeklyPrayersDone++; prayerBreakdown.isya++ }
    }
    const weeklyPrayerRate = last7DaysPrayers.length > 0
      ? Math.round((weeklyPrayersDone / (last7DaysPrayers.length * 5)) * 100)
      : 100

    // Monthly prayers done
    let monthlyPrayersDone = 0
    for (const r of prayerRows) {
      if (r.subuh) monthlyPrayersDone++
      if (r.dzuhur) monthlyPrayersDone++
      if (r.ashar) monthlyPrayersDone++
      if (r.maghrib) monthlyPrayersDone++
      if (r.isya) monthlyPrayersDone++
    }
    const monthlyPrayerRate = prayerRows.length > 0
      ? Math.round((monthlyPrayersDone / (prayerRows.length * 5)) * 100)
      : 100

    // 2. Finance Analytics from daily_transactions
    const txRows = await sql`
      SELECT id, date, amount, type, category, description 
      FROM daily_transactions 
      ORDER BY date DESC;
    `
    let monthlyIncome = 0
    let monthlyExpense = 0
    let weeklyExpense = 0
    const categoryTotals: Record<string, number> = {}

    // Calculate dates
    const now = new Date()
    const sevenDaysAgoStr = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]

    for (const tx of txRows) {
      const amt = Number(tx.amount) || 0
      if (tx.type === 'income') {
        monthlyIncome += amt
      } else if (tx.type === 'expense') {
        monthlyExpense += amt
        if (tx.date >= sevenDaysAgoStr) {
          weeklyExpense += amt
        }
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amt
      }
    }
    if (monthlyIncome === 0) monthlyIncome = 2800000 // Default gaji pokok Edo
    const netSavings = monthlyIncome - monthlyExpense
    const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0

    // 3. To-Do Analytics from daily_todos
    const todoRows = await sql`
      SELECT id, text, done, priority 
      FROM daily_todos 
      WHERE (is_deleted IS FALSE OR is_deleted IS NULL);
    `
    const totalTodos = todoRows.length
    const completedTodos = todoRows.filter((t) => t.done).length
    const todoRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

    // 4. Weight & Gym Analytics from daily_weight_logs & daily_store
    const weightRows = await sql`
      SELECT id, date, week_label, weight_kg, notes 
      FROM daily_weight_logs 
      ORDER BY date ASC;
    `
    const latestWeight = weightRows.length > 0
      ? Number(weightRows[weightRows.length - 1].weight_kg)
      : 57.5
    const targetWeight = 68.0
    const remainingWeight = Math.max(0, targetWeight - latestWeight).toFixed(1)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      evaluation: {
        sholat: {
          today: prayerRows.find((r) => r.date === today) || null,
          weeklyDone: weeklyPrayersDone,
          weeklyTotal: last7DaysPrayers.length * 5,
          weeklyRate: weeklyPrayerRate,
          monthlyRate: monthlyPrayerRate,
          breakdown: prayerBreakdown,
          history: prayerRows,
        },
        finance: {
          monthlyIncome,
          monthlyExpense,
          weeklyExpense,
          netSavings,
          savingsRate,
          categoryTotals,
          totalTransactions: txRows.length,
        },
        todos: {
          total: totalTodos,
          completed: completedTodos,
          completionRate: todoRate,
        },
        gym: {
          currentWeight: latestWeight,
          targetWeight,
          remainingKg: remainingWeight,
          weightLogs: weightRows,
        },
      },
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
