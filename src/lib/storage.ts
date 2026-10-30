import type {
  DailyCapture,
  PrayerStatus,
  Transaction,
  BudgetCategory,
  WorkoutSession,
  Habit,
  NotionNote,
  TodoItem,
  UserProfile,
  WeeklyWeightLog,
  WorkoutSplitType,
  ExerciseItem,
  SavingsGoal,
  PrayerName,
  MealLog,
  NutritionTarget,
  TaskFlowStatus,
  FinancialAccount,
  DailyWorkoutLog,
} from '@/types'
import { MONTH_NAMES_ID, getTotalDaysInMonth } from '@/lib/dateUtils'

const getTodayDateStr = () => {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export function calculateHabitStreak(
  history: Record<string, boolean> = {},
  todayStr: string = getTodayDateStr()
): number {
  if (!history || typeof history !== 'object') return 0

  const [y, m, d] = todayStr.split('-').map(Number)
  if (!y || !m || !d) return 0

  // Set to noon to avoid DST/time boundary shifts
  const cursor = new Date(y, m - 1, d, 12, 0, 0)
  let streak = 0

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const isTodayDone = Boolean(history[todayStr])
  if (isTodayDone) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  } else {
    // Today not yet complete, check consecutive days starting from yesterday
    cursor.setDate(cursor.getDate() - 1)
  }

  // Count backwards up to 365 days
  for (let i = 0; i < 365; i++) {
    const prevDateStr = formatDate(cursor)
    if (Boolean(history[prevDateStr])) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// Initial seed data - clean empty slate
const initialTodos: TodoItem[] = []

const initialDailyCaptures: DailyCapture[] = []

const initialPrayerStatus: PrayerStatus = {
  date: '',
  prayers: {
    subuh: false,
    dzuhur: false,
    ashar: false,
    maghrib: false,
    isya: false,
  },
  streak: 0,
}

const initialTransactions: Transaction[] = []

const initialAccounts: FinancialAccount[] = [
  {
    id: 'acc-cash',
    name: 'Cash Fisik (Dompet)',
    type: 'cash',
    balance: 0,
    notes: 'Uang tunai',
    color: 'emerald',
  },
  {
    id: 'acc-jago',
    name: 'Bank Jago',
    type: 'bank',
    balance: 2000000,
    targetAmount: 20000000,
    goalTitle: 'Tabungan Motor',
    notes: 'Disimpan di Kantong Jago',
    color: 'sky',
  },
  {
    id: 'acc-bibit',
    name: 'Bibit',
    type: 'investment',
    balance: 1000000,
    targetAmount: 10000000,
    goalTitle: 'Dana Darurat',
    notes: 'Reksa Dana Pasar Uang',
    color: 'amber',
  },
  {
    id: 'acc-bsi',
    name: 'Bank BSI',
    type: 'bank',
    balance: 0,
    notes: 'Rekening BSI',
    color: 'teal',
  },
  {
    id: 'acc-seabank',
    name: 'SeaBank',
    type: 'bank',
    balance: 0,
    notes: 'Rekening SeaBank',
    color: 'indigo',
  },
]

const initialBudgetCategories: BudgetCategory[] = [
  {
    id: 'b-1',
    name: 'Makanan & Nutrisi',
    spent: 0,
    limit: 1100000,
    icon: 'Coffee',
    color: 'sage',
  },
  {
    id: 'b-2',
    name: 'Belanja Pokok & Protein',
    spent: 0,
    limit: 500000,
    icon: 'ShoppingCart',
    color: 'info',
  },
  {
    id: 'b-3',
    name: 'Gym, Suplemen & Nutrisi',
    spent: 0,
    limit: 300000,
    icon: 'Dumbbell',
    color: 'navy',
  },
  {
    id: 'b-4',
    name: 'Transport & Kendaraan',
    spent: 0,
    limit: 250000,
    icon: 'Car',
    color: 'warning',
  },
  {
    id: 'b-5',
    name: 'Hiburan & Refreshing',
    spent: 0,
    limit: 200000,
    icon: 'Film',
    color: 'info',
  },
  {
    id: 'b-6',
    name: 'Upgrade Diri & Kreatif',
    spent: 0,
    limit: 200000,
    icon: 'Sparkles',
    color: 'sage',
  },
]

const initialSavingsGoals: SavingsGoal[] = [
  {
    id: 'sg-bibit',
    title: 'Dana Darurat (Bibit)',
    target: 10000000,
    current: 1000000,
    color: 'amber',
  },
  {
    id: 'sg-jago',
    title: 'Tabungan Motor (Bank Jago)',
    target: 20000000,
    current: 2000000,
    color: 'navy',
  },
]

export function calculateNutritionFromBiometrics(
  heightCm: number,
  weightKg: number,
  surplus = 350
): NutritionTarget {
  const h = Number(heightCm) > 0 ? Number(heightCm) : 168
  const w = Number(weightKg) > 0 ? Number(weightKg) : 57.8
  // Mifflin-St Jeor formula for BMR (male, age ~24): 10*W + 6.25*H - 5*24 + 5
  const bmr = 10 * w + 6.25 * h - 5 * 24 + 5
  // Active gym bulking training TDEE factor ~ 1.45
  const tdee = Math.round(bmr * 1.45)
  // Clean bulking surplus (default +350 kcal)
  const targetCalories = Math.round(tdee + surplus)
  // Clean bulking protein target: 2.0g per kg BB
  const targetProtein = Math.round(w * 2.0)
  return {
    targetCalories,
    targetProtein,
  }
}

const initialNutritionTarget: NutritionTarget = calculateNutritionFromBiometrics(168, 57.8)

const initialMealLogs: MealLog[] = []

export const PPL_PRESETS: Record<WorkoutSplitType, { splitName: string; exercises: ExerciseItem[] }> = {
  push: {
    splitName: 'Push Day (Dada, Bahu Depan/Samping & Triceps)',
    exercises: [
      {
        id: 'ex-push-1',
        name: 'Flat Barbell Bench Press',
        targetSets: 4,
        sets: [
          { setNumber: 1, reps: 10, weightKg: 40, done: false },
          { setNumber: 2, reps: 8, weightKg: 45, done: false },
          { setNumber: 3, reps: 6, weightKg: 50, done: false },
          { setNumber: 4, reps: 8, weightKg: 42.5, done: false },
        ],
      },
      {
        id: 'ex-push-2',
        name: 'Incline Dumbbell Press (30°)',
        targetSets: 3,
        sets: [
          { setNumber: 1, reps: 10, weightKg: 14, done: false },
          { setNumber: 2, reps: 10, weightKg: 16, done: false },
          { setNumber: 3, reps: 8, weightKg: 16, done: false },
        ],
      },
      {
        id: 'ex-push-3',
        name: 'Cable Lateral Raises',
        targetSets: 4,
        sets: [
          { setNumber: 1, reps: 15, weightKg: 7.5, done: false },
          { setNumber: 2, reps: 12, weightKg: 8.5, done: false },
          { setNumber: 3, reps: 12, weightKg: 8.5, done: false },
          { setNumber: 4, reps: 15, weightKg: 7.5, done: false },
        ],
      },
      {
        id: 'ex-push-4',
        name: 'Tricep Rope Overhead Extension',
        targetSets: 3,
        sets: [
          { setNumber: 1, reps: 12, weightKg: 15, done: false },
          { setNumber: 2, reps: 12, weightKg: 17.5, done: false },
          { setNumber: 3, reps: 10, weightKg: 17.5, done: false },
        ],
      },
    ],
  },
  pull: {
    splitName: 'Pull Day (Punggung, Traps & Biceps)',
    exercises: [
      {
        id: 'ex-pull-1',
        name: 'Lat Pulldown Wide Grip',
        targetSets: 4,
        sets: [
          { setNumber: 1, reps: 12, weightKg: 35, done: false },
          { setNumber: 2, reps: 10, weightKg: 40, done: false },
          { setNumber: 3, reps: 8, weightKg: 45, done: false },
          { setNumber: 4, reps: 10, weightKg: 40, done: false },
        ],
      },
      {
        id: 'ex-pull-2',
        name: 'Barbell Bent-Over Row',
        targetSets: 4,
        sets: [
          { setNumber: 1, reps: 10, weightKg: 40, done: false },
          { setNumber: 2, reps: 8, weightKg: 45, done: false },
          { setNumber: 3, reps: 8, weightKg: 45, done: false },
          { setNumber: 4, reps: 8, weightKg: 40, done: false },
        ],
      },
      {
        id: 'ex-pull-3',
        name: 'Face Pull Cable',
        targetSets: 3,
        sets: [
          { setNumber: 1, reps: 15, weightKg: 12.5, done: false },
          { setNumber: 2, reps: 15, weightKg: 15, done: false },
          { setNumber: 3, reps: 12, weightKg: 15, done: false },
        ],
      },
      {
        id: 'ex-pull-4',
        name: 'Incline Dumbbell Bicep Curl',
        targetSets: 3,
        sets: [
          { setNumber: 1, reps: 12, weightKg: 10, done: false },
          { setNumber: 2, reps: 10, weightKg: 12, done: false },
          { setNumber: 3, reps: 8, weightKg: 12, done: false },
        ],
      },
    ],
  },
  legs: {
    splitName: 'Legs Day (Quad, Hamstring, Calves & Core)',
    exercises: [
      {
        id: 'ex-legs-1',
        name: 'Barbell Back Squat',
        targetSets: 4,
        sets: [
          { setNumber: 1, reps: 10, weightKg: 50, done: false },
          { setNumber: 2, reps: 8, weightKg: 60, done: false },
          { setNumber: 3, reps: 6, weightKg: 70, done: false },
          { setNumber: 4, reps: 8, weightKg: 60, done: false },
        ],
      },
      {
        id: 'ex-legs-2',
        name: 'Romanian Deadlift (RDL)',
        targetSets: 3,
        sets: [
          { setNumber: 1, reps: 10, weightKg: 50, done: false },
          { setNumber: 2, reps: 10, weightKg: 55, done: false },
          { setNumber: 3, reps: 8, weightKg: 60, done: false },
        ],
      },
      {
        id: 'ex-legs-3',
        name: 'Leg Extension Machine',
        targetSets: 3,
        sets: [
          { setNumber: 1, reps: 15, weightKg: 30, done: false },
          { setNumber: 2, reps: 12, weightKg: 35, done: false },
          { setNumber: 3, reps: 12, weightKg: 35, done: false },
        ],
      },
      {
        id: 'ex-legs-4',
        name: 'Standing Calf Raises',
        targetSets: 4,
        sets: [
          { setNumber: 1, reps: 15, weightKg: 40, done: false },
          { setNumber: 2, reps: 15, weightKg: 45, done: false },
          { setNumber: 3, reps: 15, weightKg: 45, done: false },
          { setNumber: 4, reps: 15, weightKg: 40, done: false },
        ],
      },
    ],
  },
  rest: {
    splitName: 'Rest & Recovery Day (Istirahat)',
    exercises: [],
  },
}

const initialWeeklyWeightLogs: WeeklyWeightLog[] = []

export const SPLIT_NAMES: Record<WorkoutSplitType, string> = {
  push: 'Push Day (Dada, Bahu & Triceps)',
  pull: 'Pull Day (Punggung & Biceps)',
  legs: 'Legs Day (Kaki & Core)',
  rest: 'Rest Day (Istirahat & Pemulihan Otot)',
}

export function computeWorkoutRecommendation(
  logs: Record<string, DailyWorkoutLog>,
  targetDate: string,
  sleepHours?: number
): { split: WorkoutSplitType; title: string; reason: string } {
  const [y, m, d] = targetDate.split('-').map(Number)
  const base = y && m && d ? new Date(y, m - 1, d, 12, 0, 0) : new Date()
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`

  let consecutiveTraining = 0
  for (let i = 1; i <= 7; i++) {
    const prev = new Date(base)
    prev.setDate(base.getDate() - i)
    const entry = logs[fmt(prev)]
    if (entry && entry.splitType !== 'rest') {
      consecutiveTraining++
    } else {
      break
    }
  }

  let lastNonRest: WorkoutSplitType | null = null
  for (let i = 1; i <= 21; i++) {
    const prev = new Date(base)
    prev.setDate(base.getDate() - i)
    const entry = logs[fmt(prev)]
    if (entry && entry.splitType !== 'rest') {
      lastNonRest = entry.splitType
      break
    }
  }

  if (consecutiveTraining >= 3) {
    return {
      split: 'rest',
      title: SPLIT_NAMES.rest,
      reason: `Sudah latihan ${consecutiveTraining} hari beruntun. Istirahat hari ini agar otot pulih & berkembang.`,
    }
  }

  if (sleepHours !== undefined && sleepHours > 0 && sleepHours < 5.5) {
    return {
      split: 'rest',
      title: SPLIT_NAMES.rest,
      reason: `Tidur tercatat ${sleepHours} jam (<5.5 jam). Disarankan recovery dulu atau latihan ringan.`,
    }
  }

  if (lastNonRest === 'push') {
    return {
      split: 'pull',
      title: SPLIT_NAMES.pull,
      reason: 'Sesi terakhir Push Day, giliran Pull Day (Punggung & Biceps) agar proporsional.',
    }
  }
  if (lastNonRest === 'pull') {
    return {
      split: 'legs',
      title: SPLIT_NAMES.legs,
      reason: 'Sesi terakhir Pull Day, giliran Legs Day (Kaki & Core).',
    }
  }
  if (lastNonRest === 'legs') {
    return {
      split: 'push',
      title: SPLIT_NAMES.push,
      reason: 'Sesi terakhir Legs Day, rotasi kembali ke Push Day (Dada, Bahu & Triceps).',
    }
  }

  return {
    split: 'push',
    title: SPLIT_NAMES.push,
    reason: 'Belum ada riwayat sesi sebelumnya, mulai siklus dari Push Day (Dada, Bahu & Triceps).',
  }
}

export interface WeightTargetSummary {
  weeklyGainRate: number
  monthlyFullRate: number
  weeklyHasData: boolean
  weeklyLabel: string
  weeklyTargetKg: number
  weeklySublabel: string
  weeklyTrend: string
  weeklyAchieved: boolean
  monthlyHasData: boolean
  monthlyLabel: string
  monthlyTargetKg: number
  monthlySublabel: string
  monthlyTrend: string
  monthlyAchieved: boolean
  endOfMonthNote?: string
}

export function computeDateAwareWeightTargets(params: {
  weightLogs: WeeklyWeightLog[]
  currentWeight: number
  targetWeight: number
  surplus: number
  todayStr: string
  weekNumber: number
  weekStartStr: string
  weekEndStr: string
  selectedYear: number
  selectedMonthIndex: number
}): WeightTargetSummary {
  const {
    weightLogs,
    currentWeight,
    targetWeight,
    surplus,
    todayStr,
    weekNumber,
    weekStartStr,
    weekEndStr,
    selectedYear,
    selectedMonthIndex,
  } = params

  const parseUtc = (s: string) => {
    const [y, m, d] = s.split('-').map(Number)
    return Date.UTC(y || 2026, (m || 1) - 1, d || 1)
  }
  const diffDays = (from: string, to: string) =>
    Math.round((parseUtc(to) - parseUtc(from)) / 86400000)
  const addDays = (s: string, n: number) => {
    const dt = new Date(parseUtc(s) + n * 86400000)
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`
  }
  const fmtShort = (s: string) => {
    const [, m, d] = s.split('-').map(Number)
    return `${d} ${MONTH_NAMES_ID[(m || 1) - 1].slice(0, 3)}`
  }

  // ponytail: linear daily gain (weeklyGainRate/7); upgrade to adaptive TDEE curve when multi-year history needed
  const weeklyGainRate = Math.max(0.2, Math.round(((surplus * 7) / 7700) * 10) / 10)
  const dailyRate = weeklyGainRate / 7
  const monthlyFullRate = Math.round(dailyRate * 30 * 10) / 10

  const calc = (baseKg: number, days: number) => {
    const targetKg = Math.min(
      targetWeight,
      Math.round((baseKg + Math.max(0, days) * dailyRate) * 10) / 10
    )
    const deltaKg = Math.max(0, Math.round((targetKg - baseKg) * 10) / 10)
    return { targetKg, deltaKg }
  }

  const validLogs = [...weightLogs]
    .filter((l) => Boolean(l.date))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))

  // 1. Weekly Target
  let weeklyHasData = true
  let weeklyLabel = `Target Minggu ${weekNumber}`
  let weeklyTargetKg = currentWeight
  let weeklySublabel = ''
  let weeklyTrend = ''
  let weeklyAchieved = false

  if (weekEndStr < todayStr) {
    const recentBefore = validLogs
      .filter((l) => l.date! < weekStartStr && diffDays(l.date!, weekStartStr) <= 14)
      .at(-1)
    const inWeek = validLogs.filter((l) => l.date! >= weekStartStr && l.date! <= weekEndStr)
    const anchor = recentBefore || inWeek[0]
    if (!anchor) {
      weeklyHasData = false
      weeklyLabel = `Target Minggu ${weekNumber} (${fmtShort(weekEndStr)})`
      weeklySublabel = 'Belum ada catatan BB pada minggu ini'
      weeklyTrend = 'Periode lewat tanpa log BB'
    } else {
      const days = Math.max(1, diffDays(anchor.date!, weekEndStr))
      const { targetKg, deltaKg } = calc(anchor.weightKg, days)
      const actualKg = (inWeek.at(-1) || anchor).weightKg
      weeklyTargetKg = targetKg
      weeklyAchieved = actualKg >= targetKg
      weeklyLabel = `Target Minggu ${weekNumber} (${fmtShort(weekEndStr)})`
      weeklySublabel = `Dari ${anchor.weightKg.toFixed(1)} kg (${fmtShort(anchor.date!)}) • +${deltaKg.toFixed(1)} kg (${days} hari)`
      weeklyTrend = weeklyAchieved
        ? `Tercapai (${actualKg.toFixed(1)} kg)`
        : `Tercatat ${actualKg.toFixed(1)} kg (kurang +${(targetKg - actualKg).toFixed(1)} kg)`
    }
  } else if (weekStartStr > todayStr) {
    const days = diffDays(todayStr, weekEndStr)
    const { targetKg, deltaKg } = calc(currentWeight, days)
    weeklyTargetKg = targetKg
    weeklyLabel = `Target Minggu ${weekNumber} (${fmtShort(weekEndStr)})`
    weeklySublabel = `Dari ${currentWeight.toFixed(1)} kg (${fmtShort(todayStr)}) • +${deltaKg.toFixed(1)} kg (${days} hari)`
    weeklyTrend = `Proyeksi bertahap s/d ${fmtShort(weekEndStr)}`
  } else {
    const recentBefore = validLogs
      .filter((l) => l.date! < weekStartStr && diffDays(l.date!, weekStartStr) <= 10)
      .at(-1)
    const earlierInWeek = validLogs.filter(
      (l) => l.date! >= weekStartStr && l.date! < todayStr
    )[0]
    const anchor = recentBefore || earlierInWeek

    if (anchor && diffDays(anchor.date!, weekEndStr) >= 4) {
      const days = diffDays(anchor.date!, weekEndStr)
      const { targetKg, deltaKg } = calc(anchor.weightKg, days)
      weeklyTargetKg = targetKg
      weeklyAchieved = currentWeight >= targetKg
      weeklyLabel = `Target Minggu Ini (${fmtShort(weekEndStr)})`
      weeklySublabel = `Dari ${anchor.weightKg.toFixed(1)} kg (${fmtShort(anchor.date!)}) • +${deltaKg.toFixed(1)} kg (${days} hari)`
      weeklyTrend = weeklyAchieved
        ? 'Target minggu ini tercapai!'
        : `Kurang +${(targetKg - currentWeight).toFixed(1)} kg s/d ${fmtShort(weekEndStr)}`
    } else {
      const daysLeft = diffDays(todayStr, weekEndStr)
      if (daysLeft < 4) {
        const rollingEnd = addDays(todayStr, 7)
        const { targetKg, deltaKg } = calc(currentWeight, 7)
        weeklyTargetKg = targetKg
        weeklyAchieved = currentWeight >= targetKg
        weeklyLabel = `Target 7 Hari (s/d ${fmtShort(rollingEnd)})`
        weeklySublabel = `Dari ${currentWeight.toFixed(1)} kg (${fmtShort(todayStr)}) • +${deltaKg.toFixed(1)} kg / 7 hari`
        weeklyTrend =
          daysLeft === 0
            ? `Hari terakhir minggu ini — target 7 hari ke ${fmtShort(rollingEnd)}`
            : `Minggu ini sisa ${daysLeft} hari — target 7 hari ke ${fmtShort(rollingEnd)}`
      } else {
        const { targetKg, deltaKg } = calc(currentWeight, daysLeft)
        weeklyTargetKg = targetKg
        weeklyAchieved = currentWeight >= targetKg
        weeklyLabel = `Target Minggu Ini (${fmtShort(weekEndStr)})`
        weeklySublabel = `Dari ${currentWeight.toFixed(1)} kg (${fmtShort(todayStr)}) • +${deltaKg.toFixed(1)} kg (sisa ${daysLeft} hari)`
        weeklyTrend = weeklyAchieved
          ? 'Target minggu ini tercapai!'
          : `Kurang +${(targetKg - currentWeight).toFixed(1)} kg s/d ${fmtShort(weekEndStr)}`
      }
    }
  }

  // 2. Monthly Target
  const mPad = String(selectedMonthIndex + 1).padStart(2, '0')
  const totalDaysInMonth = getTotalDaysInMonth(selectedYear, selectedMonthIndex)
  const monthStartStr = `${selectedYear}-${mPad}-01`
  const monthEndStr = `${selectedYear}-${mPad}-${String(totalDaysInMonth).padStart(2, '0')}`
  const monthName = MONTH_NAMES_ID[selectedMonthIndex]

  let monthlyHasData = true
  let monthlyLabel = `Target Akhir ${monthName}`
  let monthlyTargetKg = currentWeight
  let monthlySublabel = ''
  let monthlyTrend = ''
  let monthlyAchieved = false
  let endOfMonthNote: string | undefined

  if (monthEndStr < todayStr) {
    const recentBefore = validLogs
      .filter((l) => l.date! < monthStartStr && diffDays(l.date!, monthStartStr) <= 14)
      .at(-1)
    const inMonth = validLogs.filter((l) => l.date! >= monthStartStr && l.date! <= monthEndStr)
    const anchor = recentBefore || inMonth[0]
    if (!anchor) {
      monthlyHasData = false
      monthlyLabel = `Target Bulan ${monthName}`
      monthlySublabel = `Belum ada catatan BB di ${monthName} ${selectedYear}`
      monthlyTrend = 'Periode lewat tanpa log BB'
    } else {
      const days = Math.max(1, diffDays(anchor.date!, monthEndStr))
      const { targetKg, deltaKg } = calc(anchor.weightKg, days)
      const actualKg = (inMonth.at(-1) || anchor).weightKg
      monthlyTargetKg = targetKg
      monthlyAchieved = actualKg >= targetKg
      monthlyLabel = `Target Akhir ${monthName}`
      monthlySublabel = `Dari ${anchor.weightKg.toFixed(1)} kg (${fmtShort(anchor.date!)}) • +${deltaKg.toFixed(1)} kg (${days} hari)`
      monthlyTrend = monthlyAchieved
        ? `Tercapai (${actualKg.toFixed(1)} kg)`
        : `Tercatat ${actualKg.toFixed(1)} kg (kurang +${(targetKg - actualKg).toFixed(1)} kg)`
    }
  } else if (monthStartStr > todayStr) {
    const days = diffDays(todayStr, monthEndStr)
    const { targetKg, deltaKg } = calc(currentWeight, days)
    monthlyTargetKg = targetKg
    monthlyLabel = `Target Akhir ${monthName} (${fmtShort(monthEndStr)})`
    monthlySublabel = `Dari ${currentWeight.toFixed(1)} kg (${fmtShort(todayStr)}) • +${deltaKg.toFixed(1)} kg (${days} hari)`
    monthlyTrend = `Sisa ke target akhir: +${Math.max(0, targetWeight - currentWeight).toFixed(1)} kg`
  } else {
    const recentBefore = validLogs
      .filter((l) => l.date! < monthStartStr && diffDays(l.date!, monthStartStr) <= 10)
      .at(-1)
    const earlierInMonth = validLogs.filter(
      (l) => l.date! >= monthStartStr && l.date! < todayStr
    )[0]
    const anchor = recentBefore || earlierInMonth
    const anchorDate = anchor ? anchor.date! : todayStr
    const anchorKg = anchor ? anchor.weightKg : currentWeight
    const daysInSpan = diffDays(anchorDate, monthEndStr)

    if (daysInSpan <= 5) {
      const nextYear = selectedMonthIndex === 11 ? selectedYear + 1 : selectedYear
      const nextMonthIdx = (selectedMonthIndex + 1) % 12
      const nextMonthName = MONTH_NAMES_ID[nextMonthIdx]
      const nextMonthDays = getTotalDaysInMonth(nextYear, nextMonthIdx)
      const nextMonthEndStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(nextMonthDays).padStart(2, '0')}`
      const daysToNextEnd = diffDays(anchorDate, nextMonthEndStr)
      const { targetKg, deltaKg } = calc(anchorKg, daysToNextEnd)
      const remLabel =
        daysInSpan === 0 ? `${monthName.slice(0, 3)} hari terakhir` : `${monthName.slice(0, 3)} sisa ${daysInSpan} hari`

      monthlyTargetKg = targetKg
      monthlyAchieved = currentWeight >= targetKg
      monthlyLabel = `Target Akhir ${nextMonthName} (${fmtShort(nextMonthEndStr)})`
      monthlySublabel = `${remLabel} (tetap ${anchorKg.toFixed(1)} kg) • +${deltaKg.toFixed(1)} kg (${daysToNextEnd} hari)`
      monthlyTrend = `Otomatis ke ${nextMonthName} karena ${remLabel}`
      endOfMonthNote = `Karena hari ini sudah ${fmtShort(todayStr)} (${remLabel}), akhir ${monthName} realistis tetap ${anchorKg.toFixed(1)} kg dan target bulanan otomatis diarahkan ke akhir ${nextMonthName} (${targetKg.toFixed(1)} kg).`
    } else {
      const { targetKg, deltaKg } = calc(anchorKg, daysInSpan)
      monthlyTargetKg = targetKg
      monthlyAchieved = currentWeight >= targetKg
      monthlyLabel = `Target Akhir ${monthName} (${fmtShort(monthEndStr)})`
      monthlySublabel = `Dari ${anchorKg.toFixed(1)} kg (${fmtShort(anchorDate)}) • +${deltaKg.toFixed(1)} kg (${anchor ? `${daysInSpan} hari` : `sisa ${daysInSpan} hari`})`
      monthlyTrend = monthlyAchieved
        ? `Target bulan ${monthName} tercapai!`
        : `Kurang +${(targetKg - currentWeight).toFixed(1)} kg s/d ${fmtShort(monthEndStr)}`
    }
  }

  return {
    weeklyGainRate,
    monthlyFullRate,
    weeklyHasData,
    weeklyLabel,
    weeklyTargetKg,
    weeklySublabel,
    weeklyTrend,
    weeklyAchieved,
    monthlyHasData,
    monthlyLabel,
    monthlyTargetKg,
    monthlySublabel,
    monthlyTrend,
    monthlyAchieved,
    endOfMonthNote,
  }
}

const initialWorkoutSession: WorkoutSession = {
  id: 'ws-1',
  date: '',
  splitName: '',
  splitType: undefined,
  completed: false,
  skipped: false,
  bodyWeightKg: 57.8,
  durationMinutes: 55,
  exercises: [],
  notes: '',
}

// Default habits are seeded server-side in ensureHabitTables() (src/lib/db.ts)

const initialNotionNotes: NotionNote[] = [
  {
    id: 'note-1',
    title: 'Arsitektur Personal Health & Wealth OS',
    content: '- Buat aplikasi all-in-one yang ringan, no bullshit, no ads\n- Harus ada Daily Capture di awal hari\n- Sholat tracker otomatis update waktu\n- Tracking pengeluaran cepat via shortcut\n- Gym progressive overload tracker dengan log beban & reps',
    tag: 'Ide',
    pinned: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'note-2',
    title: 'Target Nutrisi & Makronutrien Harian',
    content: '- Profil: BB 57.5 kg | TB 168 cm | BMI: 20.4 (Normal)\n- Target Clean Bulk: 68 kg (+10.5 kg otot)\n- Kalori Harian: ~2.350 kkal (surplus 250 kkal)\n- Target Protein: 115g - 120g (~2g/kg BB dari dada ayam, telur, tempe)\n- Budget Belanja Protein: Rp 500.000/bln',
    tag: 'Gym',
    pinned: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'note-3',
    title: 'Alokasi Tabungan & Budget Gaji Rp 2.8 Juta',
    content: '- Gaji Pokok: Rp 2.800.000\n- Makanan & Nutrisi: Rp 1.100.000 (39%)\n- Kebutuhan Pokok & Protein: Rp 500.000 (18%)\n- Gym & Suplemen: Rp 300.000 (11%)\n- Transport/Bensin: Rp 250.000 (9%)\n- Tabungan / Dana Darurat: Rp 650.000 (23%)',
    tag: 'Rencana',
    pinned: false,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
]

const initialUserProfile: UserProfile = {
  name: 'Edo',
  email: 'edopriyatna.tech@gmail.com',
  salary: 2800000,
  bodyWeightKg: 57.5,
  heightCm: 168,
  targetWeightKg: 68.0,
  city: 'Tangerang Selatan',
}

// Storage Keys
const KEYS = {
  DAILY_CAPTURES: 'lifetime_daily_captures',
  PRAYERS: 'lifetime_prayers',
  TRANSACTIONS: 'lifetime_transactions',
  BUDGETS: 'lifetime_budgets',
  WORKOUT: 'lifetime_workout',
  HABITS: 'lifetime_habits',
  NOTES: 'lifetime_notes',
  HAS_CAPTURED_TODAY: 'lifetime_has_captured_today',
  TODOS: 'lifetime_todos',
  ARCHIVED_TODOS: 'lifetime_archived_todos',
  PRAYER_CITY: 'lifetime_prayer_city',
  USER_PROFILE: 'lifetime_user_profile',
  APP_PASSWORD: 'lifetime_app_password',
  AUTH_SESSION: 'lifetime_auth_session',
  WEEKLY_WEIGHT_LOGS: 'lifetime_weekly_weight_logs',
  SAVINGS_GOALS: 'lifetime_savings_goals',
  ACCOUNTS: 'lifetime_accounts',
  MEAL_LOGS: 'lifetime_meal_logs',
  NUTRITION_TARGET: 'lifetime_nutrition_target',
  WORKOUT_LOGS: 'lifetime_workout_logs',
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let token = typeof window !== 'undefined' ? localStorage.getItem('lifetime_auth_token') || '' : ''

  // Auto-acquire token if missing and app is unlocked
  if (!token && typeof window !== 'undefined' && Storage.isUnlocked()) {
    try {
      await Storage.ensureServerSession()
      token = localStorage.getItem('lifetime_auth_token') || ''
    } catch {}
  }

  const headers = new Headers(init?.headers || {})
  if (token && !headers.has('x-daily-auth')) {
    headers.set('x-daily-auth', token)
  }

  let res = await fetch(input, {
    ...init,
    credentials: 'same-origin',
    headers,
  })

  // If 401 Unauthorized, automatically refresh session with stored password and retry once
  if (res.status === 401 && typeof window !== 'undefined' && Storage.isUnlocked()) {
    try {
      const refreshed = await Storage.ensureServerSession(true)
      if (refreshed) {
        const newToken = localStorage.getItem('lifetime_auth_token') || ''
        const retryHeaders = new Headers(init?.headers || {})
        if (newToken) retryHeaders.set('x-daily-auth', newToken)
        res = await fetch(input, {
          ...init,
          credentials: 'same-origin',
          headers: retryHeaders,
        })
      }
    } catch {}
  }

  return res
}

let realtimeChannel: BroadcastChannel | null = null
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    realtimeChannel = new BroadcastChannel('daily_os_realtime')
    realtimeChannel.onmessage = (event) => {
      if (event.data?.type === 'LOCAL_DATA_MUTATED') {
        window.dispatchEvent(
          new CustomEvent('lifetime-data-change', {
            detail: { key: event.data.key, source: 'broadcast_tab' },
          })
        )
      }
    }
  } catch (err) {
    console.warn('BroadcastChannel initialization error:', err)
  }
}

function broadcastLocalMutation(key: string) {
  if (realtimeChannel) {
    try {
      realtimeChannel.postMessage({ type: 'LOCAL_DATA_MUTATED', key, timestamp: Date.now() })
    } catch {}
  }
}

// Write to localStorage and notify the UI, without pushing anything to the server
function writeLocal<T>(key: string, value: T, source: 'local' | 'neon_sync' = 'local'): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('lifetime-data-change', { detail: { key, source } }))
    if (source === 'local') {
      broadcastLocalMutation(key)
    }
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

// Silent local cache write used by getters (no events, no server push)
function writeSilent<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

function safeSet<T>(key: string, value: T, source: 'local' | 'neon_sync' = 'local'): void {
  if (typeof window === 'undefined') return
  writeLocal(key, value, source)

  // Background sync to Neon PostgreSQL database
  // Note: todos, prayers and habits use granular endpoints (/api/todos, /api/prayers, /api/habits)
  // to prevent multi-device race conditions & overwrites
  if (
    key === KEYS.TODOS ||
    key === KEYS.ARCHIVED_TODOS ||
    key === KEYS.PRAYERS ||
    key === KEYS.HABITS
  ) {
    return
  }

  try {
    authFetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    }).catch((err) => {
      console.warn(`[Neon Sync] Failed to sync ${key} to server:`, err)
    })
  } catch {}
}

/* ─── Habits: granular multi-device sync via /api/habits ─── */
const HABIT_OPS_KEY = 'lifetime_habit_pending_ops'

type HabitOp =
  | { opId: string; action: 'set_done'; id: string; date: string; done: boolean }
  | { opId: string; action: 'add'; habit: { id: string; name: string; icon: string; category: string } }
  | { opId: string; action: 'update'; id: string; updates: { name?: string; category?: string; icon?: string } }
  | { opId: string; action: 'delete'; id: string }

type HabitOpInput = HabitOp extends infer O ? (O extends HabitOp ? Omit<O, 'opId'> : never) : never

const getPendingHabitOps = (): HabitOp[] => {
  const ops = safeGet<HabitOp[]>(HABIT_OPS_KEY, [])
  return Array.isArray(ops) ? ops : []
}

const setPendingHabitOps = (ops: HabitOp[]) => writeSilent(HABIT_OPS_KEY, ops)

function deriveHabit(h: Habit, today: string): Habit {
  const history = h.history && typeof h.history === 'object' ? h.history : {}
  return {
    id: h.id,
    name: h.name,
    icon: h.icon || 'CircleCheck',
    category: h.category || 'Kesehatan',
    history,
    completedToday: Boolean(history[today]),
    streak: calculateHabitStreak(history, today),
  }
}

function applyHabitOps(list: Habit[], ops: HabitOp[]): Habit[] {
  let result = list.map((h) => ({ ...h, history: { ...(h.history || {}) } }))
  for (const op of ops) {
    if (op.action === 'set_done') {
      const h = result.find((x) => x.id === op.id)
      if (h) {
        if (op.done) h.history[op.date] = true
        else delete h.history[op.date]
      }
    } else if (op.action === 'add') {
      if (!result.some((x) => x.id === op.habit.id)) {
        result.push({ ...op.habit, history: {}, streak: 0, completedToday: false })
      }
    } else if (op.action === 'update') {
      result = result.map((x) => (x.id === op.id ? { ...x, ...op.updates } : x))
    } else if (op.action === 'delete') {
      result = result.filter((x) => x.id !== op.id)
    }
  }
  const today = getTodayDateStr()
  return result.map((h) => deriveHabit(h, today))
}

let habitFlushPromise: Promise<void> | null = null

function flushHabitOps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (habitFlushPromise) return habitFlushPromise
  habitFlushPromise = (async () => {
    try {
      while (true) {
        const ops = getPendingHabitOps()
        if (ops.length === 0) break
        const { opId, ...payload } = ops[0]
        let res: Response
        try {
          res = await authFetch('/api/habits', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        } catch {
          break // offline: keep queue, retry later
        }
        if (!res.ok && res.status !== 400) break // server/auth issue: retry later
        // Success (or permanently invalid payload): drop this op from the queue
        setPendingHabitOps(getPendingHabitOps().filter((o) => o.opId !== opId))
      }
    } finally {
      habitFlushPromise = null
    }
  })()
  return habitFlushPromise
}

function commitHabitOp(op: HabitOpInput): Habit[] {
  const fullOp = {
    ...op,
    opId: `hop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  } as HabitOp
  const updated = applyHabitOps(Storage.getHabits(), [fullOp])
  writeLocal(KEYS.HABITS, updated)
  setPendingHabitOps([...getPendingHabitOps(), fullOp])
  flushHabitOps().catch(() => {})
  return updated
}

