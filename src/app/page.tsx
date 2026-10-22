'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { StatCard, Button, showToast } from '@/components/ui'
import DailyCaptureModal from '@/components/modules/DailyCaptureModal'
import TodoListWidget from '@/components/modules/TodoListWidget'
import SholatWidget from '@/components/modules/SholatWidget'
import FinanceWidget, { formatRupiah } from '@/components/modules/FinanceWidget'
import GymWidget from '@/components/modules/GymWidget'
import HabitsWidget from '@/components/modules/HabitsWidget'
import NotionNotes from '@/components/modules/NotionNotes'
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
    }

    refreshAll()
    window.addEventListener('lifetime-data-change', refreshAll)
    window.addEventListener('storage', refreshAll)
    return () => {
      window.removeEventListener('lifetime-data-change', refreshAll)
      window.removeEventListener('storage', refreshAll)
    }
  }, [])

  // Handlers
  const handleDeleteTransaction = (id: string) => {
    Storage.deleteTransaction(id)
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const handleToggleTodo = (id: string) => {
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

  const handleAddTransaction = (tx: Omit<Transaction, 'id'>) => {
    const saved = Storage.addTransaction(tx)
    setTransactions((prev) => [saved, ...prev])
  }

  const handleToggleWorkoutSet = (exerciseId: string, setNumber: number) => {
    const updated = Storage.toggleWorkoutSet(exerciseId, setNumber)
    setWorkoutSession(updated)
  }

  const handleToggleHabit = (id: string) => {
    const updated = Storage.toggleHabit(id)
    setHabits(updated)
  }

  const handleAddNote = (noteData: Omit<NotionNote, 'id' | 'updatedAt'>) => {
    const saved = Storage.addNote(noteData)
    setNotes((prev) => [saved, ...prev])
  }

  const handleDeleteNote = (id: string) => {
    Storage.deleteNote(id)
    setNotes((prev) => prev.filter((n) => n.id !== id))
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
        onSaveThoughts={(thoughts) => {
          const today = new Date().toISOString().split('T')[0]
          Storage.addDailyCapture({
            date: today,
            thoughts,
            plans: todos.map((t, idx) => `${idx + 1}. ${t.text}`).join('\n'),
            priority: 'high',
            mood: 'focused',
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

        {/* 3. Main Grid: Sholat & Habits */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <SholatWidget status={prayerStatus} onToggle={handleTogglePrayer} />
          </div>
          <div className="lg:col-span-1">
            <HabitsWidget habits={habits} onToggleHabit={handleToggleHabit} />
          </div>
        </div>

        {/* 4. Keuangan & Gym Modules */}
        <div className="space-y-5">
          <FinanceWidget
            transactions={transactions}
            budgets={budgets}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />

          <GymWidget
            session={workoutSession}
            onToggleSet={handleToggleWorkoutSet}
          />
        </div>

        {/* 5. Notion Quick Notes & Idea Scratchpad */}
        <div>
          <NotionNotes
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
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
