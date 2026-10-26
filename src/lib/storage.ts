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
} from '@/types'

const getTodayDateStr = () => {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

// Initial seed data - clean empty slate
const initialTodos: TodoItem[] = []

const initialDailyCaptures: DailyCapture[] = []

const initialPrayerStatus: PrayerStatus = {
  date: getTodayDateStr(),
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
    id: 'sg-1',
    title: 'Dana Darurat (6x Operasional)',
    target: 12000000,
    current: 4500000,
    color: 'sage',
  },
  {
    id: 'sg-2',
    title: 'Investasi Saham & RDN Q4',
    target: 5000000,
    current: 2200000,
    color: 'navy',
  },
  {
    id: 'sg-3',
    title: 'Sepatu Gym & Sabuk Angkat Beban',
    target: 750000,
    current: 550000,
    color: 'info',
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

const initialWeeklyWeightLogs: WeeklyWeightLog[] = [
  { id: 'wl-1', weekLabel: 'Minggu 1 (6 - 12 Okt)', date: '2026-10-12', weightKg: 56.8, notes: 'Awal program clean bulk' },
  { id: 'wl-2', weekLabel: 'Minggu 2 (13 - 19 Okt)', date: '2026-10-19', weightKg: 57.2, notes: 'Surplus kalori konsisten' },
  { id: 'wl-3', weekLabel: 'Minggu 3 (20 - 26 Okt - Minggu Ini)', date: '2026-10-22', weightKg: 57.8, notes: 'Target protein 115g tercapai' },
]

const initialWorkoutSession: WorkoutSession = {
  id: 'ws-1',
  date: getTodayDateStr(),
  splitName: 'Push Day (Dada, Bahu & Triceps)',
  splitType: 'push',
  completed: false,
  skipped: false,
  bodyWeightKg: 57.8,
  durationMinutes: 55,
  exercises: [],
  notes: 'Target Clean Bulk ke 68 kg (TB: 168 cm). Target surplus kalori & protein teratur.',
}

const initialHabits: Habit[] = [
  {
    id: 'h-1',
    name: 'Minum Air 2.5 Liter',
    icon: 'Droplet',
    category: 'Kesehatan',
    streak: 0,
    completedToday: false,
    history: {},
  },
  {
    id: 'h-2',
    name: 'Sholat 5 Waktu Tepat Waktu',
    icon: 'Moon',
    category: 'Ibadah',
    streak: 0,
    completedToday: false,
    history: {},
  },
  {
    id: 'h-3',
    name: 'Workout / Gym 60 Menit',
    icon: 'Dumbbell',
    category: 'Fitness',
    streak: 0,
    completedToday: false,
    history: {},
  },
  {
    id: 'h-4',
    name: 'Baca Buku 15 Menit',
    icon: 'BookOpen',
    category: 'Mindset',
    streak: 0,
    completedToday: false,
    history: {},
  },
  {
    id: 'h-6',
    name: 'Tidur Sebelum Jam 23:00',
    icon: 'Clock',
    category: 'Recovery',
    streak: 0,
    completedToday: false,
    history: {},
  },
]

const initialNotionNotes: NotionNote[] = [
  {
    id: 'note-1',
    title: 'Arsitektur Personal Health & Wealth OS',
    content: '- Buat aplikasi all-in-one yang ringan, no bullshit, no ads\n- Harus ada Daily Capture di awal hari\n- Sholat tracker otomatis update waktu\n- Tracking pengeluaran cepat via shortcut\n- Gym progressive overload tracker dengan log beban & reps',
    tag: 'Ide',
    pinned: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'Target Nutrisi & Makronutrien Harian',
    content: '- Profil: BB 57.5 kg | TB 168 cm | BMI: 20.4 (Normal)\n- Target Clean Bulk: 68 kg (+10.5 kg otot)\n- Kalori Harian: ~2.350 kkal (surplus 250 kkal)\n- Target Protein: 115g - 120g (~2g/kg BB dari dada ayam, telur, tempe)\n- Budget Belanja Protein: Rp 500.000/bln',
    tag: 'Gym',
    pinned: true,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Alokasi Tabungan & Budget Gaji Rp 2.8 Juta',
    content: '- Gaji Pokok: Rp 2.800.000\n- Makanan & Nutrisi: Rp 1.100.000 (39%)\n- Kebutuhan Pokok & Protein: Rp 500.000 (18%)\n- Gym & Suplemen: Rp 300.000 (11%)\n- Transport/Bensin: Rp 250.000 (9%)\n- Tabungan / Dana Darurat: Rp 650.000 (23%)',
    tag: 'Rencana',
    pinned: false,
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
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
  PRAYER_CITY: 'lifetime_prayer_city',
  USER_PROFILE: 'lifetime_user_profile',
  APP_PASSWORD: 'lifetime_app_password',
  AUTH_SESSION: 'lifetime_auth_session',
  WEEKLY_WEIGHT_LOGS: 'lifetime_weekly_weight_logs',
  SAVINGS_GOALS: 'lifetime_savings_goals',
  MEAL_LOGS: 'lifetime_meal_logs',
  NUTRITION_TARGET: 'lifetime_nutrition_target',
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

function safeSet<T>(key: string, value: T, source: 'local' | 'neon_sync' = 'local'): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('lifetime-data-change', { detail: { key, source } }))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }

  // Background sync to Neon PostgreSQL database
  // Note: KEYS.TODOS is handled via granular /api/todos to prevent multi-device race conditions & overwrites
  if (key === KEYS.TODOS || key === KEYS.PRAYERS) {
    return
  }

  try {
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    }).catch(() => {})
  } catch {}
}