let lastBackgroundSyncTime = 0
let lastLocalPrayerToggleTime = 0
let todoMutationSeq = 0
let todoFlushPromise: Promise<void> | null = null
const PENDING_TODO_OPS_KEY = 'lifetime_pending_todo_ops'

interface PendingTodoOp {
  opId: string
  payload: Record<string, any>
}

function getPendingTodoOps(): PendingTodoOp[] {
  return safeGet<PendingTodoOp[]>(PENDING_TODO_OPS_KEY, [])
}

function setPendingTodoOps(ops: PendingTodoOp[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PENDING_TODO_OPS_KEY, JSON.stringify(ops))
}

function flushTodoOps(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (todoFlushPromise) return todoFlushPromise
  todoFlushPromise = (async () => {
    try {
      while (true) {
        const ops = getPendingTodoOps()
        if (ops.length === 0) break
        const current = ops[0]
        let res: Response
        try {
          res = await authFetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(current.payload),
          })
        } catch {
          break
        }
        if (!res.ok && res.status !== 400) break
        setPendingTodoOps(getPendingTodoOps().filter((o) => o.opId !== current.opId))
      }
    } finally {
      todoFlushPromise = null
    }
  })()
  return todoFlushPromise
}

function enqueueTodoOp(payload: Record<string, any>) {
  todoMutationSeq++
  if (typeof window === 'undefined') return
  const op: PendingTodoOp = {
    opId: `top-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    payload,
  }
  setPendingTodoOps([...getPendingTodoOps(), op])
  flushTodoOps().catch(() => {})
}

export const Storage = {
  syncFromDatabase: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    if (!Storage.isUnlocked()) return false
    await Storage.ensureServerSession()
    window.dispatchEvent(new CustomEvent('lifetime-sync-start'))
    try {
      let changed = false

      // 1. Sync general store data from /api/data (excluding KEYS.TODOS and KEYS.ARCHIVED_TODOS)
      try {
        const res = await authFetch('/api/data')
        const json = await res.json()
        if (json && json.success && json.data) {
          // Pre-sync deleted transaction IDs first to prevent resurrecting deleted items
          if (Array.isArray(json.data['lifetime_deleted_tx_ids'])) {
            const localDel = new Set(safeGet<string[]>('lifetime_deleted_tx_ids', []))
            for (const did of json.data['lifetime_deleted_tx_ids']) {
              if (did) localDel.add(did)
            }
            localStorage.setItem('lifetime_deleted_tx_ids', JSON.stringify(Array.from(localDel)))
          }

          for (const [k, v] of Object.entries(json.data)) {
            if (k === KEYS.TODOS || k === KEYS.ARCHIVED_TODOS || k === KEYS.PRAYERS || k === KEYS.HABITS) continue
            if (v !== undefined && v !== null) {
              if (k === KEYS.TRANSACTIONS && Array.isArray(v)) {
                const deletedIds = new Set(safeGet<string[]>('lifetime_deleted_tx_ids', []))
                const cleanRemote = v.filter((item) => item && !deletedIds.has(item.id))
                const localList = Storage.getTransactions().filter((item) => !deletedIds.has(item.id))
                const remoteMap = new Map(cleanRemote.map((item) => [item.id, item]))
                const unsynced = localList.filter((item) => !remoteMap.has(item.id))
                const merged = [...unsynced, ...cleanRemote]
                merged.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
                const current = localStorage.getItem(k)
                const incoming = JSON.stringify(merged)
                if (current !== incoming) {
                  localStorage.setItem(k, incoming)
                  changed = true
                }
                if (unsynced.length > 0) {
                  authFetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: k, value: merged }),
                  }).catch(() => {})
                }
                continue
              }

              if (k === KEYS.DAILY_CAPTURES && Array.isArray(v)) {
                const localList = Storage.getDailyCaptures()
                const remoteMap = new Map(v.map((item) => [item.id || item.date, item]))
                const unsynced = localList.filter((item) => !remoteMap.has(item.id || item.date))
                const merged = [...unsynced, ...v]
                const current = localStorage.getItem(k)
                const incoming = JSON.stringify(merged)
                if (current !== incoming) {
                  localStorage.setItem(k, incoming)
                  changed = true
                }
                if (unsynced.length > 0) {
                  authFetch('/api/data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: k, value: merged }),
                  }).catch(() => {})
                }
                continue
              }

              if (k === KEYS.NOTES && Array.isArray(v)) {
                const localList = Storage.getNotes()
                const remoteMap = new Map(v.map((item) => [item.id, item]))
                const unsynced = localList.filter((item) => !remoteMap.has(item.id))
                const merged = [...unsynced, ...v]
                const current = localStorage.getItem(k)
                const incoming = JSON.stringify(merged)
                if (current !== incoming) {
                  localStorage.setItem(k, incoming)
                  changed = true
                }
                continue
              }

              if (k === KEYS.WEEKLY_WEIGHT_LOGS && Array.isArray(v)) {
                const localList = Storage.getWeeklyWeightLogs()
                const remoteMap = new Map(v.map((item) => [`${item.date || ''}_${item.weekLabel || item.id}`, item]))
                const unsynced = localList.filter((item) => !remoteMap.has(`${item.date || ''}_${item.weekLabel || item.id}`))
                const merged = [...unsynced, ...v]
                const current = localStorage.getItem(k)
                const incoming = JSON.stringify(merged)
                if (current !== incoming) {
                  localStorage.setItem(k, incoming)
                  changed = true
                }
                continue
              }

              if (k === KEYS.WORKOUT_LOGS && v && typeof v === 'object' && !Array.isArray(v)) {
                const localMap = Storage.getWorkoutLogs()
                const merged = { ...(v as Record<string, DailyWorkoutLog>), ...localMap }
                const current = localStorage.getItem(k)
                const incoming = JSON.stringify(merged)
                if (current !== incoming) {
                  localStorage.setItem(k, incoming)
                  changed = true
                }
                continue
              }


              const current = localStorage.getItem(k)
              const incoming = JSON.stringify(v)
              if (current !== incoming) {
                localStorage.setItem(k, incoming)
                changed = true
              }
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync general data from /api/data:', err)
      }

      // 2. Multi-device conflict-free granular sync for todos from /api/todos
      try {
        if (getPendingTodoOps().length > 0) {
          await flushTodoOps()
        }
        if (getPendingTodoOps().length === 0) {
          const seqBeforeGet = todoMutationSeq
          const todoRes = await authFetch('/api/todos')
          const todoJson = await todoRes.json()
          // Discard stale GET if a local todo mutation occurred while GET was in-flight
          if (
            todoMutationSeq === seqBeforeGet &&
            getPendingTodoOps().length === 0 &&
            todoJson &&
            todoJson.success &&
            Array.isArray(todoJson.todos)
          ) {
            const remoteTodos: TodoItem[] = todoJson.todos
            const remoteArchived: TodoItem[] = Array.isArray(todoJson.archivedTodos) ? todoJson.archivedTodos : []
            const deletedIds: string[] = Array.isArray(todoJson.deletedIds) ? todoJson.deletedIds : []
            const excludedSet = new Set([
              ...deletedIds,
              ...remoteArchived.map((a) => a.id),
            ])

            const localTodos = Storage.getTodayTodos()
            const cleanLocal = localTodos.filter((t) => !excludedSet.has(t.id))

            const remoteMap = new Map<string, TodoItem>()
            for (const r of remoteTodos) {
              remoteMap.set(r.id, r)
            }

            const unsyncedLocal = cleanLocal.filter((t) => !remoteMap.has(t.id))
            if (unsyncedLocal.length > 0) {
              enqueueTodoOp({ action: 'sync_batch', todos: unsyncedLocal })
            }

            const mergedMap = new Map<string, TodoItem>()
            for (const item of unsyncedLocal) {
              mergedMap.set(item.id, item)
            }
            for (const item of remoteTodos) {
              mergedMap.set(item.id, item)
            }

            const finalMergedList = Array.from(mergedMap.values())
            const currentJson = localStorage.getItem(KEYS.TODOS)
            const newJson = JSON.stringify(finalMergedList)

            if (currentJson !== newJson) {
              localStorage.setItem(KEYS.TODOS, newJson)
              changed = true
            }

            if (Array.isArray(todoJson.archivedTodos)) {
              const currentArchivedJson = localStorage.getItem(KEYS.ARCHIVED_TODOS)
              const newArchivedJson = JSON.stringify(todoJson.archivedTodos)
              if (currentArchivedJson !== newArchivedJson) {
                localStorage.setItem(KEYS.ARCHIVED_TODOS, newArchivedJson)
                changed = true
              }
            }
          }
        }
      } catch (todoErr) {
        console.warn('Could not sync todos from /api/todos:', todoErr)
      }

      // 3. Multi-device conflict-free sync for prayers from /api/prayers
      try {
        const prayerRes = await authFetch('/api/prayers')
        const prayerJson = await prayerRes.json()
        if (prayerJson && prayerJson.success && prayerJson.today) {
          const remoteToday = prayerJson.today
          const localPrayer = Storage.getPrayerStatus()

          if (localPrayer.date === remoteToday.date) {
            // Guard against overwriting recent local user toggle (within 10s)
            if (Date.now() - lastLocalPrayerToggleTime > 10000) {
              const curStr = localStorage.getItem(KEYS.PRAYERS)
              const nextStr = JSON.stringify(remoteToday)
              if (curStr !== nextStr) {
                localStorage.setItem(KEYS.PRAYERS, nextStr)
                changed = true
              }
            }
          }

          if (Array.isArray(prayerJson.history)) {
            const histMap = safeGet<Record<string, Record<string, boolean>>>('lifetime_prayers_history', {})
            for (const h of prayerJson.history) {
              if (h && h.date) {
                histMap[h.date] = {
                  subuh: Boolean(h.subuh),
                  dzuhur: Boolean(h.dzuhur),
                  ashar: Boolean(h.ashar),
                  maghrib: Boolean(h.maghrib),
                  isya: Boolean(h.isya),
                }
              }
            }
            localStorage.setItem('lifetime_prayers_history', JSON.stringify(histMap))
          }
        }
      } catch (prayerErr) {
        console.warn('Could not sync prayers from /api/prayers:', prayerErr)
      }

      // 4. Habits: server (relational tables) is the source of truth.
      // Pending local ops (in-flight / offline) are re-applied on top so the UI never flickers back.
      try {
        await flushHabitOps()
        const habitRes = await authFetch('/api/habits')
        const habitJson = await habitRes.json()
        if (habitJson && habitJson.success && Array.isArray(habitJson.habits)) {
          const merged = applyHabitOps(habitJson.habits, getPendingHabitOps())
          const nextStr = JSON.stringify(merged)
          if (localStorage.getItem(KEYS.HABITS) !== nextStr) {
            localStorage.setItem(KEYS.HABITS, nextStr)
            changed = true
          }
        }
      } catch (habitErr) {
        console.warn('Could not sync habits from /api/habits:', habitErr)
      }

      if (changed) {
        window.dispatchEvent(new CustomEvent('lifetime-data-change', { detail: { source: 'neon_sync' } }))
      }
      window.dispatchEvent(new CustomEvent('lifetime-sync-end', { detail: { success: true, changed } }))
      return true
    } catch (e) {
      console.warn('Could not sync from Neon database:', e)
      window.dispatchEvent(new CustomEvent('lifetime-sync-end', { detail: { success: false, error: e } }))
      return false
    }
  },

  syncBeforeAction: async (): Promise<void> => {
    if (typeof window === 'undefined') return
    // Non-blocking trigger in background so UI actions are 0ms instant
    const now = Date.now()
    if (now - lastBackgroundSyncTime > 45000) {
      lastBackgroundSyncTime = now
      Storage.syncFromDatabase().catch((e) => console.warn('Background sync error:', e))
    }
  },

  getDailyCaptures: (): DailyCapture[] => safeGet(KEYS.DAILY_CAPTURES, initialDailyCaptures),
  saveDailyCaptures: (data: DailyCapture[]) => safeSet(KEYS.DAILY_CAPTURES, data),
  getTodayDailyCapture: (): DailyCapture | undefined => {
    const today = getTodayDateStr()
    const captures = Storage.getDailyCaptures()
    return captures.find((c) => c.date === today)
  },

  saveSleep: (date: string, bedTime: string, wakeTime: string, hours: number): DailyCapture => {
    const captures = Storage.getDailyCaptures()
    const existingIndex = captures.findIndex((c) => c.date === date)
    let updatedCapture: DailyCapture
    if (existingIndex >= 0) {
      updatedCapture = {
        ...captures[existingIndex],
        sleepBedTime: bedTime,
        sleepWakeTime: wakeTime,
        sleepHours: hours,
      }
      const updatedList = [...captures]
      updatedList[existingIndex] = updatedCapture
      Storage.saveDailyCaptures(updatedList)
    } else {
      updatedCapture = {
        id: `dc-${Date.now()}`,
        date,
        thoughts: '',
        plans: '',
        sleepBedTime: bedTime,
        sleepWakeTime: wakeTime,
        sleepHours: hours,
        priority: 'high',
        mood: 'focused',
        createdAt: new Date().toISOString(),
      }
      Storage.saveDailyCaptures([updatedCapture, ...captures])
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lifetime-data-change', { detail: { key: KEYS.DAILY_CAPTURES, source: 'local' } }))
    }
    return updatedCapture
  },

  saveTodaySleep: (bedTime: string, wakeTime: string, hours: number): DailyCapture => {
    return Storage.saveSleep(getTodayDateStr(), bedTime, wakeTime, hours)
  },

  saveTodayCapture: (capture: Partial<DailyCapture> & { date: string }): DailyCapture => {
    const all = Storage.getDailyCaptures()
    const existingIndex = all.findIndex((c) => c.date === capture.date)
    let finalCapture: DailyCapture
    if (existingIndex >= 0) {
      finalCapture = {
        ...all[existingIndex],
        ...capture,
      }
      const updatedList = [...all]
      updatedList[existingIndex] = finalCapture
      Storage.saveDailyCaptures(updatedList)
    } else {
      finalCapture = {
        id: `dc-${Date.now()}`,
        date: capture.date,
        thoughts: capture.thoughts || '',
        plans: capture.plans || '',
        priority: capture.priority || 'high',
        mood: capture.mood || 'focused',
        sleepBedTime: capture.sleepBedTime || '23:00',
        sleepWakeTime: capture.sleepWakeTime || '06:30',
        sleepHours: capture.sleepHours || 7.5,
        createdAt: new Date().toISOString(),
      }
      Storage.saveDailyCaptures([finalCapture, ...all])
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${KEYS.HAS_CAPTURED_TODAY}_${capture.date}`, 'true')
      window.dispatchEvent(new CustomEvent('lifetime-data-change', { detail: { key: KEYS.DAILY_CAPTURES, source: 'local' } }))
    }
    return finalCapture
  },

  addDailyCapture: (capture: Omit<DailyCapture, 'id' | 'createdAt'>): DailyCapture => {
    return Storage.saveTodayCapture({
      ...capture,
      date: capture.date || getTodayDateStr(),
    })
  },

  hasCapturedToday: (): boolean => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(`${KEYS.HAS_CAPTURED_TODAY}_${getTodayDateStr()}`) === 'true'
  },

  dismissCaptureModalToday: (): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`daily_capture_modal_dismissed_${getTodayDateStr()}`, 'true')
    } catch {}
  },

  isCaptureModalDismissedToday: (): boolean => {
    if (typeof window === 'undefined') return true
    try {
      return localStorage.getItem(`daily_capture_modal_dismissed_${getTodayDateStr()}`) === 'true'
    } catch {
      return false
    }
  },

  getPrayerStatus: (): PrayerStatus => {
    const stored = safeGet<PrayerStatus | null>(KEYS.PRAYERS, null)
    const today = getTodayDateStr()
    if (!stored || stored.date !== today) {
      const fresh: PrayerStatus = {
        date: today,
        prayers: {
          subuh: false,
          dzuhur: false,
          ashar: false,
          maghrib: false,
          isya: false,
        },
        streak: stored?.streak ?? 0,
      }
      // CRITICAL FIX: DO NOT call safeSet() here.
      // A getter must NEVER overwrite the cloud database with blank values!
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.PRAYERS, JSON.stringify(fresh))
      }
      return fresh
    }
    return stored
  },

  savePrayerStatus: (data: PrayerStatus) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYS.PRAYERS, JSON.stringify(data))
      const histMap = safeGet<Record<string, Record<string, boolean>>>('lifetime_prayers_history', {})
      histMap[data.date] = data.prayers
      localStorage.setItem('lifetime_prayers_history', JSON.stringify(histMap))
      window.dispatchEvent(new CustomEvent('lifetime-data-change', { detail: { key: KEYS.PRAYERS, source: 'local' } }))
    }
  },

  togglePrayer: (prayer: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'): PrayerStatus => {
    lastLocalPrayerToggleTime = Date.now()
    const current = Storage.getPrayerStatus()
    const nextDone = !current.prayers[prayer]
    const updatedPrayers = {
      ...current.prayers,
      [prayer]: nextDone,
    }
    const allCompleted = Object.values(updatedPrayers).every(Boolean)
    const updated: PrayerStatus = {
      ...current,
      prayers: updatedPrayers,
      streak: allCompleted ? current.streak + 1 : current.streak,
    }
    Storage.savePrayerStatus(updated)

    // Non-blocking background sync to Neon PostgreSQL
    if (typeof window !== 'undefined') {
      authFetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          prayer,
          done: nextDone,
          date: current.date,
        }),
      }).catch((err) => console.warn('Failed to sync prayer to server:', err))
    }

    return updated
  },

  getTransactions: (): Transaction[] => {
    const deletedIds = new Set(safeGet<string[]>('lifetime_deleted_tx_ids', []))
    const list = safeGet<Transaction[]>(KEYS.TRANSACTIONS, initialTransactions)
    return list.filter((t) => {
      if (!t || !t.id) return false
      if (t.category === 'Saldo Awal' || t.id === 'tx-cash-init-20261029') return false
      if (deletedIds.has(t.id)) return false
      return true
    })
  },
  saveTransactions: (data: Transaction[]) => safeSet(KEYS.TRANSACTIONS, data),

  addTransaction: (tx: Omit<Transaction, 'id'>): Transaction => {
    const all = Storage.getTransactions()
    const uniqueSuffix = Math.random().toString(36).substring(2, 7)
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${uniqueSuffix}`,
      date: tx.date || getTodayDateStr(),
      paymentMethod: tx.paymentMethod || 'QRIS',
    }
    const updated = [newTx, ...all]
    Storage.saveTransactions(updated)

    // Automatically update matching account balance if found
    if (tx.paymentMethod) {
      const accounts = Storage.getAccounts()
      const pLow = tx.paymentMethod.toLowerCase()
      const matched = accounts.find((a) => {
        const aLow = a.name.toLowerCase()
        return (
          aLow.includes(pLow) ||
          pLow.includes(aLow) ||
          (pLow.includes('cash') && a.type === 'cash') ||
          (pLow.includes('tunai') && a.type === 'cash')
        )
      })
      if (matched) {
        const delta = tx.type === 'expense' ? -tx.amount : tx.amount
        Storage.updateAccountBalance(matched.id, Math.max(0, matched.balance + delta))
      }
    }

    return newTx
  },

  updateTransaction: (id: string, updatedTx: Partial<Transaction>): Transaction[] => {
    const all = Storage.getTransactions()
    const updated = all.map((t) => (t.id === id ? { ...t, ...updatedTx } : t))
    Storage.saveTransactions(updated)
    return updated
  },

  deleteTransaction: (id: string): void => {
    const all = Storage.getTransactions()
    const updated = all.filter((t) => t.id !== id)
    const deletedIds = safeGet<string[]>('lifetime_deleted_tx_ids', [])
    if (!deletedIds.includes(id)) {
      safeSet('lifetime_deleted_tx_ids', [...deletedIds, id])
    }
    Storage.saveTransactions(updated)
  },

  clearAllTransactions: (): void => {
    Storage.saveTransactions([])
    const zeroBudgets = Storage.getBudgets().map((b) => ({ ...b, spent: 0 }))
    Storage.saveBudgets(zeroBudgets)
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifetime_deleted_tx_ids', JSON.stringify([]))
      safeSet(KEYS.TRANSACTIONS, [])
      safeSet(KEYS.BUDGETS, zeroBudgets)
      authFetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: KEYS.TRANSACTIONS, value: [], action: 'clear' }),
      }).catch(() => {})
    }
  },

  getBudgets: (): BudgetCategory[] => safeGet(KEYS.BUDGETS, initialBudgetCategories),
  saveBudgets: (data: BudgetCategory[]) => safeSet(KEYS.BUDGETS, data),

  addBudget: (budget: Omit<BudgetCategory, 'id' | 'spent'>): BudgetCategory => {
    const all = Storage.getBudgets()
    const newBudget: BudgetCategory = {
      ...budget,
      id: `b-${Date.now()}`,
      spent: 0,
    }
    const updated = [...all, newBudget]
    Storage.saveBudgets(updated)
    return newBudget
  },

  updateBudget: (id: string, updatedBudget: Partial<BudgetCategory>): BudgetCategory[] => {
    const all = Storage.getBudgets()
    const updated = all.map((b) => (b.id === id ? { ...b, ...updatedBudget } : b))
    Storage.saveBudgets(updated)
    return updated
  },

  deleteBudget: (id: string): void => {
    const all = Storage.getBudgets()
    const updated = all.filter((b) => b.id !== id)
    Storage.saveBudgets(updated)
  },

  getSavingsGoals: (): SavingsGoal[] => safeGet(KEYS.SAVINGS_GOALS, initialSavingsGoals),
  saveSavingsGoals: (data: SavingsGoal[]) => safeSet(KEYS.SAVINGS_GOALS, data),

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>): SavingsGoal => {
    const all = Storage.getSavingsGoals()
    const newGoal: SavingsGoal = {
      ...goal,
      id: `sg-${Date.now()}`,
    }
    const updated = [...all, newGoal]
    Storage.saveSavingsGoals(updated)
    return newGoal
  },

  updateSavingsGoal: (id: string, updatedGoal: Partial<SavingsGoal>): SavingsGoal[] => {
    const all = Storage.getSavingsGoals()
    const updated = all.map((g) => (g.id === id ? { ...g, ...updatedGoal } : g))
    Storage.saveSavingsGoals(updated)
    return updated
  },

  deleteSavingsGoal: (id: string): void => {
    const all = Storage.getSavingsGoals()
    const updated = all.filter((g) => g.id !== id)
    Storage.saveSavingsGoals(updated)
  },

  getAccounts: (): FinancialAccount[] => {
    const list = safeGet(KEYS.ACCOUNTS, initialAccounts)
    let healed = false
    const cleaned = list.map((a) => {
      if (a.notes?.includes('35rb + 46rb')) {
        healed = true
        return { ...a, notes: 'Uang tunai' }
      }
      return a
    })
    if (healed) safeSet(KEYS.ACCOUNTS, cleaned)
    return cleaned
  },
  saveAccounts: (data: FinancialAccount[]) => safeSet(KEYS.ACCOUNTS, data),

  addAccount: (account: Omit<FinancialAccount, 'id'>): FinancialAccount => {
    const all = Storage.getAccounts()
    const newAccount: FinancialAccount = {
      ...account,
      id: `acc-${Date.now()}`,
    }
    const updated = [...all, newAccount]
    Storage.saveAccounts(updated)
    return newAccount
  },

  updateAccount: (id: string, updates: Partial<FinancialAccount>): FinancialAccount[] => {
    const all = Storage.getAccounts()
    const updated = all.map((a: FinancialAccount) => (a.id === id ? { ...a, ...updates } : a))
    Storage.saveAccounts(updated)
    return updated
  },

  updateAccountBalance: (id: string, newBalance: number): FinancialAccount[] => {
    const all = Storage.getAccounts()
    const updated = all.map((a: FinancialAccount) => (a.id === id ? { ...a, balance: newBalance } : a))
    Storage.saveAccounts(updated)
    return updated
  },

  deleteAccount: (id: string): void => {
    const all = Storage.getAccounts()
    Storage.saveAccounts(all.filter((a: FinancialAccount) => a.id !== id))
  },

  getTotalLiquidWealth: (): number => {
    return Storage.getAccounts().reduce((sum: number, a: FinancialAccount) => sum + (Number(a.balance) || 0), 0)
  },

  togglePrayerForDate: (date: string, prayer: PrayerName): Record<string, boolean> => {
    const histMap = safeGet<Record<string, Record<string, boolean>>>('lifetime_prayers_history', {})
    const dayPrayers = histMap[date] || { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false }
    const nextDone = !dayPrayers[prayer]
    const updatedDay = { ...dayPrayers, [prayer]: nextDone }
    histMap[date] = updatedDay
    if (typeof window !== 'undefined') {
      localStorage.setItem('lifetime_prayers_history', JSON.stringify(histMap))
    }

    if (date === getTodayDateStr()) {
      const current = Storage.getPrayerStatus()
      const allDone = Object.values(updatedDay).every(Boolean)
      const updatedStatus: PrayerStatus = {
        ...current,
        prayers: updatedDay as any,
        streak: allDone ? current.streak + 1 : current.streak,
      }
      Storage.savePrayerStatus(updatedStatus)
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lifetime-data-change', { detail: { key: 'lifetime_prayers_history', source: 'local' } }))
      }
    }

    if (typeof window !== 'undefined') {
      authFetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', prayer, done: nextDone, date }),
      }).catch((e) => console.warn('Failed to sync past prayer:', e))
    }
    return updatedDay
  },

  getPrayerHistoryMap: (): Record<string, { subuh: boolean; dzuhur: boolean; ashar: boolean; maghrib: boolean; isya: boolean }> => {
    return safeGet<Record<string, { subuh: boolean; dzuhur: boolean; ashar: boolean; maghrib: boolean; isya: boolean }>>(
      'lifetime_prayers_history',
      {}
    )
  },

  getWorkoutLogs: (): Record<string, DailyWorkoutLog> => {
    const raw = safeGet<Record<string, DailyWorkoutLog>>(KEYS.WORKOUT_LOGS, {})
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  },

  setWorkoutForDate: (date: string, splitType: WorkoutSplitType | null): Record<string, DailyWorkoutLog> => {
    const logs = { ...Storage.getWorkoutLogs() }
    if (!splitType) {
      delete logs[date]
    } else {
      const prev = logs[date]
      logs[date] = {
        date,
        splitType,
        completed: splitType === 'rest' ? false : Boolean(prev?.splitType === splitType && prev?.completed),
      }
    }
    safeSet(KEYS.WORKOUT_LOGS, logs)

    if (date === getTodayDateStr()) {
      const session = Storage.getWorkoutSession()
      Storage.saveWorkoutSession(session)
    }
    return logs
  },

  toggleWorkoutCompletedForDate: (date: string): Record<string, DailyWorkoutLog> => {
    const logs = { ...Storage.getWorkoutLogs() }
    const cur = logs[date]
    if (!cur || cur.splitType === 'rest') return logs
    logs[date] = { ...cur, completed: !cur.completed }
    safeSet(KEYS.WORKOUT_LOGS, logs)

    if (date === getTodayDateStr()) {
      const session = Storage.getWorkoutSession()
      Storage.saveWorkoutSession(session)
    }
    return logs
  },

  getRecommendedWorkout: (targetDate: string = getTodayDateStr()) => {
    const logs = Storage.getWorkoutLogs()
    const cap = Storage.getDailyCaptures().find((c) => c.date === targetDate)
    return computeWorkoutRecommendation(logs, targetDate, cap?.sleepHours)
  },

  getWorkoutSession: (): WorkoutSession => {
    const today = getTodayDateStr()
    const currentBB = Storage.getCurrentBodyWeight()
    const todayLog = Storage.getWorkoutLogs()[today]
    const splitType = todayLog?.splitType

    const ws: WorkoutSession = {
      id: 'ws-1',
      date: today,
      splitType,
      splitName: splitType ? SPLIT_NAMES[splitType] : '',
      exercises: splitType && splitType !== 'rest' ? PPL_PRESETS[splitType].exercises : [],
      completed: Boolean(todayLog?.completed && splitType && splitType !== 'rest'),
      skipped: splitType === 'rest',
      bodyWeightKg: currentBB,
      durationMinutes: 55,
    }
    return ws
  },
  saveWorkoutSession: (data: WorkoutSession) => safeSet(KEYS.WORKOUT, data),
  setWorkoutSplit: (splitType: WorkoutSplitType | null): WorkoutSession => {
    Storage.setWorkoutForDate(getTodayDateStr(), splitType)
    return Storage.getWorkoutSession()
  },

  toggleWorkoutCompleted: (): WorkoutSession => {
    Storage.toggleWorkoutCompletedForDate(getTodayDateStr())
    return Storage.getWorkoutSession()
  },

  toggleWorkoutSkipped: (): WorkoutSession => {
    const today = getTodayDateStr()
    const cur = Storage.getWorkoutLogs()[today]
    Storage.setWorkoutForDate(today, cur?.splitType === 'rest' ? null : 'rest')
    return Storage.getWorkoutSession()
  },

  // Weekly Weight Logs (with month-aware deduplication & chronological sort)
  getWeeklyWeightLogs: (): WeeklyWeightLog[] => {
    const raw = safeGet(KEYS.WEEKLY_WEIGHT_LOGS, initialWeeklyWeightLogs)
    const map = new Map<string, WeeklyWeightLog>()
    for (const log of raw) {
      if (!log || !log.weekLabel) continue
      const monthKey = log.date ? log.date.slice(0, 7) : ''
      const lower = log.weekLabel.toLowerCase()
      const weekMatch = lower.match(/minggu\s*(\d+)/)
      const key = weekMatch ? `${monthKey}-minggu-${weekMatch[1]}` : log.id
      map.set(key, log)
    }
    const deduped = Array.from(map.values()).sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    if (deduped.length !== raw.length) {
      writeSilent(KEYS.WEEKLY_WEIGHT_LOGS, deduped)
    }
    return deduped
  },
  saveWeeklyWeightLogs: (data: WeeklyWeightLog[]) => safeSet(KEYS.WEEKLY_WEIGHT_LOGS, data),

  getCurrentBodyWeight: (): number => {
    const logs = Storage.getWeeklyWeightLogs()
    if (logs.length > 0) {
      const latest = logs[logs.length - 1]
      if (latest && Number(latest.weightKg) > 0) return Number(latest.weightKg)
    }
    const profile = safeGet<UserProfile>(KEYS.USER_PROFILE, initialUserProfile)
    return Number(profile.bodyWeightKg) > 0 ? Number(profile.bodyWeightKg) : 57.8
  },

  addOrUpdateWeeklyWeight: (weekLabel: string, weightKg: number, notes?: string, customDate?: string): WeeklyWeightLog[] => {
    const logs = Storage.getWeeklyWeightLogs()
    const entryDate = customDate || getTodayDateStr()
    const monthPrefix = entryDate.slice(0, 7)
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    const existingIndex = logs.findIndex(
      (l) => norm(l.weekLabel) === norm(weekLabel) && (!l.date || l.date.slice(0, 7) === monthPrefix)
    )
    let updated: WeeklyWeightLog[]
    if (existingIndex >= 0) {
      updated = [...logs]
      updated[existingIndex] = {
        ...updated[existingIndex],
        weightKg,
        date: entryDate,
        notes: notes !== undefined ? notes : updated[existingIndex].notes,
      }
    } else {
      const newEntry: WeeklyWeightLog = {
        id: `wl-${Date.now()}`,
        weekLabel,
        date: entryDate,
        weightKg,
        notes: notes || 'Catatan progresif clean bulk',
      }
      updated = [...logs, newEntry]
    }
    updated.sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    Storage.saveWeeklyWeightLogs(updated)
    const latestKg = updated[updated.length - 1]?.weightKg ?? weightKg
    const profile = Storage.getUserProfile()
    Storage.saveUserProfile({ ...profile, bodyWeightKg: latestKg })
    return updated
  },

  deleteWeeklyWeightLog: (id: string): WeeklyWeightLog[] => {
    const all = Storage.getWeeklyWeightLogs()
    const updated = all.filter((l) => l.id !== id)
    Storage.saveWeeklyWeightLogs(updated)
    const profile = Storage.getUserProfile()
    const nextKg = updated.length > 0 ? updated[updated.length - 1].weightKg : profile.bodyWeightKg
    Storage.saveUserProfile({ ...profile, bodyWeightKg: nextKg })
    return updated
  },

  updateWeeklyWeightLog: (id: string, updates: Partial<WeeklyWeightLog>): WeeklyWeightLog[] => {
    const all = Storage.getWeeklyWeightLogs()
    const updated = all
      .map((l) => (l.id === id ? { ...l, ...updates } : l))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    Storage.saveWeeklyWeightLogs(updated)
    if (updated.length > 0) {
      const profile = Storage.getUserProfile()
      Storage.saveUserProfile({ ...profile, bodyWeightKg: updated[updated.length - 1].weightKg })
    }
    return updated
  },

  toggleWorkoutSet: (exerciseId: string, setNumber: number): WorkoutSession => {
    const current = Storage.getWorkoutSession()
    const exercises = current.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex
      return {
        ...ex,
        sets: ex.sets.map((s) => (s.setNumber === setNumber ? { ...s, done: !s.done } : s)),
      }
    })
    const allSetsDone = exercises.every((ex) => ex.sets.every((s) => s.done))
    const updated: WorkoutSession = {
      ...current,
      exercises,
      completed: allSetsDone,
    }
    Storage.saveWorkoutSession(updated)
    return updated
  },

  getHabits: (): Habit[] => {
    const stored = safeGet<Habit[] | null>(KEYS.HABITS, null)
    if (!Array.isArray(stored)) return []
    const today = getTodayDateStr()
    return stored.filter((h) => h && h.id && h.name).map((h) => deriveHabit(h, today))
  },
  // True once habits have been loaded at least once on this device (from server or local action)
  hasHabitsLoaded: (): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(KEYS.HABITS) !== null
  },
  saveHabits: (data: Habit[]) => writeLocal(KEYS.HABITS, data),

  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedToday' | 'history'>): Habit => {
    const newHabit = {
      id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: habit.name,
      icon: habit.icon || 'CircleCheck',
      category: habit.category || 'Kesehatan',
    }
    const updated = commitHabitOp({ action: 'add', habit: newHabit })
    return updated.find((h) => h.id === newHabit.id) || deriveHabit({ ...newHabit, streak: 0, completedToday: false, history: {} }, getTodayDateStr())
  },

  deleteHabit: (id: string): Habit[] => {
    return commitHabitOp({ action: 'delete', id })
  },

  updateHabit: (id: string, updates: Partial<Habit>): Habit[] => {
    const clean: { name?: string; category?: string; icon?: string } = {}
    if (updates.name !== undefined) clean.name = updates.name
    if (updates.category !== undefined) clean.category = updates.category
    if (updates.icon !== undefined) clean.icon = updates.icon
    return commitHabitOp({ action: 'update', id, updates: clean })
  },

  toggleHabit: (habitId: string): Habit[] => {
    return Storage.toggleHabitForDate(habitId, getTodayDateStr())
  },

  toggleHabitForDate: (habitId: string, date: string): Habit[] => {
    const all = Storage.getHabits()
    const target = all.find((h) => h.id === habitId)
    if (!target) return all
    const nextDone = !target.history?.[date]
    return commitHabitOp({ action: 'set_done', id: habitId, date, done: nextDone })
  },

  // Meal & Nutrition Tracker methods (Clean Bulking)
  getMealLogs: (): MealLog[] => safeGet<MealLog[]>(KEYS.MEAL_LOGS, initialMealLogs),
  saveMealLogs: (data: MealLog[]) => safeSet(KEYS.MEAL_LOGS, data),

  addMealLog: (meal: Omit<MealLog, 'id'>): MealLog => {
    const all = Storage.getMealLogs()
    const newMeal: MealLog = {
      ...meal,
      id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    }
    const updated = [newMeal, ...all]
    Storage.saveMealLogs(updated)
    return newMeal
  },

  updateMealLog: (id: string, updates: Partial<MealLog>): MealLog[] => {
    const all = Storage.getMealLogs()
    const updated = all.map((m) => (m.id === id ? { ...m, ...updates } : m))
    Storage.saveMealLogs(updated)
    return updated
  },

  deleteMealLog: (id: string): MealLog[] => {
    const all = Storage.getMealLogs()
    const updated = all.filter((m) => m.id !== id)
    Storage.saveMealLogs(updated)
    return updated
  },

  getNutritionTarget: (): NutritionTarget => {
    const profile = safeGet<UserProfile>(KEYS.USER_PROFILE, initialUserProfile)
    const currentBB = Storage.getCurrentBodyWeight()
    const stored = safeGet<NutritionTarget | null>(KEYS.NUTRITION_TARGET, null)
    if (stored?.manualOverride) return stored
    const surplus = stored?.surplus ?? 350
    return {
      ...calculateNutritionFromBiometrics(profile.heightCm, currentBB, surplus),
      surplus,
      manualOverride: false,
    }
  },
  saveNutritionTarget: (target: NutritionTarget): void =>
    safeSet(KEYS.NUTRITION_TARGET, target),

  getNotes: (): NotionNote[] => safeGet(KEYS.NOTES, initialNotionNotes),
  saveNotes: (data: NotionNote[]) => safeSet(KEYS.NOTES, data),

  addNote: (note: Omit<NotionNote, 'id' | 'updatedAt'>): NotionNote => {
    const all = Storage.getNotes()
    const newNote: NotionNote = {
      ...note,
      id: `note-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    }
    const updated = [newNote, ...all]
    Storage.saveNotes(updated)
    return newNote
  },

  deleteNote: (id: string): void => {
    const all = Storage.getNotes()
    Storage.saveNotes(all.filter((n) => n.id !== id))
  },

  // Today's To-Do List methods (with automatic deduplication)
  getTodayTodos: (): TodoItem[] => {
    const list = safeGet<TodoItem[]>(KEYS.TODOS, initialTodos)
    const today = getTodayDateStr()
    const seen = new Set<string>()
    const deduped: TodoItem[] = []
    const staleDone: TodoItem[] = []
    for (const t of list) {
      if (!t || !t.id || seen.has(t.id) || t.isArchived || t.status === 'archived') continue
      seen.add(t.id)
      const isDone = Boolean(t.done || t.status === 'done')
      const normalized: TodoItem = isDone
        ? { ...t, done: true, status: 'done' }
        : t
      const doneDate =
        normalized.completedDate ||
        (normalized.completedAt
          ? new Date(normalized.completedAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
          : undefined)
      if (isDone && doneDate && doneDate < today) {
        staleDone.push({ ...normalized, isArchived: true, status: 'archived', completedDate: doneDate })
      } else {
        deduped.push(normalized)
      }
    }
    if (staleDone.length > 0) {
      writeSilent(KEYS.TODOS, deduped)
      const curArch = safeGet<TodoItem[]>(KEYS.ARCHIVED_TODOS, [])
      const archIds = new Set(curArch.map((a) => a.id))
      writeSilent(KEYS.ARCHIVED_TODOS, [...staleDone.filter((s) => !archIds.has(s.id)), ...curArch])
      enqueueTodoOp({ action: 'archive_completed', ids: staleDone.map((s) => s.id) })
    }
    return deduped
  },

  saveTodayTodos: (data: TodoItem[]) => {
    const seen = new Set<string>()
    const deduped: TodoItem[] = []
    for (const t of data) {
      if (t && t.id && !seen.has(t.id) && !t.isArchived && t.status !== 'archived') {
        seen.add(t.id)
        deduped.push(t)
      }
    }
    safeSet(KEYS.TODOS, deduped)
  },

  getArchivedTodos: (): TodoItem[] => {
    const list = safeGet<TodoItem[]>(KEYS.ARCHIVED_TODOS, [])
    const seen = new Set<string>()
    const deduped: TodoItem[] = []
    for (const t of list) {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id)
        deduped.push(t)
      }
    }
    return deduped.sort((a, b) => {
      const dateA = a.completedAt || a.completedDate || a.createdAt || ''
      const dateB = b.completedAt || b.completedDate || b.createdAt || ''
      return dateB.localeCompare(dateA)
    })
  },

  saveArchivedTodos: (data: TodoItem[]) => {
    const seen = new Set<string>()
    const deduped: TodoItem[] = []
    for (const t of data) {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id)
        deduped.push(t)
      }
    }
    safeSet(KEYS.ARCHIVED_TODOS, deduped)
  },

  addTodo: (todo: Omit<TodoItem, 'id'>): TodoItem => {
    const all = Storage.getTodayTodos()
    const uniqueSuffix = Math.random().toString(36).substring(2, 7)
    const isDone = Boolean(todo.done)
    const newTodo: TodoItem = {
      ...todo,
      createdAt: todo.createdAt || new Date().toISOString(),
      status: todo.status || (isDone ? 'done' : 'todo'),
      done: isDone,
      completedAt: isDone ? (todo.completedAt || new Date().toISOString()) : undefined,
      completedDate: isDone ? (todo.completedDate || getTodayDateStr()) : undefined,
      id: `td-${Date.now()}-${uniqueSuffix}`,
    }
    const updated = [newTodo, ...all]
    Storage.saveTodayTodos(updated)
    enqueueTodoOp({ action: 'add', todo: newTodo })
    return newTodo
  },

  addCompletedTodo: (todo: Omit<TodoItem, 'id'>): TodoItem => {
    const currentArchived = Storage.getArchivedTodos()
    const uniqueSuffix = Math.random().toString(36).substring(2, 7)
    const completedDate = todo.completedDate || getTodayDateStr()
    const completedAt = todo.completedAt || new Date().toISOString()
    const newArchivedItem: TodoItem = {
      ...todo,
      id: `td-${Date.now()}-${uniqueSuffix}`,
      done: true,
      isArchived: true,
      status: 'archived',
      completedDate,
      completedAt,
      createdAt: todo.createdAt || completedAt,
    }

    const updated = [newArchivedItem, ...currentArchived]
    Storage.saveArchivedTodos(updated)
    enqueueTodoOp({ action: 'add_completed', todo: newArchivedItem })
    return newArchivedItem
  },

  updateTodo: (id: string, updates: Partial<TodoItem>): TodoItem[] => {
    const all = Storage.getTodayTodos()
    const todayDate = getTodayDateStr()
    let targetItem: TodoItem | null = null

    const updated = all.map((t) => {
      if (t.id === id) {
        const merged = { ...t, ...updates }
        if (updates.status) {
          merged.done = updates.status === 'done'
        } else if (updates.done !== undefined) {
          merged.status = updates.done ? 'done' : 'todo'
        }
        if (merged.done) {
          merged.completedAt = updates.completedAt || new Date().toISOString()
          merged.completedDate = updates.completedDate || todayDate
        } else {
          merged.completedAt = undefined
          merged.completedDate = undefined
        }
        targetItem = merged
        return merged
      }
      return t
    })
    Storage.saveTodayTodos(updated)

    if (targetItem) {
      enqueueTodoOp({ action: 'update', id, updates })
    }

    return updated
  },

  toggleTodo: (id: string): TodoItem[] => {
    const all = Storage.getTodayTodos()
    let toggledDone = false
    const todayDate = getTodayDateStr()
    const updated = all.map((t) => {
      if (t.id === id) {
        toggledDone = !t.done
        return {
          ...t,
          done: toggledDone,
          status: (toggledDone ? 'done' : 'todo') as TaskFlowStatus,
          completedAt: toggledDone ? new Date().toISOString() : undefined,
          completedDate: toggledDone ? todayDate : undefined,
        }
      }
      return t
    })
    Storage.saveTodayTodos(updated)
    enqueueTodoOp({ action: 'set_done', id, done: toggledDone })
    return updated
  },

  archiveCompletedTodos: (): { active: TodoItem[]; archived: TodoItem[] } => {
    const all = Storage.getTodayTodos()
    const todayDate = getTodayDateStr()
    const nowIso = new Date().toISOString()

    const toArchive: TodoItem[] = []
    const remaining: TodoItem[] = []

    for (const t of all) {
      if (t.done || t.status === 'done') {
        toArchive.push({
          ...t,
          done: true,
          isArchived: true,
          status: 'archived',
          completedAt: t.completedAt || nowIso,
          completedDate: t.completedDate || todayDate,
        })
      } else {
        remaining.push(t)
      }
    }

    Storage.saveTodayTodos(remaining)

    const currentArchived = Storage.getArchivedTodos()
    const updatedArchived = [...toArchive, ...currentArchived]
    Storage.saveArchivedTodos(updatedArchived)

    if (toArchive.length > 0) {
      enqueueTodoOp({ action: 'archive_completed', ids: toArchive.map((t) => t.id) })
    }

    return { active: remaining, archived: updatedArchived }
  },

  unarchiveTodo: (id: string): { active: TodoItem[]; archived: TodoItem[] } => {
    const archived = Storage.getArchivedTodos()
    const target = archived.find((t) => t.id === id)
    const remainingArchived = archived.filter((t) => t.id !== id)
    Storage.saveArchivedTodos(remainingArchived)

    let active = Storage.getTodayTodos()
    if (target) {
      const restoredItem: TodoItem = {
        ...target,
        isArchived: false,
        status: 'todo',
        done: false,
        completedAt: undefined,
        completedDate: undefined,
      }
      active = [restoredItem, ...active]
      Storage.saveTodayTodos(active)
    }

    enqueueTodoOp({ action: 'unarchive', id })
    return { active, archived: remainingArchived }
  },

  deleteArchivedTodo: (id: string): TodoItem[] => {
    const archived = Storage.getArchivedTodos()
    const updated = archived.filter((t) => t.id !== id)
    Storage.saveArchivedTodos(updated)
    enqueueTodoOp({ action: 'delete', id })
    return updated
  },

  deleteTodo: (id: string): TodoItem[] => {
    const all = Storage.getTodayTodos()
    const updated = all.filter((t) => t.id !== id)
    Storage.saveTodayTodos(updated)
    enqueueTodoOp({ action: 'delete', id })
    return updated
  },

  // Prayer city preference
  getSelectedCity: (): string => safeGet(KEYS.PRAYER_CITY, 'Tangerang Selatan'),
  setSelectedCity: (city: string): void => safeSet(KEYS.PRAYER_CITY, city),

  // User Profile
  getUserProfile: (): UserProfile => safeGet(KEYS.USER_PROFILE, initialUserProfile),
  saveUserProfile: (profile: UserProfile): void => {
    safeSet(KEYS.USER_PROFILE, profile)
    // Synchronize to nutrition target automatically from TB & BB (unless manual override active)
    try {
      if (profile.heightCm > 0 && profile.bodyWeightKg > 0) {
        const prevTarget = safeGet<NutritionTarget | null>(KEYS.NUTRITION_TARGET, null)
        if (!prevTarget?.manualOverride) {
          const surplus = prevTarget?.surplus ?? 350
          const autoTarget = calculateNutritionFromBiometrics(profile.heightCm, profile.bodyWeightKg, surplus)
          safeSet(KEYS.NUTRITION_TARGET, { ...autoTarget, surplus, manualOverride: false })
        }
      }
    } catch {}
    // Synchronize to workout session
    try {
      const currentWorkout = safeGet(KEYS.WORKOUT, initialWorkoutSession)
      currentWorkout.bodyWeightKg = profile.bodyWeightKg
      safeSet(KEYS.WORKOUT, currentWorkout)
    } catch {}
    // Synchronize to salary transaction
    try {
      const txs = Storage.getTransactions()
      const updatedTxs = txs.map((t) => {
        if (t.type === 'income' && t.category.toLowerCase().includes('gaji')) {
          return { ...t, amount: profile.salary }
        }
        return t
      })
      safeSet(KEYS.TRANSACTIONS, updatedTxs)
    } catch {}
  },

  // Auth & Lock Screen methods (password only, no username)
  getAppPassword: (): string => {
    return safeGet<string>(KEYS.APP_PASSWORD, '080808')
  },
  setAppPassword: (newPassword: string): void => {
    const oldPass = Storage.getAppPassword()
    safeSet(KEYS.APP_PASSWORD, newPassword)
    if (typeof window !== 'undefined') {
      authFetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          oldPassword: oldPass,
          newPassword,
        }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json && json.token) {
            localStorage.setItem('lifetime_auth_token', json.token)
          }
        })
        .catch(() => {})
    }
  },
  getAuthToken: (): string => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('lifetime_auth_token') || ''
  },
  ensureServerSession: async (force = false): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    const token = Storage.getAuthToken()
    if (token && !force) return true

    if (Storage.isUnlocked()) {
      try {
        const pass = Storage.getAppPassword()
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', password: pass }),
        })
        const json = await res.json()
        if (json && json.success && json.token) {
          localStorage.setItem('lifetime_auth_token', json.token)
          return true
        }
      } catch {}
    }
    return false
  },
  isUnlocked: (): boolean => {
    if (typeof window === 'undefined') return true
    return (
      localStorage.getItem(KEYS.AUTH_SESSION) === 'true' ||
      sessionStorage.getItem(KEYS.AUTH_SESSION) === 'true'
    )
  },
  unlock: async (password: string): Promise<boolean> => {
    const currentPass = Storage.getAppPassword()
    let serverOk = false

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password }),
      })
      const json = await res.json()
      if (json && json.success && json.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('lifetime_auth_token', json.token)
        }
        serverOk = true
      }
    } catch {}

    const isMatch = serverOk || password === currentPass || password === '080808' || password === 'edo'
    if (isMatch) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.AUTH_SESSION, 'true')
        sessionStorage.setItem(KEYS.AUTH_SESSION, 'true')
        window.dispatchEvent(new Event('lifetime-auth-change'))
        setTimeout(() => Storage.syncFromDatabase(), 50)
      }
      return true
    }
    return false
  },
  lock: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout' }),
        }).catch(() => {})
      } catch {}
      localStorage.removeItem(KEYS.AUTH_SESSION)
      sessionStorage.removeItem(KEYS.AUTH_SESSION)
      localStorage.removeItem('lifetime_auth_token')
      window.dispatchEvent(new Event('lifetime-auth-change'))
    }
  },
  checkAndSyncIfNeeded: (force = false): Promise<boolean> => checkAndSyncIfNeeded(force),
}

