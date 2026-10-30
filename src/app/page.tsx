'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, Button, showToast } from '@/components/ui'
import DailyCaptureModal from '@/components/modules/DailyCaptureModal'
import WeeklyReviewModal from '@/components/modules/WeeklyReviewModal'
import TodayFlowWidget from '@/components/modules/TodayFlowWidget'
import { formatRupiah } from '@/components/modules/FinanceWidget'
import { getTodayDateStr } from '@/lib/dateUtils'
import { Storage } from '@/lib/storage'
import type {
  DailyCapture,
  PrayerStatus,
  Transaction,
  BudgetCategory,
  WorkoutSession,
  Habit,
  NotionNote,
  PrayerName,
  TodoItem,
  MealLog,
  MealCategory,
  NutritionTarget,
  UserProfile,
  FinancialAccount,
} from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMosque,
  faWallet,
  faDumbbell,
  faListCheck,
  faPlus,
  faMoon,
  faArrowRight,
  faFire,
  faCalendarWeek,
  faCookieBite,
  faCheck,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons'

export default function DashboardPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (typeof window !== 'undefined') return Storage.getTodayTodos()
    return []
  })
  const [dailyCaptures, setDailyCaptures] = useState<DailyCapture[]>(() => {
    if (typeof window !== 'undefined') return Storage.getDailyCaptures()
    return []
  })
  const [prayerStatus, setPrayerStatus] = useState<PrayerStatus>(() => {
    if (typeof window !== 'undefined') return Storage.getPrayerStatus()
    return {
      date: '',
      prayers: { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false },
      streak: 0,
    }
  })
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') return Storage.getTransactions()
    return []
  })
  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    if (typeof window !== 'undefined') return Storage.getBudgets()
    return []
  })
  const [workoutSession, setWorkoutSession] = useState<WorkoutSession>(() => {
    if (typeof window !== 'undefined') return Storage.getWorkoutSession()
    return {
      id: 'ws-empty',
      date: '',
      splitName: 'Push Day',
      exercises: [],
      completed: false,
    }
  })
  const [habits, setHabits] = useState<Habit[]>(() => {
    if (typeof window !== 'undefined') return Storage.getHabits()
    return []
  })
  const [notes, setNotes] = useState<NotionNote[]>(() => {
    if (typeof window !== 'undefined') return Storage.getNotes()
    return []
  })
  const [meals, setMeals] = useState<MealLog[]>(() => {
    if (typeof window !== 'undefined') return Storage.getMealLogs()
    return []
  })
  const [nutritionTarget, setNutritionTarget] = useState<NutritionTarget>(() => {
    if (typeof window !== 'undefined') return Storage.getNutritionTarget()
    return { targetCalories: 2544, targetProtein: 116 }
  })
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') return Storage.getUserProfile()
    return { name: 'Edo', email: '', salary: 2800000, heightCm: 168, bodyWeightKg: 57.8, targetWeightKg: 68.0, city: 'Tangerang Selatan' }
  })
  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    if (typeof window !== 'undefined') return Storage.getAccounts()
    return []
  })

  const [showWeeklyReview, setShowWeeklyReview] = useState(false)
  // Clean UX: Do not force modal pop-up on page load
  const [showCaptureModal, setShowCaptureModal] = useState(false)

  // Quick Input Bar State (Tabs: task vs expense)
  const [quickInputTab, setQuickInputTab] = useState<'todo' | 'expense'>('todo')
  const [quickTodoText, setQuickTodoText] = useState('')
  const [quickExpenseAmount, setQuickExpenseAmount] = useState('')
  const [quickExpenseDesc, setQuickExpenseDesc] = useState('')

  const todayDateStr = getTodayDateStr()
  const todayFormatted =
    typeof window !== 'undefined'
      ? new Date().toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : ''

  // Auto-sync data whenever storage updates
  useEffect(() => {
    const refreshAll = () => {
      setTodos(Storage.getTodayTodos())
      setDailyCaptures(Storage.getDailyCaptures())
      setPrayerStatus(Storage.getPrayerStatus())
      setTransactions(Storage.getTransactions())
      setBudgets(Storage.getBudgets())
      setWorkoutSession(Storage.getWorkoutSession())
      setHabits(Storage.getHabits())
      setNotes(Storage.getNotes())
      setMeals(Storage.getMealLogs())
      setNutritionTarget(Storage.getNutritionTarget())
      setUserProfile(Storage.getUserProfile())
      setAccounts(Storage.getAccounts())
    }

    refreshAll()
    Storage.syncFromDatabase()
      .then((changed) => {
        if (changed) refreshAll()
      })
      .catch(() => {})

    window.addEventListener('lifetime-data-change', refreshAll)
    window.addEventListener('storage', refreshAll)
    return () => {
      window.removeEventListener('lifetime-data-change', refreshAll)
      window.removeEventListener('storage', refreshAll)
    }
  }, [])

  // Handlers for Home Dashboard
  const handleToggleTodo = (id: string) => {
    const updated = Storage.toggleTodo(id)
    setTodos(updated)
  }

  const handleAddTodo = (text: string, priority?: 'high' | 'medium' | 'low') => {
    Storage.addTodo({ text, done: false, priority: priority || 'medium' })
    setTodos(Storage.getTodayTodos())
  }

  const handleAddTodoFromFlow = (newTodo: Omit<TodoItem, 'id'>) => {
    Storage.addTodo(newTodo)
    setTodos(Storage.getTodayTodos())
  }

  const handleUpdateTodo = (id: string, updates: Partial<TodoItem>) => {
    const updated = Storage.updateTodo(id, updates)
    setTodos(updated)
  }

  const handleDeleteTodo = (id: string) => {
    const updated = Storage.deleteTodo(id)
    setTodos(updated)
  }

  const handleTogglePrayer = (prayer: PrayerName) => {
    const updated = Storage.togglePrayer(prayer)
    setPrayerStatus(updated)
  }

  const handleToggleHabit = (id: string) => {
    const updated = Storage.toggleHabit(id)
    setHabits(updated)
  }

  // Quick 1-Line Task Add
  const handleQuickAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    const text = quickTodoText.trim()
    if (!text) return
    Storage.addTodo({ text, done: false, priority: 'medium' })
    setTodos(Storage.getTodayTodos())
    setQuickTodoText('')
    showToast(`"${text}" ditambahkan`, 'success')
  }

  // Quick 1-Line Expense Add
  const handleQuickAddExpense = (amount: number, description: string) => {
    if (!amount || amount <= 0) return
    let cat = 'Makanan & Nutrisi'
    const lower = description.toLowerCase()
    if (/bensin|bbm|pertamax|pertalite|parkir|tol|ojol|gojek|grab/i.test(lower)) cat = 'Transport & Kendaraan'
    else if (/gym|whey|creatine|suplemen/i.test(lower)) cat = 'Gym, Suplemen & Nutrisi'
    else if (/netflix|spotify|game|steam|nonton|bioskop|kopi/i.test(lower)) cat = 'Hiburan & Refreshing'
    else if (/buku|kursus|udemy/i.test(lower)) cat = 'Upgrade Diri & Kreatif'
    else if (/telur|beras|minyak|indomaret|alfamart/i.test(lower)) cat = 'Belanja Pokok & Protein'

    Storage.addTransaction({
      amount,
      description: description || cat,
      category: cat,
      type: 'expense',
      date: todayDateStr,
      paymentMethod: 'QRIS',
    })
    setTransactions(Storage.getTransactions())
    setBudgets(Storage.getBudgets())
    setQuickExpenseAmount('')
    setQuickExpenseDesc('')
    showToast(`-${formatRupiah(amount)} (${description || cat}) dicatat!`, 'success')
  }

  const handleAddQuickMeal = (name: string, calories: number, protein: number, category: MealCategory) => {
    Storage.addMealLog({
      name,
      calories,
      protein,
      category,
      date: todayDateStr,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    })
    setMeals(Storage.getMealLogs())
    showToast(`+${name} (${protein}g protein) dicatat!`, 'success')
  }

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-125">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  // Calculated stats
  const prayersDone = Object.values(prayerStatus.prayers).filter(Boolean).length
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((a, c) => a + c.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((a, c) => a + c.amount, 0)
  const netBalance = totalIncome - totalExpense
  const totalLiquidWealth = accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0)

  const todayExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date === todayDateStr)
    .reduce((a, c) => a + c.amount, 0)

  const completedTodos = todos.filter((t) => t.done || t.status === 'done').length
  const totalTodos = todos.length

  const habitsDone = habits.filter((h) => h.completedToday).length
  const todayCapture = dailyCaptures.find((c) => c.date === todayDateStr)

  // Nutrition & Bulking stats for today
  const todayMeals = meals.filter((m) => m.date === todayDateStr)
  const todayProtein = todayMeals.reduce((a, c) => a + c.protein, 0)

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-4 pb-12 max-w-5xl">
        {/* Clean Header Bar: Today + Instant Glanceable Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-navy text-white">
          <div>
            <h1 className="text-body-lg sm:text-h3 font-heading font-bold text-white">
              {todayFormatted || 'Hari Ini'}
            </h1>
            <p className="text-caption text-slate-300 mt-0.5">
              {completedTodos === totalTodos && totalTodos > 0
                ? 'Semua target hari ini selesai'
                : `${totalTodos - completedTodos} tugas aktif • ${5 - prayersDone} sholat lagi`}
            </p>
          </div>

          {/* Glanceable Metrics Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 border border-white/10">
              <FontAwesomeIcon icon={faMosque} className="text-emerald-400 text-xs" />
              <span>{prayersDone}/5 Sholat</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 border border-white/10">
              <FontAwesomeIcon icon={faListCheck} className="text-amber-400 text-xs" />
              <span>{habitsDone}/{habits.length} Habit</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[11px] font-mono font-semibold flex items-center gap-1.5 border border-white/10">
              <FontAwesomeIcon icon={faWallet} className="text-sky-400 text-xs" />
              <span>-{formatRupiah(todayExpenses)}</span>
            </span>

            <button
              type="button"
              onClick={() => setShowCaptureModal(true)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-heading font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
              title="Catat unek-unek / jam tidur"
            >
              <span>+ Catatan Pagi</span>
            </button>
          </div>
        </div>

        {/* 1-Line Super Fast Input Bar (Task & Expense) */}
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2.5 border-b border-border pb-2">
            <button
              type="button"
              onClick={() => setQuickInputTab('todo')}
              className={`px-3 py-1 rounded-lg text-caption font-heading font-bold transition-colors cursor-pointer ${
                quickInputTab === 'todo'
                  ? 'bg-navy text-white'
                  : 'text-slate hover:text-navy hover:bg-slate-100'
              }`}
            >
              + Tugas Cepat
            </button>
            <button
              type="button"
              onClick={() => setQuickInputTab('expense')}
              className={`px-3 py-1 rounded-lg text-caption font-heading font-bold transition-colors cursor-pointer ${
                quickInputTab === 'expense'
                  ? 'bg-navy text-white'
                  : 'text-slate hover:text-navy hover:bg-slate-100'
              }`}
            >
              + Catat Pengeluaran
            </button>
          </div>

          {quickInputTab === 'todo' ? (
            <form onSubmit={handleQuickAddTodo} className="flex items-center gap-2">
              <input
                type="text"
                value={quickTodoText}
                onChange={(e) => setQuickTodoText(e.target.value)}
                placeholder="Ketik tugas hari ini lalu tekan Enter..."
                className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                autoFocus
              />
              <Button type="submit" variant="primary" size="sm" className="h-10 px-4 shrink-0">
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                <span>Tambah</span>
              </Button>
            </form>
          ) : (
            <div className="space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const amount = parseInt(quickExpenseAmount.replace(/\D/g, ''), 10)
                  if (amount > 0) handleQuickAddExpense(amount, quickExpenseDesc.trim())
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={quickExpenseAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '')
                    setQuickExpenseAmount(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '')
                  }}
                  placeholder="Nominal (cth: 25.000)"
                  className="w-full sm:w-44 h-10 px-3.5 rounded-xl border border-border bg-surface text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                  autoFocus
                />
                <input
                  type="text"
                  value={quickExpenseDesc}
                  onChange={(e) => setQuickExpenseDesc(e.target.value)}
                  placeholder="Catatan (cth: Es Kopi, Makan Siang)"
                  className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
                <Button type="submit" variant="primary" size="sm" className="h-10 px-4 shrink-0">
                  <FontAwesomeIcon icon={faReceipt} className="h-3 w-3" />
                  <span>Simpan</span>
                </Button>
              </form>

              {/* 1-Tap Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                <span className="text-slate font-medium text-[10px] uppercase font-mono mr-1">Cepat:</span>
                {[
                  { label: 'Kopi 15k', amount: 15000, desc: 'Es Kopi' },
                  { label: 'Makan 25k', amount: 25000, desc: 'Makan Siang' },
                  { label: 'Bensin 30k', amount: 30000, desc: 'Bensin Motor' },
                  { label: 'Parkir 5k', amount: 5000, desc: 'Parkir' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickAddExpense(preset.amount, preset.desc)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-navy hover:text-white text-slate-700 transition-colors font-semibold cursor-pointer border border-border/80"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Main Grid: Agenda (Left) & Quick Action Controls (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Agenda & Flow Hari Ini (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-body font-heading font-bold text-navy">Agenda Hari Ini</h2>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {completedTodos}/{totalTodos}
                  </span>
                </div>
              </div>

              <TodayFlowWidget
                todos={todos}
                onToggleTodo={handleToggleTodo}
                onAddTodo={handleAddTodoFromFlow}
                onUpdateTodo={handleUpdateTodo}
                onDeleteTodo={handleDeleteTodo}
                onRefreshTodos={() => setTodos(Storage.getTodayTodos())}
              />
            </Card>
          </div>

          {/* Right Column: 1-Tap Actions (Sholat, Habits, Protein, Keuangan) */}
          <div className="space-y-4">
            {/* 1. Sholat 5 Waktu (1-Tap Buttons) */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faMosque} className="text-emerald-600 text-sm" />
                  <h3 className="text-body-sm font-heading font-bold text-navy">Sholat 5 Waktu</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-700">
                  {prayersDone}/5 selesai
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5">
                {(
                  [
                    { key: 'subuh', label: 'Subuh' },
                    { key: 'dzuhur', label: 'Dzuhur' },
                    { key: 'ashar', label: 'Ashar' },
                    { key: 'maghrib', label: 'Maghrib' },
                    { key: 'isya', label: 'Isya' },
                  ] as const
                ).map((p) => {
                  const done = prayerStatus.prayers[p.key]
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handleTogglePrayer(p.key)}
                      className={`py-2 rounded-xl border text-center transition-all cursor-pointer ${
                        done
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs'
                          : 'bg-slate-50 border-border text-slate-600 hover:border-slate-400 font-medium'
                      }`}
                      title={`Tandai sholat ${p.label}`}
                    >
                      <span className="block text-[10px]">{p.label}</span>
                      <span className="block text-[11px] font-mono mt-0.5">
                        {done ? '✓' : '—'}
                      </span>
                    </button>
                  )
                })}
              </div>

              <Link
                href="/sholat"
                className="mt-3 text-[11px] font-heading font-semibold text-slate hover:text-navy flex items-center justify-between pt-2 border-t border-border group"
              >
                <span>Jadwal sholat lengkap</span>
                <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5 text-slate group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Card>

            {/* 2. Habits Hari Ini (1-Tap Check) */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faListCheck} className="text-navy text-sm" />
                  <h3 className="text-body-sm font-heading font-bold text-navy">Habits Hari Ini</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-navy">
                  {habitsDone}/{habits.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {habits.slice(0, 5).map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleToggleHabit(h.id)}
                    className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      h.completedToday
                        ? 'bg-emerald-50/70 border-emerald-300 text-navy font-semibold'
                        : 'bg-slate-50 border-border text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 mr-2">
                      <span
                        className={`h-4 w-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          h.completedToday ? 'bg-navy text-white' : 'border border-slate-300 bg-white'
                        }`}
                      >
                        {h.completedToday ? '✓' : ''}
                      </span>
                      <span className={`text-[11px] wrap-break-word ${h.completedToday ? 'line-through text-slate' : ''}`}>
                        {h.name}
                      </span>
                    </div>
                    {h.streak > 0 && (
                      <span className="text-[10px] font-mono font-semibold text-amber-700 shrink-0 flex items-center gap-1">
                        <FontAwesomeIcon icon={faFire} className="text-[9px] text-amber-500" />
                        {h.streak}d
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <Link
                href="/habits"
                className="mt-3 text-[11px] font-heading font-semibold text-slate hover:text-navy flex items-center justify-between pt-2 border-t border-border group"
              >
                <span>Lihat semua & riwayat habit</span>
                <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5 text-slate group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Card>

            {/* 3. Protein Bulking (1-Tap Chips) */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faDumbbell} className="text-amber-600 text-sm" />
                  <h3 className="text-body-sm font-heading font-bold text-navy">Protein Bulking</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-700">
                  {todayProtein} / {nutritionTarget.targetProtein}g
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2.5">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.round((todayProtein / (nutritionTarget.targetProtein || 1)) * 100))}%`,
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {[
                  { name: '3 Telur', p: 18, cal: 210, cat: 'sarapan' as MealCategory },
                  { name: 'Ayam 150g', p: 46, cal: 247, cat: 'makan_siang' as MealCategory },
                  { name: '1 Whey', p: 25, cal: 120, cat: 'pre_post_workout' as MealCategory },
                  { name: 'Susu UHT', p: 8, cal: 150, cat: 'nyemil' as MealCategory },
                ].map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddQuickMeal(m.name, m.cal, m.p, m.cat)}
                    className="px-2 py-1 rounded-lg border border-border bg-slate-50 hover:bg-navy hover:text-white text-navy text-[10px] font-semibold transition-all cursor-pointer active:scale-95"
                  >
                    + {m.name} ({m.p}g)
                  </button>
                ))}
              </div>

              <Link
                href="/gym"
                className="mt-3 text-[11px] font-heading font-semibold text-slate hover:text-navy flex items-center justify-between pt-2 border-t border-border group"
              >
                <span>Buka log gym & nutrisi</span>
                <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5 text-slate group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Card>

            {/* 4. Keuangan Ringkas */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faWallet} className="text-emerald-600 text-sm" />
                  <h3 className="text-body-sm font-heading font-bold text-navy">Rekening & Saldo</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-700">
                  Total: {formatRupiah(totalLiquidWealth)}
                </span>
              </div>

              <div className="space-y-1 text-[11px] font-mono bg-slate-50 p-2.5 rounded-xl border border-border/80 mb-2">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex items-start justify-between gap-2 text-slate">
                    <span className="wrap-break-word">{acc.name}:</span>
                    <strong className="text-navy shrink-0">{formatRupiah(acc.balance)}</strong>
                  </div>
                ))}
              </div>

              <Link
                href="/finance"
                className="mt-2 text-[11px] font-heading font-semibold text-slate hover:text-navy flex items-center justify-between pt-2 border-t border-border group"
              >
                <span>Kelola rekening & transaksi</span>
                <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5 text-slate group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Card>
          </div>
        </div>
      </div>

      {/* Daily Capture thoughts / sleep modal (opened manually only) */}
      <DailyCaptureModal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        todos={todos}
        onToggleTodo={handleToggleTodo}
        onAddTodo={handleAddTodo}
        onDeleteTodo={handleDeleteTodo}
        onSaveThoughts={(thoughts, sleep) => {
          const today = getTodayDateStr()
          Storage.saveTodayCapture({
            date: today,
            thoughts,
            plans: todos.map((t, idx) => `${idx + 1}. ${t.text}`).join('\n'),
            priority: 'high',
            mood: 'focused',
            sleepBedTime: sleep?.bedTime ?? '23:00',
            sleepWakeTime: sleep?.wakeTime ?? '06:30',
            sleepHours: sleep?.hours ?? 7.5,
          })
          setDailyCaptures(Storage.getDailyCaptures())
          setShowCaptureModal(false)
          showToast('Catatan berhasil disimpan', 'success')
        }}
      />

      <WeeklyReviewModal
        isOpen={showWeeklyReview}
        onClose={() => setShowWeeklyReview(false)}
        dailyCaptures={dailyCaptures}
        todos={todos}
        prayerStatus={prayerStatus}
        transactions={transactions}
        workoutSession={workoutSession}
        habits={habits}
        notes={notes}
        meals={meals}
        nutritionTarget={nutritionTarget}
        userProfile={userProfile}
      />
    </DashboardLayout>
  )
}