if (typeof window !== 'undefined') {
  try {
    const cleanDone = localStorage.getItem('daily_os_v3_clean_slate_done')
    if (!cleanDone) {
      localStorage.removeItem(KEYS.TRANSACTIONS)
      localStorage.removeItem(KEYS.TODOS)
      localStorage.removeItem(KEYS.DAILY_CAPTURES)
      localStorage.removeItem(KEYS.WEEKLY_WEIGHT_LOGS)
      localStorage.removeItem('lifetime_prayers_history')
      localStorage.removeItem('lifetime_deleted_tx_ids')
      localStorage.removeItem(KEYS.PRAYERS)

      localStorage.setItem(KEYS.PRAYERS, JSON.stringify(initialPrayerStatus))
      localStorage.setItem(KEYS.HABITS, JSON.stringify(initialHabits))
      localStorage.setItem(KEYS.BUDGETS, JSON.stringify(initialBudgetCategories))
      localStorage.setItem(KEYS.TRANSACTIONS, '[]')
      localStorage.setItem(KEYS.TODOS, '[]')
      localStorage.setItem(KEYS.DAILY_CAPTURES, '[]')
      localStorage.setItem(KEYS.WEEKLY_WEIGHT_LOGS, '[]')
      localStorage.setItem('daily_os_v3_clean_slate_done', 'true')
    }
  } catch {}
}

let lastBackgroundSyncTime = 0
let lastLocalPrayerToggleTime = 0

