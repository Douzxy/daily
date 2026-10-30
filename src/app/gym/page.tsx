'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import GymWidget from '@/components/modules/GymWidget'
import NutritionBulkingWidget from '@/components/modules/NutritionBulkingWidget'
import PeriodFilterBar, { type PeriodMode } from '@/components/layout/PeriodFilterBar'
import { Card, Badge, StatCard, showToast, ConfirmModal } from '@/components/ui'
import {
  Storage,
  PPL_PRESETS,
  SPLIT_NAMES,
  computeWorkoutRecommendation,
  computeDateAwareWeightTargets,
} from '@/lib/storage'
import type {
  WorkoutSession,
  WeeklyWeightLog,
  MealLog,
  NutritionTarget,
  DailyWorkoutLog,
  WorkoutSplitType,
  DailyCapture,
  TodoItem,
} from '@/types'
import {
  MONTH_NAMES_ID,
  getCurrentYearAndMonth,
  getWeeksInMonth,
  getTodayDateStr,
} from '@/lib/dateUtils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDumbbell,
  faTrophy,
  faFire,
  faCalendar,
  faWeightScale,
  faChartLine,
  faPlus,
  faArrowTrendUp,
  faPenToSquare,
  faTrashCan,
  faXmark,
  faUtensils,
  faCheck,
  faBed,
  faCircleExclamation,
  faCircleCheck,
  faBriefcase,
} from '@fortawesome/free-solid-svg-icons'

