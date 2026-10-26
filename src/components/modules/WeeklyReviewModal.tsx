'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBed,
  faMosque,
  faWallet,
  faDumbbell,
  faListCheck,
  faXmark,
  faCheck,
  faArrowRight,
  faAward,
  faFire,
  faCalendarWeek,
} from '@fortawesome/free-solid-svg-icons'
import { TaskMascot, ProgressBar, Badge, Button } from '@/components/ui'
import { formatRupiah } from '@/components/modules/FinanceWidget'
import type {
  DailyCapture,
  PrayerStatus,
  Transaction,
  WorkoutSession,
  Habit,
  NotionNote,
  TodoItem,
  MealLog,
  NutritionTarget,
  UserProfile,
} from '@/types'

interface WeeklyReviewModalProps {
  isOpen: boolean
  onClose: () => void
  dailyCaptures: DailyCapture[]
  todos: TodoItem[]
  prayerStatus: PrayerStatus
  transactions: Transaction[]
  workoutSession: WorkoutSession
  habits: Habit[]
  notes: NotionNote[]
  meals: MealLog[]
  nutritionTarget: NutritionTarget
  userProfile: UserProfile
}

export default function WeeklyReviewModal({
  isOpen,
  onClose,
  dailyCaptures,
  todos,
  prayerStatus,
  transactions,
  workoutSession,
  habits,
  notes,
  meals,
  nutritionTarget,
  userProfile,
}: WeeklyReviewModalProps) {
  if (!isOpen) return null

  // 1. Sleep Metrics (Last 7 Days)
  const recentCaptures = dailyCaptures.slice(0, 7)
  const loggedSleep = recentCaptures.filter((c) => c.sleepHours)
  const avgSleepHours =
    loggedSleep.length > 0
      ? Math.round((loggedSleep.reduce((sum, c) => sum + (c.sleepHours || 7.5), 0) / loggedSleep.length) * 10) / 10
      : 7.5
  const optimalNights = loggedSleep.filter((c) => (c.sleepHours || 0) >= 7.0).length

  // 2. Workout & Nutrition
  const totalSets = workoutSession.exercises.reduce((a, c) => a + c.sets.length, 0)
  const doneSets = workoutSession.exercises.reduce((a, c) => a + c.sets.filter((s) => s.done).length, 0)
  const totalMealProtein = meals.reduce((a, c) => a + c.protein, 0)
  const avgProtein = meals.length > 0 ? Math.round(totalMealProtein / Math.max(1, new Set(meals.map(m => m.date)).size)) : 95

  // 3. Sholat
  const streak = prayerStatus.streak || 5

  // 4. Finance
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((a, c) => a + c.amount, 0)

  // 5. Habits & Creative
  const habitRate = habits.length > 0
    ? Math.round((habits.filter((h) => h.completedToday).length / habits.length) * 100)
    : 80
  const creativeEditsCount = notes.filter((n) => n.tag === 'Edit Foto' || n.tag === 'Kreatif').length

  // Overall Score (0-100)
  const overallScore = Math.min(
    98,
    Math.round(
      (avgSleepHours / 7.5) * 20 +
      Math.min(1, streak / 7) * 20 +
      Math.min(1, avgProtein / nutritionTarget.targetProtein) * 20 +
      (habitRate / 100) * 20 +
      18
    )
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl p-5 sm:p-6 z-10 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-navy text-white flex items-center justify-center shadow-xs">
              <FontAwesomeIcon icon={faCalendarWeek} className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-body sm:text-h4 font-heading font-bold text-navy">
                  Rapor Mingguan Daily OS
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase font-mono">
                  Skor: {overallScore}%
                </span>
              </div>
              <p className="text-caption text-slate">
                Evaluasi komprehensif disiplin & konsistensi minggu ini
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
            aria-label="Tutup"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        {/* Mascot Banner Highlight */}
        <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border border-indigo-100 flex items-center gap-3.5">
          <TaskMascot state="done" size={44} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-navy font-mono block">
              Evaluasi Maskot Daily
            </span>
            <p className="text-caption text-slate-700 leading-relaxed font-body">
              MasyaAllah luar biasa, Edo! Konsistensi minggu ini terjaga di level <strong>{overallScore}%</strong>. Target tidur, bulking gym, dan sholat tetap berada di jalur yang benar. Istirahat sejenak malam ini dan sambut Senin besok dengan energi penuh!
            </p>
          </div>
        </div>

        {/* 5 Pillars Progress Cards */}
        <div className="space-y-3 mb-5">
          {/* 1. Tidur */}
          <div className="p-3.5 rounded-xl border border-border bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faBed} className="text-xs" />
              </div>
              <div className="min-w-0">
                <span className="text-caption font-bold text-navy block truncate">
                  Tidur & Ritme Istirahat
                </span>
                <span className="text-[11px] text-slate font-mono">
                  Rata-rata: {avgSleepHours}j / malam • {optimalNights} malam optimal
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase font-mono ${
              avgSleepHours >= 7 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {avgSleepHours >= 7 ? 'Optimal' : 'Defisit Istirahat'}
            </span>
          </div>

          {/* 2. Gym & Bulking */}
          <div className="p-3.5 rounded-xl border border-border bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faDumbbell} className="text-xs" />
              </div>
              <div className="min-w-0">
                <span className="text-caption font-bold text-navy block truncate">
                  Gym & Clean Bulk Menuju 68 kg
                </span>
                <span className="text-[11px] text-slate font-mono">
                  BB {userProfile.bodyWeightKg}kg • Protein avg {avgProtein}g / hari
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 uppercase font-mono">
              On Track
            </span>
          </div>

          {/* 3. Sholat 5 Waktu */}
          <div className="p-3.5 rounded-xl border border-border bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faMosque} className="text-xs" />
              </div>
              <div className="min-w-0">
                <span className="text-caption font-bold text-navy block truncate">
                  Ketepatan Sholat Lima Waktu
                </span>
                <span className="text-[11px] text-slate font-mono">
                  Streak terjaga {streak} hari beruntun
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase font-mono">
              Konsisten
            </span>
          </div>

          {/* 4. Keuangan */}
          <div className="p-3.5 rounded-xl border border-border bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faWallet} className="text-xs" />
              </div>
              <div className="min-w-0">
                <span className="text-caption font-bold text-navy block truncate">
                  Cashflow Keuangan Gaji Rp 2.8jt
                </span>
                <span className="text-[11px] text-slate font-mono">
                  Pengeluaran tercatat: {formatRupiah(totalExpense)}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 uppercase font-mono">
              Terkendali
            </span>
          </div>

          {/* 5. Kreatif & Foto Edit */}
          <div className="p-3.5 rounded-xl border border-border bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faListCheck} className="text-xs" />
              </div>
              <div className="min-w-0">
                <span className="text-caption font-bold text-navy block truncate">
                  Karya Kreatif & Habits
                </span>
                <span className="text-[11px] text-slate font-mono">
                  {creativeEditsCount} ide edit foto • {habitRate}% habits selesai
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 uppercase font-mono">
              Produktif
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Tutup Rapor & Sambut Minggu Baru
          </Button>
        </div>
      </div>
    </div>
  )
}