export const Storage = {
  syncFromDatabase: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    try {
      let changed = false

      // 1. Sync general store data from /api/data (excluding KEYS.TODOS)
      try {
        const res = await fetch('/api/data')
        const json = await res.json()
        if (json && json.success && json.data) {
          for (const [k, v] of Object.entries(json.data)) {
            if (k === KEYS.TODOS || k === KEYS.PRAYERS) continue
            if (v !== undefined && v !== null) {
              if (k === KEYS.TRANSACTIONS && Array.isArray(v)) {
                const deletedIds = new Set(safeGet<string[]>('lifetime_deleted_tx_ids', []))
                const cleanRemote = v.filter((item) => item && !deletedIds.has(item.id))
                const localList = Storage.getTransactions().filter((item) => !deletedIds.has(item.id))
                const remoteMap = new Map(cleanRemote.map((item) => [item.id, item]))
                const unsynced = localList.filter((item) => !remoteMap.has(item.id))
                const merged = [...unsynced, ...cleanRemote]
                const current = localStorage.getItem(k)
                const incoming = JSON.stringify(merged)
                if (current !== incoming) {
                  localStorage.setItem(k, incoming)
                  changed = true
                }
                if (unsynced.length > 0) {
                  fetch('/api/data', {
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
                  fetch('/api/data', {
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
                const remoteMap = new Map(v.map((item) => [item.weekLabel || item.id, item]))
                const unsynced = localList.filter((item) => !remoteMap.has(item.weekLabel || item.id))
                const merged = [...unsynced, ...v]
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
        const todoRes = await fetch('/api/todos')
        const todoJson = await todoRes.json()
        if (todoJson && todoJson.success && Array.isArray(todoJson.todos)) {
          const remoteTodos: TodoItem[] = todoJson.todos
          const deletedIds: string[] = Array.isArray(todoJson.deletedIds) ? todoJson.deletedIds : []
          const deletedSet = new Set(deletedIds)

          const localTodos = Storage.getTodayTodos()

          // Filter out any items locally that remote flagged as deleted
          const cleanLocal = localTodos.filter((t) => !deletedSet.has(t.id))

          const remoteMap = new Map<string, TodoItem>()
          for (const r of remoteTodos) {
            remoteMap.set(r.id, r)
          }

          // Detect any local todos created on this device that remote doesn't have yet
          const unsyncedLocal = cleanLocal.filter((t) => !remoteMap.has(t.id))

          // If this device has unsynced local todos, push them to the server so all devices receive them!
          if (unsyncedLocal.length > 0) {
            fetch('/api/todos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'sync_batch', todos: unsyncedLocal }),
            }).catch(() => {})
          }

          // Non-destructive union: unsynced local + remote items
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
        }
      } catch (todoErr) {
        console.warn('Could not sync todos from /api/todos:', todoErr)
      }

      // 3. Multi-device conflict-free sync for prayers from /api/prayers
      try {
        const prayerRes = await fetch('/api/prayers')
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

      if (changed) {
        window.dispatchEvent(new CustomEvent('lifetime-data-change', { detail: { source: 'neon_sync' } }))
      }
      return true
    } catch (e) {
      console.warn('Could not sync from Neon database:', e)
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
      fetch('/api/prayers', {
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
    const list = safeGet<Transaction[]>(KEYS.TRANSACTIONS, initialTransactions)
    return list.filter((t) => t && !['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5'].includes(t.id))
  },
  saveTransactions: (data: Transaction[]) => safeSet(KEYS.TRANSACTIONS, data),

  addTransaction: (tx: Omit<Transaction, 'id'>): Transaction => {
    const all = Storage.getTransactions()
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: tx.date || getTodayDateStr(),
      paymentMethod: tx.paymentMethod || 'QRIS',
    }
    const updated = [newTx, ...all]
    Storage.saveTransactions(updated)
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
      fetch('/api/prayers', {
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

  getWorkoutSession: (): WorkoutSession => {
    const ws = safeGet(KEYS.WORKOUT, initialWorkoutSession)
    const profile = Storage.getUserProfile()
    if (!ws.bodyWeightKg || ws.bodyWeightKg !== profile.bodyWeightKg) {
      ws.bodyWeightKg = profile.bodyWeightKg
    }
    return ws
  },
  saveWorkoutSession: (data: WorkoutSession) => safeSet(KEYS.WORKOUT, data),
  setWorkoutSplit: (splitType: WorkoutSplitType): WorkoutSession => {
    const current = Storage.getWorkoutSession()
    const splitNames: Record<WorkoutSplitType, string> = {
      push: 'Push Day (Dada, Bahu & Triceps)',
      pull: 'Pull Day (Punggung & Biceps)',
      legs: 'Legs Day (Kaki & Core)',
      rest: 'Rest Day (Istirahat / Pemulihan Otot)',
    }
    const updated: WorkoutSession = {
      ...current,
      splitType,
      splitName: splitNames[splitType] || 'Push Day',
      exercises: [],
      completed: false,
      skipped: splitType === 'rest',
    }
    Storage.saveWorkoutSession(updated)
    return updated
  },

  toggleWorkoutCompleted: (): WorkoutSession => {
    const current = Storage.getWorkoutSession()
    const nextCompleted = !current.completed
    const updated: WorkoutSession = {
      ...current,
      completed: nextCompleted,
      skipped: nextCompleted ? false : current.skipped,
    }
    Storage.saveWorkoutSession(updated)
    return updated
  },

  toggleWorkoutSkipped: (): WorkoutSession => {
    const current = Storage.getWorkoutSession()
    const updated: WorkoutSession = {
      ...current,
      skipped: !current.skipped,
    }
    Storage.saveWorkoutSession(updated)
    return updated
  },

  // Weekly Weight Logs (with automatic deduplication)
  getWeeklyWeightLogs: (): WeeklyWeightLog[] => {
    const raw = safeGet(KEYS.WEEKLY_WEIGHT_LOGS, initialWeeklyWeightLogs)
    // Deduplicate by normalized week label or date
    const map = new Map<string, WeeklyWeightLog>()
    for (const log of raw) {
      if (!log || !log.weekLabel) continue
      // Normalize: "Minggu 3 (20 - 26 Okt - Minggu Ini)" and "Minggu 3: 20 - 26 Okt 2026 (Minggu Ini)"
      const key = log.weekLabel.toLowerCase().includes('minggu 3')
        ? 'minggu-3'
        : log.weekLabel.toLowerCase().includes('minggu 1')
        ? 'minggu-1'
        : log.weekLabel.toLowerCase().includes('minggu 2')
        ? 'minggu-2'
        : log.weekLabel.toLowerCase().includes('minggu 4')
        ? 'minggu-4'
        : log.id
      map.set(key, log)
    }
    const deduped = Array.from(map.values())
    if (deduped.length !== raw.length && typeof window !== 'undefined') {
      Storage.saveWeeklyWeightLogs(deduped)
    }
    return deduped
  },
  saveWeeklyWeightLogs: (data: WeeklyWeightLog[]) => safeSet(KEYS.WEEKLY_WEIGHT_LOGS, data),

  addOrUpdateWeeklyWeight: (weekLabel: string, weightKg: number, notes?: string, customDate?: string): WeeklyWeightLog[] => {
    const logs = Storage.getWeeklyWeightLogs()
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
    const existingIndex = logs.findIndex((l) => norm(l.weekLabel) === norm(weekLabel))
    let updated: WeeklyWeightLog[]
    if (existingIndex >= 0) {
      updated = [...logs]
      updated[existingIndex] = {
        ...updated[existingIndex],
        weightKg,
        date: customDate || updated[existingIndex].date || getTodayDateStr(),
        notes: notes !== undefined ? notes : updated[existingIndex].notes,
      }
    } else {
      const newEntry: WeeklyWeightLog = {
        id: `wl-${Date.now()}`,
        weekLabel,
        date: customDate || getTodayDateStr(),
        weightKg,
        notes: notes || 'Catatan progresif clean bulk',
      }
      updated = [...logs, newEntry]
    }
    Storage.saveWeeklyWeightLogs(updated)
    const profile = Storage.getUserProfile()
    Storage.saveUserProfile({ ...profile, bodyWeightKg: weightKg })
    return updated
  },

  deleteWeeklyWeightLog: (id: string): WeeklyWeightLog[] => {
    const all = Storage.getWeeklyWeightLogs()
    const updated = all.filter((l) => l.id !== id)
    Storage.saveWeeklyWeightLogs(updated)
    return updated
  },

  updateWeeklyWeightLog: (id: string, updates: Partial<WeeklyWeightLog>): WeeklyWeightLog[] => {
    const all = Storage.getWeeklyWeightLogs()
    const updated = all.map((l) => (l.id === id ? { ...l, ...updates } : l))
    Storage.saveWeeklyWeightLogs(updated)
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
    const stored = safeGet<Habit[]>(KEYS.HABITS, initialHabits)
    // Filter out Creatine if present
    const filtered = stored.filter(
      (h) => h.id !== 'h-5' && !h.name.toLowerCase().includes('creatine')
    )
    if (filtered.length !== stored.length && typeof window !== 'undefined') {
      Storage.saveHabits(filtered)
    }
    return filtered
  },
  saveHabits: (data: Habit[]) => safeSet(KEYS.HABITS, data),

  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'completedToday' | 'history'>): Habit => {
    const all = Storage.getHabits()
    const newH: Habit = {
      ...habit,
      id: `h-${Date.now()}`,
      streak: 1,
      completedToday: true,
      history: { [getTodayDateStr()]: true },
    }
    const updated = [...all, newH]
    Storage.saveHabits(updated)
    return newH
  },

  deleteHabit: (id: string): Habit[] => {
    const all = Storage.getHabits()
    const updated = all.filter((h) => h.id !== id)
    Storage.saveHabits(updated)
    return updated
  },

  updateHabit: (id: string, updates: Partial<Habit>): Habit[] => {
    const all = Storage.getHabits()
    const updated = all.map((h) => (h.id === id ? { ...h, ...updates } : h))
    Storage.saveHabits(updated)
    return updated
  },

  toggleHabit: (habitId: string): Habit[] => {
    const all = Storage.getHabits()
    const today = getTodayDateStr()
    const updated = all.map((h) => {
      if (h.id !== habitId) return h
      const nextDone = !h.completedToday
      return {
        ...h,
        completedToday: nextDone,
        streak: nextDone ? h.streak + 1 : Math.max(0, h.streak - 1),
        history: { ...h.history, [today]: nextDone },
      }
    })
    Storage.saveHabits(updated)
    return updated
  },

  toggleHabitForDate: (habitId: string, date: string): Habit[] => {
    const all = Storage.getHabits()
    const today = getTodayDateStr()
    const updated = all.map((h) => {
      if (h.id !== habitId) return h
      const currentForDate = Boolean(h.history?.[date])
      const nextForDate = !currentForDate
      const newHistory = { ...h.history, [date]: nextForDate }
      const isToday = date === today
      return {
        ...h,
        completedToday: isToday ? nextForDate : h.completedToday,
        history: newHistory,
      }
    })
    Storage.saveHabits(updated)
    return updated
  },

  // Meal & Nutrition Tracker methods (Clean Bulking)
  getMealLogs: (): MealLog[] => {
    const list = safeGet<MealLog[]>(KEYS.MEAL_LOGS, initialMealLogs)
    const today = getTodayDateStr()
    let changed = false
    const normalized = list.map((m) => {
      // If meal was logged today in WIB but stamped with 2026-10-22 due to start-of-week selection bug, auto-heal to today
      if (m.date === '2026-10-22' && (m.id.includes('1792728') || m.id.includes('179273'))) {
        changed = true
        return { ...m, date: today }
      }
      return m
    })
    if (changed) {
      safeSet(KEYS.MEAL_LOGS, normalized)
    }
    return normalized
  },
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
    const fallback = calculateNutritionFromBiometrics(profile.heightCm, profile.bodyWeightKg)
    return safeGet(KEYS.NUTRITION_TARGET, fallback)
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
    const seen = new Set<string>()
    const deduped: TodoItem[] = []
    for (const t of list) {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id)
        deduped.push(t)
      }
    }
    return deduped
  },

  saveTodayTodos: (data: TodoItem[]) => {
    const seen = new Set<string>()
    const deduped: TodoItem[] = []
    for (const t of data) {
      if (t && t.id && !seen.has(t.id)) {
        seen.add(t.id)
        deduped.push(t)
      }
    }
    safeSet(KEYS.TODOS, deduped)
  },

  addTodo: (todo: Omit<TodoItem, 'id'>): TodoItem => {
    const all = Storage.getTodayTodos()
    const uniqueSuffix = Math.random().toString(36).substring(2, 7)
    const newTodo: TodoItem = {
      ...todo,
      createdAt: todo.createdAt || new Date().toISOString(),
      status: todo.status || (todo.done ? 'done' : 'todo'),
      id: `td-${Date.now()}-${uniqueSuffix}`,
    }
    const updated = [newTodo, ...all]
    Storage.saveTodayTodos(updated)

    // Atomic sync to Neon PostgreSQL
    if (typeof window !== 'undefined') {
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', todo: newTodo }),
      }).catch((err) => console.warn('Failed to sync new todo to server:', err))
    }

    return newTodo
  },

  updateTodo: (id: string, updates: Partial<TodoItem>): TodoItem[] => {
    const all = Storage.getTodayTodos()
    const updated = all.map((t) => {
      if (t.id === id) {
        const merged = { ...t, ...updates }
        if (updates.status) {
          merged.done = updates.status === 'done'
        } else if (updates.done !== undefined) {
          merged.status = updates.done ? 'done' : 'todo'
        }
        return merged
      }
      return t
    })
    Storage.saveTodayTodos(updated)
    return updated
  },

  toggleTodo: (id: string): TodoItem[] => {
    const all = Storage.getTodayTodos()
    let toggledDone = false
    const updated = all.map((t) => {
      if (t.id === id) {
        toggledDone = !t.done
        return {
          ...t,
          done: toggledDone,
          status: (toggledDone ? 'done' : 'todo') as TaskFlowStatus,
        }
      }
      return t
    })
    Storage.saveTodayTodos(updated)

    // Atomic sync to Neon PostgreSQL
    if (typeof window !== 'undefined') {
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_done', id, done: toggledDone }),
      }).catch((err) => console.warn('Failed to sync toggle todo to server:', err))
    }

    return updated
  },

  deleteTodo: (id: string): TodoItem[] => {
    const all = Storage.getTodayTodos()
    const updated = all.filter((t) => t.id !== id)
    Storage.saveTodayTodos(updated)

    // Atomic soft-delete sync to Neon PostgreSQL
    if (typeof window !== 'undefined') {
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id }),
      }).catch((err) => console.warn('Failed to sync delete todo to server:', err))
    }

    return updated
  },

  // Prayer city preference
  getSelectedCity: (): string => safeGet(KEYS.PRAYER_CITY, 'Tangerang Selatan'),
  setSelectedCity: (city: string): void => safeSet(KEYS.PRAYER_CITY, city),

  // User Profile
  getUserProfile: (): UserProfile => safeGet(KEYS.USER_PROFILE, initialUserProfile),
  saveUserProfile: (profile: UserProfile): void => {
    safeSet(KEYS.USER_PROFILE, profile)
    // Synchronize to nutrition target automatically from TB & BB
    try {
      if (profile.heightCm > 0 && profile.bodyWeightKg > 0) {
        const autoTarget = calculateNutritionFromBiometrics(profile.heightCm, profile.bodyWeightKg)
        safeSet(KEYS.NUTRITION_TARGET, autoTarget)
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
    return safeGet<string>(KEYS.APP_PASSWORD, 'edo')
  },
  setAppPassword: (newPassword: string): void => {
    safeSet(KEYS.APP_PASSWORD, newPassword)
  },
  isUnlocked: (): boolean => {
    if (typeof window === 'undefined') return true
    return (
      localStorage.getItem(KEYS.AUTH_SESSION) === 'true' ||
      sessionStorage.getItem(KEYS.AUTH_SESSION) === 'true'
    )
  },
  unlock: (password: string): boolean => {
    const currentPass = Storage.getAppPassword()
    if (password === currentPass) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.AUTH_SESSION, 'true')
        sessionStorage.setItem(KEYS.AUTH_SESSION, 'true')
        window.dispatchEvent(new Event('lifetime-auth-change'))
      }
      return true
    }
    return false
  },
  lock: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(KEYS.AUTH_SESSION)
      sessionStorage.removeItem(KEYS.AUTH_SESSION)
      window.dispatchEvent(new Event('lifetime-auth-change'))
    }
  },
}

// Auto sync from Neon PostgreSQL on client load and lifecycle events
if (typeof window !== 'undefined') {
  setTimeout(() => {
    Storage.syncFromDatabase()
  }, 100)

  // Auto sync when returning to tab or unlocking mobile device
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      Storage.syncFromDatabase()
    }
  })

  window.addEventListener('focus', () => {
    Storage.syncFromDatabase()
  })

  // Periodic background refresh every 30 seconds for live multi-device parity
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      Storage.syncFromDatabase()
    }
  }, 30000)
}
