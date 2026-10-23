'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatCard, Button, showToast } from '@/components/ui'
import DailyCaptureModal from '@/components/modules/DailyCaptureModal'
import TodoListWidget from '@/components/modules/TodoListWidget'
import { formatRupiah } from '@/components/modules/FinanceWidget'
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
  NutritionTarget,
  UserProfile,
} from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMosque,
  faWallet,
  faDumbbell,
  faListCheck,
  faPlus,
  faPenToSquare,
  faBed,
  faMoon,
  faBrain,
  faArrowRight,
  faUtensils,
  faFire,
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
      splitName: 'Push Day A',
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

  const [showCaptureModal, setShowCaptureModal] = useState(() => {
    if (typeof window !== 'undefined') {
      return !Storage.hasCapturedToday()
    }
    return false
  })

  const todayDateStr = typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : ''
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
    }

    refreshAll()
    window.addEventListener('lifetime-data-change', refreshAll)
    window.addEventListener('storage', refreshAll)
    return () => {
      window.removeEventListener('lifetime-data-change', refreshAll)
      window.removeEventListener('storage', refreshAll)
    }
  }, [])

  // Handlers for Home Dashboard
  const handleToggleTodo = async (id: string) => {
    const updated = Storage.toggleTodo(id)
    setTodos(updated)
    const item = updated.find((t) => t.id === id)
    if (item) {
      showToast(
        item.done ? 'Tugas ditandai selesai!' : 'Tugas dikembalikan ke antrean',
        item.done ? 'success' : 'info'
      )
    }
  }

  const handleAddTodo = (text: string, priority?: 'high' | 'medium' | 'low') => {
    Storage.addTodo({ text, done: false, priority: priority || 'medium' })
    setTodos(Storage.getTodayTodos())
    showToast('Tugas baru berhasil ditambahkan ke agenda hari ini!', 'success')
  }

  const handleDeleteTodo = (id: string) => {
    const updated = Storage.deleteTodo(id)
    setTodos(updated)
    showToast('Tugas dihapus dari agenda', 'info')
  }

  const handleTogglePrayer = (prayer: PrayerName) => {
    const updated = Storage.togglePrayer(prayer)
    setPrayerStatus(updated)
  }

  const handleToggleHabit = (id: string) => {
    const updated = Storage.toggleHabit(id)
    setHabits(updated)
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
  const totalSets = workoutSession.exercises.reduce((a, c) => a + c.sets.length, 0)
  const doneSets = workoutSession.exercises.reduce(
    (a, c) => a + c.sets.filter((s) => s.done).length,
    0
  )
  const habitsDone = habits.filter((h) => h.completedToday).length
  const todayCapture = dailyCaptures.find((c) => c.date === todayDateStr)

  // Nutrition & Bulking stats for today
  const todayMeals = meals.filter((m) => m.date === todayDateStr)
  const todayCalories = todayMeals.reduce((a, c) => a + c.calories, 0)
  const todayProtein = todayMeals.reduce((a, c) => a + c.protein, 0)

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview produktivitas & kontrol harian">
      {/* Daily To-Do Planning Modal */}
      <DailyCaptureModal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        todos={todos}
        onToggleTodo={handleToggleTodo}
        onAddTodo={handleAddTodo}
        onDeleteTodo={handleDeleteTodo}
        onSaveThoughts={(thoughts, sleep) => {
          const today = new Date().toISOString().split('T')[0]
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
        }}
      />

      <div className="space-y-5 pb-12">
        {/* Top Action & Welcome Hero Banner - Verdana Health Navy */}
        <div className="relative overflow-hidden rounded-2xl bg-navy text-white p-4 sm:p-6 lg:p-8 border border-slate-800 shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-white/10 text-caption font-medium text-slate-200 border border-white/10 uppercase tracking-wider">
                  Personal Operating System
                </span>
                <span className="text-caption text-slate-200 font-mono">
                  {todayFormatted || 'Hari ini'}
                </span>
              </div>
              <h2 className="text-h2 sm:text-display text-white font-heading font-bold tracking-tight">
                Disiplin & Kontrol Harian
              </h2>
              <p className="text-body-sm text-slate-300 mt-1.5 leading-relaxed">
                Tumpahkan catatan pikiran, pantau ketepatan sholat lima waktu, kendalikan cashflow keuangan, dan catat volume latihan beban dalam satu sistem terpadu.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => setShowCaptureModal(true)}
                className="h-10 px-4 rounded-xl bg-white text-navy hover:bg-slate-100 font-heading font-bold text-body-sm shadow-md active:scale-95 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5 text-navy shrink-0" />
                <span className="text-navy font-bold text-body-sm">Tambah</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards Row - Android 2x2 grid on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <StatCard
            label="Sholat Hari Ini"
            value={`${prayersDone}/5`}
            sublabel={prayersDone === 5 ? 'Lengkap lima waktu' : `${5 - prayersDone} waktu tersisa`}
            icon={faMosque}
            color={prayersDone === 5 ? 'sage' : 'navy'}
            trend={`${prayerStatus.streak} hari streak`}
            trendUp={true}
          />

          <StatCard
            label="Total Saldo Bersih"
            value={formatRupiah(netBalance)}
            sublabel={`Pemasukan: +${formatRupiah(totalIncome)}`}
            icon={faWallet}
            color="sage"
            trend="Cashflow positif"
            trendUp={true}
          />

          <StatCard
            label="Volume Workout"
            value={`${doneSets}/${totalSets}`}
            sublabel={workoutSession.splitName.split('(')[0].trim()}
            icon={faDumbbell}
            color="info"
            trend="Push Day fokus"
            trendUp={true}
          />

          <StatCard
            label="Atomic Habits"
            value={`${habitsDone}/${habits.length}`}
            sublabel="Konsistensi rutinitas"
            icon={faListCheck}
            color="warning"
            trend={`${Math.round((habitsDone / (habits.length || 1)) * 100)}% selesai`}
            trendUp={habitsDone > 3}
          />
        </div>

        {/* 1. Today's Interactive To-Do List Widget */}
        <TodoListWidget
          todos={todos}
          onToggleTodo={handleToggleTodo}
          onAddTodo={handleAddTodo}
          onDeleteTodo={handleDeleteTodo}
          onOpenModal={() => setShowCaptureModal(true)}
        />

        {/* 2. Today's Reflection / Daily Capture thoughts if exists */}
        {todayCapture && (
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-slate/30 transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8.5 w-8.5 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FontAwesomeIcon icon={faBrain} className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-body-sm font-heading font-bold text-navy truncate">
                    Fokus & Catatan Harian
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate font-mono mt-0.5 flex-wrap">
                    <span>Mood: {todayCapture.mood ?? 'focused'}</span>
                    <span>•</span>
                    <span>Prioritas: {todayCapture.priority ?? 'medium'}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCaptureModal(true)}
                className="h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-navy text-navy font-heading font-bold text-caption shadow-xs hover:shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Tulis ulang catatan & rekap tidur"
              >
                <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3 text-navy" />
                <span>Tulis Ulang</span>
              </button>
            </div>

            {/* Sleep Summary Pill if recorded */}
            <div className="mb-2.5 p-2.5 rounded-xl bg-slate-100/80 border border-border flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-caption font-medium text-navy">
                <FontAwesomeIcon icon={faBed} className="text-navy text-xs" />
                <span>
                  Tidur semalam: <strong className="font-mono">{todayCapture.sleepBedTime ?? '23:00'}</strong> - Bangun: <strong className="font-mono">{todayCapture.sleepWakeTime ?? '06:30'}</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {todayCapture.sleepHours ?? 7.5} Jam Istirahat
              </span>
            </div>

            <p className="text-navy font-body text-body-sm leading-relaxed whitespace-pre-line bg-slate-50/70 p-3.5 rounded-xl border border-border/60">
              {todayCapture.thoughts || 'Belum ada catatan pikiran tambahan. Klik Tulis Ulang untuk menambahkan unek-unek pagi.'}
            </p>
          </div>
        )}

        {/* Ringkasan Modul Hari Ini (Executive Overview & Fast Controls) */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy">
                Ringkasan Modul Hari Ini
              </h3>
              <p className="text-caption text-slate">
                Ikhtisar status harian & jalan pintas cepat ke masing-masing modul
              </p>
            </div>
            <span className="self-start sm:self-auto text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Neon PostgreSQL Terhubung</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Ringkasan Sholat 5 Waktu */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-slate/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8.5 w-8.5 rounded-xl bg-sage/10 text-sage flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faMosque} className="h-4 w-4 text-sage" />
                    </div>
                    <div>
                      <h4 className="text-body-sm font-heading font-bold text-navy">
                        Sholat 5 Waktu
                      </h4>
                      <span className="text-[11px] text-slate font-mono">
                        {prayersDone}/5 Waktu Selesai • {prayerStatus.streak} Hari Streak
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    prayersDone === 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {prayersDone === 5 ? 'Lengkap 🎉' : `${5 - prayersDone} Tersisa`}
                  </span>
                </div>

                {/* 5 Prayer Fast Toggles */}
                <div className="grid grid-cols-5 gap-1.5 mb-2">
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
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          done
                            ? 'bg-sage text-white border-sage shadow-2xs font-bold'
                            : 'bg-slate-50 border-border text-slate-700 hover:border-slate-400 font-medium'
                        }`}
                        title={`Klik untuk tandai sholat ${p.label}`}
                      >
                        <span className="block text-[11px] truncate">{p.label}</span>
                        <span className="block text-[10px] font-mono mt-0.5">
                          {done ? '✓' : '—'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Link
                href="/sholat"
                className="mt-3 text-[12px] font-heading font-bold text-navy hover:text-navy-hover flex items-center justify-between pt-3 border-t border-border group"
              >
                <span>Buka Jadwal Sholat Lengkap</span>
                <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-slate group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 2. Ringkasan Keuangan */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-slate/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8.5 w-8.5 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faWallet} className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="text-body-sm font-heading font-bold text-navy">
                        Ringkasan Keuangan
                      </h4>
                      <span className="text-[11px] text-slate font-mono">
                        Saldo: {formatRupiah(netBalance)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {transactions.length} Transaksi
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10px] text-emerald-900 block font-medium">Pemasukan</span>
                    <span className="text-body-sm font-bold font-mono text-emerald-800">
                      +{formatRupiah(totalIncome)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200">
                    <span className="text-[10px] text-rose-900 block font-medium">Pengeluaran</span>
                    <span className="text-body-sm font-bold font-mono text-rose-800">
                      -{formatRupiah(totalExpense)}
                    </span>
                  </div>
                </div>

                {transactions.length > 0 && (
                  <div className="text-[11px] text-slate bg-slate-50 p-2 rounded-lg border border-border/80 flex items-center justify-between">
                    <span className="truncate mr-2">
                      Terbaru: <strong>{transactions[0].description || transactions[0].category}</strong>
                    </span>
                    <span className="font-mono font-bold shrink-0 text-navy">
                      {formatRupiah(transactions[0].amount)}
                    </span>
                  </div>
                )}
              </div>

              <Link
                href="/finance"
                className="mt-3 text-[12px] font-heading font-bold text-navy hover:text-navy-hover flex items-center justify-between pt-3 border-t border-border group"
              >
                <span>Kelola Transaksi & Budget Lengkap</span>
                <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-slate group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 3. Ringkasan Gym & Nutrisi Bulking */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-slate/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8.5 w-8.5 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faDumbbell} className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-body-sm font-heading font-bold text-navy">
                        Gym & Nutrisi Clean Bulk
                      </h4>
                      <span className="text-[11px] text-slate font-mono">
                        TB {userProfile.heightCm} cm • BB {userProfile.bodyWeightKg} kg → Target {userProfile.targetWeightKg} kg
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider">
                    {workoutSession.splitName.split('(')[0].trim()}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium text-slate-700">Asupan Kalori Bulking</span>
                      <span className="font-mono font-bold text-amber-700">
                        {todayCalories} / {nutritionTarget.targetCalories} kkal
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round((todayCalories / (nutritionTarget.targetCalories || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-medium text-slate-700">Target Protein (2.0g/kg BB)</span>
                      <span className="font-mono font-bold text-blue-700">
                        {todayProtein} / {nutritionTarget.targetProtein} g
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round((todayProtein / (nutritionTarget.targetProtein || 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href="/gym"
                className="mt-3 text-[12px] font-heading font-bold text-navy hover:text-navy-hover flex items-center justify-between pt-3 border-t border-border group"
              >
                <span>Buka Log Latihan & Nutrisi Detail</span>
                <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-slate group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* 4. Ringkasan Atomic Habits */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-slate/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8.5 w-8.5 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
                      <FontAwesomeIcon icon={faListCheck} className="h-4 w-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="text-body-sm font-heading font-bold text-navy">
                        Atomic Habits
                      </h4>
                      <span className="text-[11px] text-slate font-mono">
                        {habitsDone}/{habits.length} Kebiasaan Selesai Hari Ini
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {Math.round((habitsDone / (habits.length || 1)) * 100)}%
                  </span>
                </div>

                {/* Quick Check Habits */}
                <div className="space-y-1.5 mb-3">
                  {habits.slice(0, 3).map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleToggleHabit(h.id)}
                      className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                        h.completedToday
                          ? 'bg-navy/5 border-navy/30 text-navy font-semibold'
                          : 'bg-slate-50 border-border text-slate-700 hover:bg-slate-100'
                      }`}
                      title={`Tandai selesai: ${h.name}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 mr-2">
                        <span className={`h-4 w-4 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          h.completedToday ? 'bg-navy text-white' : 'border border-slate-300 bg-white'
                        }`}>
                          {h.completedToday ? '✓' : ''}
                        </span>
                        <span className={`text-[11px] truncate ${h.completedToday ? 'line-through opacity-80' : ''}`}>
                          {h.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate shrink-0">
                        {h.streak}d streak
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Link
                href="/habits"
                className="mt-3 text-[12px] font-heading font-bold text-navy hover:text-navy-hover flex items-center justify-between pt-3 border-t border-border group"
              >
                <span>Kelola Seluruh Atomic Habits</span>
                <FontAwesomeIcon icon={faArrowRight} className="h-3 w-3 text-slate group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Android Material Floating Action Button (FAB) for Quick To-Do Capture */}
      <button
        type="button"
        onClick={() => setShowCaptureModal(true)}
        className="fixed right-4 sm:right-6 bottom-20 z-30 flex items-center justify-center h-13 w-13 rounded-2xl bg-sage text-white shadow-lg shadow-sage/35 hover:bg-sage-hover active:scale-90 transition-all duration-200"
        aria-label="Buka To-Do List Hari Ini"
        title="Buka To-Do List Hari Ini"
      >
        <FontAwesomeIcon icon={faListCheck} className="h-5 w-5" />
      </button>
    </DashboardLayout>
  )
}