export default function GymPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const [workoutLogs, setWorkoutLogs] = useState<Record<string, DailyWorkoutLog>>(() => {
    if (typeof window !== 'undefined') return Storage.getWorkoutLogs()
    return {}
  })

  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') return Storage.getUserProfile()
    return { name: 'Edo', email: '', salary: 2800000, bodyWeightKg: 57.8, heightCm: 168, targetWeightKg: 68.0, city: 'Tangerang Selatan' }
  })

  const [captures, setCaptures] = useState<DailyCapture[]>(() => {
    if (typeof window !== 'undefined') return Storage.getDailyCaptures()
    return []
  })

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (typeof window !== 'undefined') return Storage.getTodayTodos()
    return []
  })

  // Period Navigators state (Month, Year, Week, Mode)
  const initialDate = getCurrentYearAndMonth()
  const [periodMode, setPeriodMode] = useState<PeriodMode>('weekly')
  const [selectedYear, setSelectedYear] = useState<number>(initialDate.year)
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(initialDate.monthIndex)
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(() => {
    const today = getTodayDateStr()
    const weeks = getWeeksInMonth(initialDate.year, initialDate.monthIndex)
    return weeks.find((w) => w.days.some((d) => d.date === today))?.weekNumber ?? 1
  })

  // Nutrition & Meal Logs state (Clean Bulking)
  const [meals, setMeals] = useState<MealLog[]>(() => {
    if (typeof window !== 'undefined') return Storage.getMealLogs()
    return []
  })
  const [nutritionTarget, setNutritionTarget] = useState<NutritionTarget>(() => {
    if (typeof window !== 'undefined') return Storage.getNutritionTarget()
    return { targetCalories: 2547, targetProtein: 116 }
  })

  // Weekly bodyweight logs state
  const [weightLogs, setWeightLogs] = useState<WeeklyWeightLog[]>(() => {
    if (typeof window !== 'undefined') return Storage.getWeeklyWeightLogs()
    return []
  })
  const [newWeightInput, setNewWeightInput] = useState(() =>
    typeof window !== 'undefined' ? String(Storage.getCurrentBodyWeight()) : '58.0'
  )

  // Edit / Add Custom Weight Log Modal state
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [editingWeightLog, setEditingWeightLog] = useState<WeeklyWeightLog | null>(null)
  const [deleteConfirmWeightLog, setDeleteConfirmWeightLog] = useState<{ id: string; label: string } | null>(null)
  const [modalWeekLabel, setModalWeekLabel] = useState('')
  const [modalWeightKg, setModalWeightKg] = useState('')
  const [modalDate, setModalDate] = useState('')
  const [modalNotes, setModalNotes] = useState('')

  useEffect(() => {
    const refresh = () => {
      setWorkoutLogs(Storage.getWorkoutLogs())
      setProfile(Storage.getUserProfile())
      setWeightLogs(Storage.getWeeklyWeightLogs())
      setMeals(Storage.getMealLogs())
      setNutritionTarget(Storage.getNutritionTarget())
      setCaptures(Storage.getDailyCaptures())
      setTodos(Storage.getTodayTodos())
    }
    refresh()
    window.addEventListener('lifetime-data-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('lifetime-data-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  // Calculate dynamic weeks for chosen year & month
  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonthIndex)
  const activeWeek =
    weeksInMonth.find((w) => w.weekNumber === selectedWeekNumber) || weeksInMonth[0]

  // Dynamic schedule for the active week & active date
  const todayStr = getTodayDateStr()
  const [selectedDayOverride, setSelectedDayOverride] = useState<string | null>(null)

  const effectiveDate = (() => {
    if (selectedDayOverride && (activeWeek?.days || []).some((d) => d.date === selectedDayOverride)) {
      return selectedDayOverride
    }
    const hasToday = (activeWeek?.days || []).some((d) => d.date === todayStr)
    if (hasToday) return todayStr
    return activeWeek?.startDate || todayStr
  })()

  // Derive current bodyweight & date-aware targets dynamically
  const currentWeight =
    weightLogs.length > 0
      ? weightLogs[weightLogs.length - 1].weightKg
      : Number(profile.bodyWeightKg) || 58.0
  const targetWeight = Number(profile.targetWeightKg) || 68.0
  const surplus = nutritionTarget.surplus ?? 350

  const weekStartStr = activeWeek?.startDate || todayStr
  const weekEndStr = activeWeek?.endDate || todayStr
  const logsBeforeWeek = weightLogs.filter((l) => l.date && l.date < weekStartStr)
  const prevWeekLog = logsBeforeWeek.length > 0 ? logsBeforeWeek[logsBeforeWeek.length - 1] : null
  const thisWeekLogs = weightLogs.filter((l) => l.date && l.date >= weekStartStr && l.date <= weekEndStr)
  const thisWeekLog = thisWeekLogs.length > 0 ? thisWeekLogs[thisWeekLogs.length - 1] : null
  const monthName = MONTH_NAMES_ID[selectedMonthIndex]

  const weightTargets = computeDateAwareWeightTargets({
    weightLogs,
    currentWeight,
    targetWeight,
    surplus,
    todayStr,
    weekNumber: selectedWeekNumber,
    weekStartStr,
    weekEndStr,
    selectedYear,
    selectedMonthIndex,
  })
  const { weeklyGainRate, monthlyFullRate } = weightTargets

  // Session & recommendation for effectiveDate
  const activeDayLog = workoutLogs[effectiveDate]
  const activeDayCapture = captures.find((c) => c.date === effectiveDate)
  const activeRecommendation = computeWorkoutRecommendation(
    workoutLogs,
    effectiveDate,
    activeDayCapture?.sleepHours
  )

  const activeSession: WorkoutSession = {
    id: `ws-${effectiveDate}`,
    date: effectiveDate,
    splitType: activeDayLog?.splitType,
    splitName: activeDayLog ? SPLIT_NAMES[activeDayLog.splitType] : '',
    exercises:
      activeDayLog && activeDayLog.splitType !== 'rest'
        ? PPL_PRESETS[activeDayLog.splitType].exercises
        : [],
    completed: Boolean(activeDayLog?.completed && activeDayLog.splitType !== 'rest'),
    skipped: activeDayLog?.splitType === 'rest',
    bodyWeightKg: currentWeight,
  }

  // User-chosen 7-day schedule (starts empty until user chooses)
  const activeWeekSchedule = (activeWeek?.days || []).map((d) => {
    const entry = workoutLogs[d.date]
    const recForDay = d.isToday
      ? computeWorkoutRecommendation(workoutLogs, d.date, captures.find((c) => c.date === d.date)?.sleepHours)
      : null
    return {
      date: d.date,
      day: d.dayName,
      dayShort: d.dayShort,
      dayNumber: d.dayNumber,
      isToday: d.isToday,
      entry,
      recForDay,
    }
  })

  const completedSessionsInWeek = activeWeekSchedule.filter(
    (s) => s.entry && s.entry.splitType !== 'rest' && s.entry.completed
  ).length
  const plannedTrainingInWeek = activeWeekSchedule.filter(
    (s) => s.entry && s.entry.splitType !== 'rest'
  ).length

  // Weekly Progress & Root-Cause Diagnosis (Makan vs Kesibukan/Latihan vs Tidur)
  const elapsedDays = (activeWeek?.days || []).filter((d) => d.date <= todayStr)
  const mealLoggedDays = elapsedDays.filter((d) => meals.some((m) => m.date === d.date))
  const avgWeeklyCal =
    mealLoggedDays.length > 0
      ? Math.round(
          mealLoggedDays.reduce(
            (sum, d) => sum + meals.filter((m) => m.date === d.date).reduce((s, m) => s + m.calories, 0),
            0
          ) / mealLoggedDays.length
        )
      : 0
  const avgWeeklyProt =
    mealLoggedDays.length > 0
      ? Math.round(
          mealLoggedDays.reduce(
            (sum, d) => sum + meals.filter((m) => m.date === d.date).reduce((s, m) => s + m.protein, 0),
            0
          ) / mealLoggedDays.length
        )
      : 0

  const sleepLoggedDays = elapsedDays
    .map((d) => captures.find((c) => c.date === d.date))
    .filter((c): c is DailyCapture => Boolean(c && c.sleepHours && c.sleepHours > 0))
  const avgWeeklySleep =
    sleepLoggedDays.length > 0
      ? Math.round(
          (sleepLoggedDays.reduce((s, c) => s + (c.sleepHours || 0), 0) / sleepLoggedDays.length) * 10
        ) / 10
      : null

  const activeTasksCount = todos.filter((t) => !t.done && t.status !== 'done').length
  const weekDelta =
    thisWeekLog && prevWeekLog
      ? Math.round((thisWeekLog.weightKg - prevWeekLog.weightKg) * 10) / 10
      : null

  const isUnderEating =
    mealLoggedDays.length === 0 ||
    avgWeeklyCal < nutritionTarget.targetCalories * 0.85 ||
    avgWeeklyProt < nutritionTarget.targetProtein * 0.8
  const isLowTraining =
    (elapsedDays.length >= 2 && completedSessionsInWeek === 0) ||
    (elapsedDays.length >= 5 && completedSessionsInWeek <= 1)
  const isSleepLow = avgWeeklySleep !== null && avgWeeklySleep < 6.5

  const handleSetDaySplit = (date: string, split: WorkoutSplitType | null) => {
    const updated = Storage.setWorkoutForDate(date, split)
    setWorkoutLogs(updated)
  }

  const handleToggleDayDone = (date: string) => {
    const updated = Storage.toggleWorkoutCompletedForDate(date)
    setWorkoutLogs(updated)
  }

  const handleResetToCurrentMonth = () => {
    const now = getCurrentYearAndMonth()
    setSelectedYear(now.year)
    setSelectedMonthIndex(now.monthIndex)
    const today = getTodayDateStr()
    const weeks = getWeeksInMonth(now.year, now.monthIndex)
    setSelectedWeekNumber(weeks.find((w) => w.days.some((d) => d.date === today))?.weekNumber ?? 1)
    setSelectedDayOverride(null)
    showToast('Menampilkan bulan & minggu saat ini', 'info')
  }

  // Nutrition Handlers
  const handleAddMeal = (newMeal: Omit<MealLog, 'id'>) => {
    const added = Storage.addMealLog(newMeal)
    setMeals(Storage.getMealLogs())
  }

  const handleUpdateMeal = (id: string, updates: Partial<MealLog>) => {
    const updated = Storage.updateMealLog(id, updates)
    setMeals(updated)
  }

  const handleDeleteMeal = (id: string) => {
    const updated = Storage.deleteMealLog(id)
    setMeals(updated)
  }

  const handleUpdateNutritionTarget = (target: NutritionTarget) => {
    Storage.saveNutritionTarget(target)
    setNutritionTarget(target)
  }

  // Weight Log Handlers
  const handleSaveWeeklyWeight = (e: React.FormEvent) => {
    e.preventDefault()
    const numeric = parseFloat(newWeightInput)
    if (isNaN(numeric) || numeric <= 0) {
      showToast('Masukkan angka berat badan yang valid', 'error')
      return
    }
    const currentWeekLabel = activeWeek?.label || `Minggu ${selectedWeekNumber}`
    const isCurrentWeekActive = (activeWeek?.days || []).some((d) => d.date === todayStr)
    const targetDate = isCurrentWeekActive ? todayStr : activeWeek?.endDate || todayStr
    const updated = Storage.addOrUpdateWeeklyWeight(
      currentWeekLabel,
      numeric,
      'Catatan progresif clean bulk',
      targetDate
    )
    setWeightLogs(updated)
    setProfile(Storage.getUserProfile())
    setNutritionTarget(Storage.getNutritionTarget())
    showToast(`BB ${currentWeekLabel} (${numeric} kg) disimpan — target kalori & protein otomatis disesuaikan!`, 'success')
  }

  const openEditWeightModal = (log: WeeklyWeightLog) => {
    setEditingWeightLog(log)
    setModalWeekLabel(log.weekLabel)
    setModalWeightKg(String(log.weightKg))
    setModalDate(log.date || todayStr)
    setModalNotes(log.notes || '')
    setShowWeightModal(true)
  }

  const openAddWeightModal = () => {
    setEditingWeightLog(null)
    const label = activeWeek?.label || `Minggu ${selectedWeekNumber} (${monthName})`
    const isCurrentWeekActive = (activeWeek?.days || []).some((d) => d.date === todayStr)
    setModalWeekLabel(label)
    setModalWeightKg(String(currentWeight))
    setModalDate(isCurrentWeekActive ? todayStr : activeWeek?.endDate || todayStr)
    setModalNotes('Catatan progresif clean bulk')
    setShowWeightModal(true)
  }

  const handleModalSaveWeight = (e: React.FormEvent) => {
    e.preventDefault()
    const numeric = parseFloat(modalWeightKg)
    if (isNaN(numeric) || numeric <= 0) {
      showToast('Masukkan angka berat badan yang valid', 'error')
      return
    }

    if (editingWeightLog) {
      const updated = Storage.updateWeeklyWeightLog(editingWeightLog.id, {
        weekLabel: modalWeekLabel.trim(),
        weightKg: numeric,
        date: modalDate,
        notes: modalNotes.trim(),
      })
      setWeightLogs(updated)
      setProfile(Storage.getUserProfile())
      setNutritionTarget(Storage.getNutritionTarget())
      showToast(`Data ${modalWeekLabel} berhasil diperbarui!`, 'success')
    } else {
      const updated = Storage.addOrUpdateWeeklyWeight(
        modalWeekLabel.trim(),
        numeric,
        modalNotes.trim(),
        modalDate
      )
      setWeightLogs(updated)
      setProfile(Storage.getUserProfile())
      setNutritionTarget(Storage.getNutritionTarget())
      showToast(`Data ${modalWeekLabel} (${numeric} kg) berhasil ditambahkan!`, 'success')
    }

    setShowWeightModal(false)
  }

  const handleDeleteWeightLog = (id: string, label: string) => {
    setDeleteConfirmWeightLog({ id, label })
  }

  if (!mounted) {
    return (
      <DashboardLayout title="Gym" subtitle="Progressive overload tracker">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Gym & Kebugaran">
      <div className="space-y-6 pb-12">
        {/* Top 4 Stat Cards: BB Sekarang, Target Minggu Ini, Target Bulan Ini, Sesi Minggu Ini */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="BB Saat Ini"
            value={`${currentWeight.toFixed(1)} kg`}
            sublabel={`TB ${profile.heightCm} cm • Target akhir ${targetWeight.toFixed(1)} kg`}
            icon={faWeightScale}
            color="navy"
            trend={
              weekDelta !== null
                ? `${weekDelta >= 0 ? `+${weekDelta}` : weekDelta} kg dari minggu lalu`
                : 'Catat BB tiap minggu untuk ukur progres'
            }
            trendUp={weekDelta === null ? true : weekDelta >= 0}
          />

          <StatCard
            label={weightTargets.weeklyLabel}
            value={weightTargets.weeklyHasData ? `${weightTargets.weeklyTargetKg.toFixed(1)} kg` : '—'}
            sublabel={weightTargets.weeklySublabel}
            icon={faArrowTrendUp}
            color={weightTargets.weeklyAchieved ? 'sage' : 'info'}
            trend={weightTargets.weeklyTrend}
            trendUp={weightTargets.weeklyAchieved}
          />

          <StatCard
            label={weightTargets.monthlyLabel}
            value={weightTargets.monthlyHasData ? `${weightTargets.monthlyTargetKg.toFixed(1)} kg` : '—'}
            sublabel={weightTargets.monthlySublabel}
            icon={faChartLine}
            color={weightTargets.monthlyAchieved ? 'sage' : 'navy'}
            trend={weightTargets.monthlyTrend}
            trendUp={true}
          />

          <StatCard
            label="Latihan Minggu Ini"
            value={`${completedSessionsInWeek} Selesai`}
            sublabel={
              plannedTrainingInWeek > 0
                ? `${plannedTrainingInWeek} hari dipilih latihan`
                : 'Jadwal minggu ini masih kosong'
            }
            icon={faFire}
            color={completedSessionsInWeek >= 3 ? 'sage' : 'warning'}
            trend={
              completedSessionsInWeek >= 3
                ? 'Frekuensi latihan bagus'
                : 'Pilih jadwal latihan sendiri di bawah'
            }
            trendUp={completedSessionsInWeek >= 3}
          />
        </div>

        {/* Unified Period Navigation Bar */}
        <PeriodFilterBar
          periodMode={periodMode}
          onPeriodModeChange={setPeriodMode}
          selectedYear={selectedYear}
          onYearChange={(y) => {
            setSelectedYear(y)
            setSelectedWeekNumber(1)
            setSelectedDayOverride(null)
          }}
          selectedMonthIndex={selectedMonthIndex}
          onMonthChange={(m) => {
            setSelectedMonthIndex(m)
            setSelectedWeekNumber(1)
            setSelectedDayOverride(null)
          }}
          onResetToCurrentMonth={handleResetToCurrentMonth}
          selectedWeekNumber={selectedWeekNumber}
          onWeekChange={(w) => {
            setSelectedWeekNumber(w)
            setSelectedDayOverride(null)
          }}
          activePeriodLabel={
            periodMode === 'today'
              ? `Hari Ini (${todayStr})`
              : periodMode === 'monthly'
              ? `${monthName} ${selectedYear}`
              : `${activeWeek?.label || ''} (${selectedYear})`
          }
          badgeText={`${completedSessionsInWeek} Sesi Selesai`}
        />

        {/* Evaluasi Progress BB Minggu Ini & Diagnosis Penyebab Otomatis */}
        <Card className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
            <div>
              <h3 className="text-body sm:text-h4 font-heading font-bold text-navy">
                Evaluasi Progress BB Minggu Ini: Ada Kenaikan atau Kenapa Stagnan?
              </h3>
              <p className="text-caption text-slate">
                Cek otomatis dari data nyata minggu ini: apakah kurang makan, terlalu sibuk / jarang latihan, atau kurang tidur
              </p>
            </div>
            <Badge
              variant={
                weekDelta !== null && weekDelta >= 0.2
                  ? 'success'
                  : weekDelta !== null && weekDelta < 0
                  ? 'error'
                  : 'warning'
              }
            >
              {!thisWeekLog
                ? 'Belum Timbang Minggu Ini'
                : weekDelta === null
                ? `BB Tercatat: ${thisWeekLog.weightKg.toFixed(1)} kg`
                : weekDelta >= 0.2
                ? `Naik +${weekDelta.toFixed(1)} kg (Progres!)`
                : weekDelta > 0
                ? `Naik Tipis +${weekDelta.toFixed(1)} kg`
                : weekDelta === 0
                ? 'Stagnan (0.0 kg)'
                : `Turun ${weekDelta.toFixed(1)} kg`}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Diagnosis 1: Makan / Nutrisi */}
            <div
              className={`p-3.5 rounded-xl border ${
                isUnderEating
                  ? 'bg-rose-50/60 border-rose-200'
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon
                  icon={isUnderEating ? faCircleExclamation : faCircleCheck}
                  className={isUnderEating ? 'text-rose-600 text-xs' : 'text-emerald-600 text-xs'}
                />
                <span className="text-caption font-heading font-bold text-navy">
                  1. Faktor Makan & Kalori
                </span>
              </div>
              <p className="text-[12px] text-slate-700 leading-relaxed">
                {mealLoggedDays.length === 0 ? (
                  <>
                    <strong>Makan belum dicatat minggu ini (0 hari).</strong> Catat makan di bawah supaya ketahuan apakah kalori harian ({nutritionTarget.targetCalories.toLocaleString('id-ID')} kkal) sudah tercapai atau masih kurang makan.
                  </>
                ) : avgWeeklyCal < nutritionTarget.targetCalories * 0.85 ? (
                  <>
                    <strong>Indikasi Kurang Makan:</strong> Rata-rata baru <strong>{avgWeeklyCal.toLocaleString('id-ID')} kkal/hari</strong> ({mealLoggedDays.length} hari tercatat), masih kurang { (nutritionTarget.targetCalories - avgWeeklyCal).toLocaleString('id-ID') } kkal dari target {nutritionTarget.targetCalories.toLocaleString('id-ID')} kkal.
                  </>
                ) : avgWeeklyProt < nutritionTarget.targetProtein * 0.8 ? (
                  <>
                    <strong>Kalori masuk, tapi Protein kurang:</strong> Rata-rata protein <strong>{avgWeeklyProt}g/hari</strong> dari target {nutritionTarget.targetProtein}g.
                  </>
                ) : (
                  <>
                    <strong>Asupan Makan Cukup:</strong> Rata-rata <strong>{avgWeeklyCal.toLocaleString('id-ID')} kkal</strong> & <strong>{avgWeeklyProt}g protein</strong>/hari ({mealLoggedDays.length} hari tercatat).
                  </>
                )}
              </p>
            </div>

            {/* Diagnosis 2: Latihan & Kesibukan */}
            <div
              className={`p-3.5 rounded-xl border ${
                isLowTraining
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon
                  icon={isLowTraining ? faBriefcase : faCircleCheck}
                  className={isLowTraining ? 'text-amber-600 text-xs' : 'text-emerald-600 text-xs'}
                />
                <span className="text-caption font-heading font-bold text-navy">
                  2. Faktor Latihan & Kesibukan
                </span>
              </div>
              <p className="text-[12px] text-slate-700 leading-relaxed">
                {completedSessionsInWeek === 0 ? (
                  <>
                    <strong>Belum ada sesi latihan selesai minggu ini.</strong>{' '}
                    {activeTasksCount >= 3
                      ? `Tercatat ada ${activeTasksCount} tugas aktif yang belum beres — kemungkinan terlalu sibuk sampai jadwal gym kelewat.`
                      : 'Pilih jadwal Push/Pull/Legs saat ada waktu luang agar surplus kalori jadi otot.'}
                  </>
                ) : isLowTraining ? (
                  <>
                    <strong>Latihan masih minim ({completedSessionsInWeek} sesi selesai).</strong>{' '}
                    {activeTasksCount >= 3
                      ? `Beban ${activeTasksCount} tugas aktif mungkin menyita waktu latihan.`
                      : 'Usahakan minimal 3–4 sesi per minggu.'}
                  </>
                ) : (
                  <>
                    <strong>Latihan Terjaga:</strong> Sudah <strong>{completedSessionsInWeek} sesi latihan</strong> selesai minggu ini. Stimulus otot aman.
                  </>
                )}
              </p>
            </div>

            {/* Diagnosis 3: Tidur & Pemulihan */}
            <div
              className={`p-3.5 rounded-xl border ${
                isSleepLow
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-slate-50 border-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <FontAwesomeIcon
                  icon={faBed}
                  className={isSleepLow ? 'text-amber-600 text-xs' : 'text-navy text-xs'}
                />
                <span className="text-caption font-heading font-bold text-navy">
                  3. Faktor Tidur & Recovery
                </span>
              </div>
              <p className="text-[12px] text-slate-700 leading-relaxed">
                {avgWeeklySleep === null ? (
                  <>
                    Belum ada catatan tidur minggu ini. Tidur ideal ≥7 jam membantu hormon pertumbuhan & nafsu makan bulking.
                  </>
                ) : isSleepLow ? (
                  <>
                    <strong>Kurang Istirahat:</strong> Rata-rata tidur <strong>{avgWeeklySleep} jam/malam</strong> (&lt;6.5 jam). Begadang/sibuk malam bikin recovery otot & nafsu makan turun.
                  </>
                ) : (
                  <>
                    <strong>Istirahat Cukup:</strong> Rata-rata tidur <strong>{avgWeeklySleep} jam/malam</strong> ({sleepLoggedDays.length} malam tercatat).
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Clean Bulking Nutrition & Meal/Snack Tracker */}
        <NutritionBulkingWidget
          selectedDate={effectiveDate}
          meals={meals}
          nutritionTarget={nutritionTarget}
          onAddMeal={handleAddMeal}
          onUpdateMeal={handleUpdateMeal}
          onDeleteMeal={handleDeleteMeal}
          onUpdateTarget={handleUpdateNutritionTarget}
        />

        {/* User-Chosen Workout Picker & Recommendation */}
        <GymWidget
          session={activeSession}
          selectedDate={effectiveDate}
          recommendation={activeRecommendation}
          onSelectSplit={(split) => handleSetDaySplit(effectiveDate, split)}
          onToggleCompleted={() => handleToggleDayDone(effectiveDate)}
        />

        {/* 1. 7-Day User-Controlled Schedule (Starts Empty Until Chosen) */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-navy text-white flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faCalendar} className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-body font-heading font-bold text-navy">
                  Kalender Latihan {activeWeek?.label} (Pilih Sendiri)
                </h3>
                <span className="text-caption text-slate">
                  Semua hari kosong dulu — klik Push / Pull / Legs / Rest sesuai keputusanmu
                </span>
              </div>
            </div>

            <Badge variant="default" className="self-start sm:self-auto font-mono text-caption">
              {completedSessionsInWeek} Sesi Selesai
            </Badge>
          </div>

          <div className="space-y-2">
            {activeWeekSchedule.map((item) => {
              const isSelectedDay = item.date === effectiveDate
              const split = item.entry?.splitType
              const isDone = Boolean(item.entry?.completed && split && split !== 'rest')
              const isRest = split === 'rest'

              return (
                <div
                  key={item.date}
                  onClick={() => setSelectedDayOverride(item.date)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border text-body-sm transition-all cursor-pointer ${
                    isSelectedDay
                      ? 'ring-2 ring-navy/30 bg-navy/5 border-navy'
                      : isDone
                      ? 'bg-emerald-50/70 text-navy border-emerald-300'
                      : isRest
                      ? 'bg-amber-50/40 text-slate border-amber-200'
                      : 'bg-surface text-navy border-border hover:border-slate/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-24 shrink-0">
                      <span className="font-mono font-bold text-caption block text-navy">
                        {item.day}, {item.dayNumber} {monthName.slice(0, 3)}
                      </span>
                      {item.isToday && (
                        <span className="inline-block text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-navy text-white mt-0.5">
                          Hari Ini
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className={`wrap-break-word font-medium block ${!split ? 'text-slate italic' : 'text-navy font-semibold'}`}>
                        {split ? SPLIT_NAMES[split] : 'Belum dipilih (Kosong)'}
                      </span>
                      {!split && item.recForDay && (
                        <span className="text-[11px] text-indigo-700 font-medium block">
                          Saran hari ini: {SPLIT_NAMES[item.recForDay.split]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick 1-Tap Controls per Day */}
                  <div
                    className="flex items-center gap-1 flex-wrap shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(['push', 'pull', 'legs', 'rest'] as const).map((sp) => {
                      const active = split === sp
                      return (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => handleSetDaySplit(item.date, active ? null : sp)}
                          className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                            active
                              ? sp === 'rest'
                                ? 'bg-amber-600 text-white'
                                : 'bg-navy text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title={active ? 'Klik lagi untuk kosongkan' : `Pilih ${sp.toUpperCase()}`}
                        >
                          {sp === 'push' ? 'Push' : sp === 'pull' ? 'Pull' : sp === 'legs' ? 'Legs' : 'Rest'}
                        </button>
                      )
                    })}

                    {split && split !== 'rest' && (
                      <button
                        type="button"
                        onClick={() => handleToggleDayDone(item.date)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-border text-navy hover:bg-emerald-50'
                        }`}
                      >
                        <FontAwesomeIcon icon={faCheck} className="text-[9px]" />
                        <span>{isDone ? 'Selesai' : 'Tandai Selesai'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* 2. Weekly Body Weight Progression & Monthly Target Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faWeightScale} className="h-4 w-4 text-navy" />
                </div>
                <div>
                  <h3 className="text-body font-heading font-bold text-navy">
                    Log Berat Badan Mingguan
                  </h3>
                  <span className="text-caption text-slate">
                    Pantau & ubah BB per minggu menuju target 68 kg
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={openAddWeightModal}
                className="h-8 px-2.5 rounded-lg border border-border bg-white hover:bg-slate-100 text-navy text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Tambah catatan riwayat minggu lain"
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
                <span>Tambah Log</span>
              </button>
            </div>

            {/* Quick Record Weight Form */}
            <form
              onSubmit={handleSaveWeeklyWeight}
              className="p-3.5 mb-4 rounded-xl bg-slate-50 border border-border flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <label className="text-[11px] font-bold uppercase text-slate block mb-1">
                  Catat BB {activeWeek?.label.split('(')[0].trim() || 'Minggu Ini'} (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeightInput}
                  onChange={(e) => setNewWeightInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                  placeholder="57.8"
                />
              </div>
              <button
                type="submit"
                className="h-10 mt-5 px-4 rounded-xl bg-navy text-white hover:bg-navy-hover font-heading font-bold text-caption active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Simpan BB
              </button>
            </form>

            {/* List of Weekly Weights */}
            <div className="space-y-2">
              {weightLogs.map((log, idx) => {
                const prev = idx > 0 ? weightLogs[idx - 1] : null
                const diff = prev ? (log.weightKg - prev.weightKg).toFixed(1) : null

                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:border-slate/40 transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-body-sm font-heading font-bold text-navy">
                          {log.weekLabel}
                        </span>
                        {log.date && (
                          <span className="text-[10px] text-slate font-mono bg-slate-100 px-1.5 py-0.2 rounded">
                            {log.date}
                          </span>
                        )}
                      </div>
                      <span className="text-caption text-slate block wrap-break-word mt-0.5">
                        {log.notes || 'Catatan progresif clean bulk'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-body font-mono font-bold text-navy block tabular-nums">
                          {log.weightKg.toFixed(1)} kg
                        </span>
                        {diff && (
                          <span
                            className={`text-[11px] font-mono font-semibold ${
                              Number(diff) >= 0 ? 'text-sage' : 'text-red-600'
                            }`}
                          >
                            {Number(diff) >= 0 ? `+${diff}` : diff} kg
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditWeightModal(log)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                          title="Ubah data berat badan & tanggal minggu ini"
                          aria-label="Edit log berat badan"
                        >
                          <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWeightLog(log.id, log.weekLabel)}
                          className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus log minggu ini"
                          aria-label="Hapus log berat badan"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* 3. Monthly BB Target & Clean Bulk Roadmap */}
          <Card>
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-sage/10 text-sage flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faTrophy} className="h-4 w-4 text-sage" />
                </div>
                <div>
                  <h3 className="text-body font-heading font-bold text-navy">
                    Target Kenaikan BB Mingguan & Bulanan
                  </h3>
                  <span className="text-caption text-slate">
                    Patokan dari BB saat ini ({currentWeight.toFixed(1)} kg) menuju {targetWeight.toFixed(1)} kg
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-heading font-bold text-navy px-2.5 py-1 bg-slate-100 border border-border rounded-lg shrink-0">
                {monthName} {selectedYear}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-[11px] text-slate block uppercase font-medium">
                  {weightTargets.weeklyLabel}
                </span>
                <span className="text-h3 font-bold text-navy font-mono block mt-0.5">
                  {weightTargets.weeklyHasData ? `${weightTargets.weeklyTargetKg.toFixed(1)} kg` : '—'}
                </span>
                <span className="text-[11px] text-slate font-mono block wrap-break-word">
                  {weightTargets.weeklySublabel}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-[11px] text-slate block uppercase font-medium">
                  {weightTargets.monthlyLabel}
                </span>
                <span className="text-h3 font-bold text-navy font-mono block mt-0.5">
                  {weightTargets.monthlyHasData ? `${weightTargets.monthlyTargetKg.toFixed(1)} kg` : '—'}
                </span>
                <span className="text-[11px] text-slate font-mono block wrap-break-word">
                  {weightTargets.monthlySublabel}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-[11px] text-slate block uppercase font-medium">
                  Kalori Harian (BB {currentWeight.toFixed(1)} kg)
                </span>
                <span className="text-body-lg font-bold text-amber-700 font-mono block mt-0.5">
                  {nutritionTarget.targetCalories.toLocaleString('id-ID')} kkal
                </span>
                <span className="text-[11px] text-slate font-mono block">
                  Surplus +{surplus} kkal/hari
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-border">
                <span className="text-[11px] text-slate block uppercase font-medium">
                  Protein Harian (2g/kg BB)
                </span>
                <span className="text-body-lg font-bold text-blue-700 font-mono block mt-0.5">
                  {nutritionTarget.targetProtein}g
                </span>
                <span className="text-[11px] text-slate font-mono block">
                  Menyesuaikan BB {currentWeight.toFixed(1)} kg
                </span>
              </div>
            </div>

            {weightTargets.endOfMonthNote && (
              <p className="text-caption text-indigo-900 bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 leading-relaxed mb-3">
                {weightTargets.endOfMonthNote}
              </p>
            )}

            <p className="text-caption text-slate bg-slate-50 p-3 rounded-xl border border-border leading-relaxed">
              Dengan laju clean bulk <strong>+{weeklyGainRate} kg/7 hari</strong> (~+{monthlyFullRate} kg/30 hari), estimasi waktu dari <strong>{currentWeight.toFixed(1)} kg</strong> ke <strong>{targetWeight.toFixed(1)} kg</strong> sekitar{' '}
              <strong>
                {currentWeight >= targetWeight
                  ? 'Target Tercapai!'
                  : `${Math.ceil((targetWeight - currentWeight) / monthlyFullRate)} bulan`}
              </strong>
              . Target mingguan & bulanan dihitung proporsional mengikuti sisa hari pada kalender.
            </p>
          </Card>
        </div>
      </div>

      {/* Edit / Add Weight Log Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowWeightModal(false)}
          />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faWeightScale} className="h-4 w-4 text-navy" />
                <h3 className="text-h4 font-heading font-bold text-navy">
                  {editingWeightLog ? 'Ubah Log Berat Badan' : 'Tambah Log Riwayat BB'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowWeightModal(false)}
                className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleModalSaveWeight} className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Label Periode / Minggu
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Minggu 1 (6 - 12 Okt)"
                  value={modalWeekLabel}
                  onChange={(e) => setModalWeekLabel(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Tanggal Pencatatan (Bisa Pilih Tanggal Lewat)
                </label>
                <input
                  type="date"
                  required
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface font-mono text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Berat Badan (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="57.8"
                  value={modalWeightKg}
                  onChange={(e) => setModalWeightKg(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface font-mono font-bold text-body text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Catatan Progresif / Evaluasi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Surplus konsisten, protein 115g tercapai"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 rounded-lg text-body-sm text-slate hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-navy text-white hover:bg-navy-hover font-semibold text-body-sm cursor-pointer"
                >
                  {editingWeightLog ? 'Simpan Perubahan' : 'Tambah Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Weight Log Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmWeightLog}
        onClose={() => setDeleteConfirmWeightLog(null)}
        onConfirm={() => {
          if (deleteConfirmWeightLog) {
            const updated = Storage.deleteWeeklyWeightLog(deleteConfirmWeightLog.id)
            setWeightLogs(updated)
            setProfile(Storage.getUserProfile())
            setNutritionTarget(Storage.getNutritionTarget())
            showToast(`Log ${deleteConfirmWeightLog.label} berhasil dihapus`, 'info')
          }
        }}
        title="Hapus Log Berat Badan"
        message={`Yakin ingin menghapus catatan berat badan "${deleteConfirmWeightLog?.label}"? Data riwayat ini akan dihapus permanen.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </DashboardLayout>
  )
}