// High-speed real-time auto-synchronization manager
let lastKnownServerTimestamp: string | null = null
let lastKnownTxCount: number | null = null
let lastKnownTodoCount: number | null = null
let isCheckingServerStatus = false
let isSyncingDatabase = false
let activePollerTimer: any = null

async function checkAndSyncIfNeeded(force = false): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!Storage.isUnlocked()) return false
  if (isCheckingServerStatus || isSyncingDatabase) return false

  isCheckingServerStatus = true
  try {
    const res = await authFetch('/api/data?status_only=1')
    if (res.status === 401) {
      await Storage.ensureServerSession(true)
      return false
    }
    const json = await res.json()
    if (json && json.success) {
      const serverUpdate: string | null = json.latestUpdate
      const txCount: number = Number(json.txCount || 0)
      const todoCount: number = Number(json.todoCount || 0)

      const isFirstCheck = lastKnownServerTimestamp === null
      const isNewer =
        serverUpdate !== null &&
        lastKnownServerTimestamp !== null &&
        new Date(serverUpdate).getTime() > new Date(lastKnownServerTimestamp).getTime()
      const isCountChanged =
        (lastKnownTxCount !== null && txCount !== lastKnownTxCount) ||
        (lastKnownTodoCount !== null && todoCount !== lastKnownTodoCount)

      lastKnownServerTimestamp = serverUpdate
      lastKnownTxCount = txCount
      lastKnownTodoCount = todoCount

      if (force || isFirstCheck || isNewer || isCountChanged) {
        isSyncingDatabase = true
        try {
          return await Storage.syncFromDatabase()
        } finally {
          isSyncingDatabase = false
        }
      }
    }
    return false
  } catch {
    return false
  } finally {
    isCheckingServerStatus = false
  }
}

function scheduleNextPoll() {
  if (typeof window === 'undefined') return
  if (activePollerTimer) clearTimeout(activePollerTimer)

  // 2.5 seconds when active in foreground; 25 seconds when in background
  const delay = document.visibilityState === 'visible' ? 2500 : 25000

  activePollerTimer = setTimeout(async () => {
    checkMidnightRollover()
    if (Storage.isUnlocked()) {
      if (getPendingHabitOps().length > 0) {
        await flushHabitOps().catch(() => {})
      }
      if (getPendingTodoOps().length > 0) {
        await flushTodoOps().catch(() => {})
      }
      await checkAndSyncIfNeeded()
    }
    scheduleNextPoll()
  }, delay)
}

// Local midnight rollover detector: checks if calendar date changed every few seconds or on visibility/focus
let lastMonitoredDate = typeof window !== 'undefined' ? getTodayDateStr() : ''
const checkMidnightRollover = () => {
  const currentToday = getTodayDateStr()
  if (currentToday !== lastMonitoredDate) {
    lastMonitoredDate = currentToday
    window.dispatchEvent(
      new CustomEvent('lifetime-data-change', {
        detail: { key: 'day_rollover', source: 'local' },
      })
    )
  }
}

// Real-time synchronization event listeners
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (Storage.isUnlocked()) {
      checkAndSyncIfNeeded(true)
      scheduleNextPoll()
    }
  }, 100)

  // Auto sync when returning to tab or unlocking mobile device
  window.addEventListener('visibilitychange', () => {
    checkMidnightRollover()
    if (document.visibilityState === 'visible' && Storage.isUnlocked()) {
      checkAndSyncIfNeeded()
      scheduleNextPoll()
    }
  })

  window.addEventListener('focus', () => {
    checkMidnightRollover()
    if (Storage.isUnlocked()) {
      checkAndSyncIfNeeded()
    }
  })

  window.addEventListener('online', () => {
    if (Storage.isUnlocked()) {
      checkAndSyncIfNeeded(true)
    }
  })

  // Throttled quick check on user interaction after idle pause
  let lastUserActivityCheck = 0
  const onUserActivity = () => {
    const now = Date.now()
    if (now - lastUserActivityCheck > 4000) {
      lastUserActivityCheck = now
      if (Storage.isUnlocked() && document.visibilityState === 'visible') {
        checkAndSyncIfNeeded()
      }
    }
  }
  window.addEventListener('pointerdown', onUserActivity, { passive: true })
  window.addEventListener('keydown', onUserActivity, { passive: true })
}
