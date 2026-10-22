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
} from '@/types'

const getTodayDateStr = () => new Date().toISOString().split('T')[0]

// Initial seed data
const initialTodos: TodoItem[] = [
  { id: 'td-1', text: 'Tuntaskan review cashflow gaji Rp 2.8jt & alokasi budget bulanan', done: false, priority: 'high', category: 'Keuangan' },
  { id: 'td-2', text: 'Sholat Dzuhur tepat waktu di masjid', done: true, priority: 'high', category: 'Ibadah' },
  { id: 'td-3', text: 'Gym Push Day: Barbell Bench Press target 50kg (BB 57.5kg)', done: false, priority: 'medium', category: 'Kebugaran' },
  { id: 'td-4', text: 'Target nutrisi clean bulk: protein 115g & hidrasi 2.5 Liter', done: false, priority: 'low', category: 'Kesehatan' },
]

const initialDailyCaptures: DailyCapture[] = [
  {
    id: 'dc-1',
    date: getTodayDateStr(),
    thoughts: 'Fokus tuntaskan dashboard Personal OS hari ini. Energi bagus setelah tidur cukup 7.5 jam.',
    plans: '1. Catat pengeluaran harian dari gaji Rp 2.800.000\n2. Gym sore target Bench 50kg (BB 57.5kg, TB 168cm)\n3. Sholat 5 waktu berjamaah',
    priority: 'high',
    mood: 'focused',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dc-0',
    date: '2026-10-21',
    thoughts: 'Banyak ide baru buat automasi workflow kerja. Perlu bikin checklist Notion yang lebih terstruktur.',
    plans: '1. Beli whey protein isolat\n2. Selesaikan dokumen arsitektur\n3. Sholat berjamaah di masjid minimal Maghrib & Isya',
    priority: 'medium',
    mood: 'energetic',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

const initialPrayerStatus: PrayerStatus = {
  date: getTodayDateStr(),
  prayers: {
    subuh: true,
    dzuhur: true,
    ashar: false,
    maghrib: false,
    isya: false,
  },
  streak: 14,
}

const initialTransactions: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    category: 'Gaji Pokok',
    amount: 2800000,
    date: getTodayDateStr(),
    description: 'Transfer payroll bulanan',
    paymentMethod: 'BCA',
  },
  {
    id: 'tx-2',
    type: 'expense',
    category: 'Gym & Suplemen',
    amount: 150000,
    date: getTodayDateStr(),
    description: 'Monthly gym membership & locker',
    paymentMethod: 'QRIS',
  },
  {
    id: 'tx-3',
    type: 'expense',
    category: 'Makanan & Kopi',
    amount: 28000,
    date: getTodayDateStr(),
    description: 'Makan siang ayam & es kopi',
    paymentMethod: 'QRIS',
  },
  {
    id: 'tx-4',
    type: 'expense',
    category: 'Belanja & Groceries',
    amount: 95000,
    date: '2026-10-21',
    description: 'Telur 1 tray, tempe, dada ayam fillet',
    paymentMethod: 'Debit Card',
  },
  {
    id: 'tx-5',
    type: 'expense',
    category: 'Transport & Bensin',
    amount: 40000,
    date: '2026-10-20',
    description: 'Isi Pertalite motor',
    paymentMethod: 'QRIS',
  },
]

const initialBudgetCategories: BudgetCategory[] = [
  {
    id: 'b-1',
    name: 'Makanan & Nutrisi',
    spent: 580000,
    limit: 1100000,
    icon: 'Coffee',
    color: 'sage',
  },
  {
    id: 'b-2',
    name: 'Belanja Pokok & Protein',
    spent: 275000,
    limit: 500000,
    icon: 'ShoppingCart',
    color: 'info',
  },
  {
    id: 'b-3',
    name: 'Gym, Suplemen & Nutrisi',
    spent: 180000,
    limit: 300000,
    icon: 'Dumbbell',
    color: 'navy',
  },
  {
    id: 'b-4',
    name: 'Transport & Kendaraan',
    spent: 95000,
    limit: 250000,
    icon: 'Car',
    color: 'warning',
  },
]

const initialWorkoutSession: WorkoutSession = {
  id: 'ws-1',
  date: getTodayDateStr(),
  splitName: 'Push Day A (Chest, Shoulders & Triceps)',
  completed: false,
  bodyWeightKg: 57.5,
  durationMinutes: 55,
  exercises: [
    {
      id: 'ex-1',
      name: 'Flat Barbell Bench Press',
      targetSets: 4,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 40, done: true },
        { setNumber: 2, reps: 8, weightKg: 45, done: true },
        { setNumber: 3, reps: 6, weightKg: 50, done: false },
        { setNumber: 4, reps: 8, weightKg: 42.5, done: false },
      ],
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press (30°)',
      targetSets: 3,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 14, done: false },
        { setNumber: 2, reps: 10, weightKg: 16, done: false },
        { setNumber: 3, reps: 8, weightKg: 16, done: false },
      ],
    },
    {
      id: 'ex-3',
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
      id: 'ex-4',
      name: 'Tricep Rope Overhead Extension',
      targetSets: 3,
      sets: [
        { setNumber: 1, reps: 12, weightKg: 15, done: false },
        { setNumber: 2, reps: 12, weightKg: 17.5, done: false },
        { setNumber: 3, reps: 10, weightKg: 17.5, done: false },
      ],
    },
  ],
  notes: 'Target Clean Bulk ke 62 kg (TB: 168 cm, BMI: 20.4). Target kalori 2.350 kkal & protein 115g/hari.',
}

const initialHabits: Habit[] = [
  {
    id: 'h-1',
    name: 'Minum Air 2.5 Liter',
    icon: 'Droplet',
    category: 'Kesehatan',
    streak: 18,
    completedToday: true,
    history: {},
  },
  {
    id: 'h-2',
    name: 'Sholat 5 Waktu Tepat Waktu',
    icon: 'Moon',
    category: 'Ibadah',
    streak: 14,
    completedToday: false,
    history: {},
  },
  {
    id: 'h-3',
    name: 'Workout / Gym 60 Menit',
    icon: 'Dumbbell',
    category: 'Fitness',
    streak: 5,
    completedToday: false,
    history: {},
  },
  {
    id: 'h-4',
    name: 'Baca Buku 15 Menit',
    icon: 'BookOpen',
    category: 'Mindset',
    streak: 9,
    completedToday: true,
    history: {},
  },
  {
    id: 'h-5',
    name: 'Creatine Monohydrate 5g',
    icon: 'Zap',
    category: 'Nutrisi',
    streak: 22,
    completedToday: true,
    history: {},
  },
  {
    id: 'h-6',
    name: 'Tidur Sebelum Jam 23:00',
    icon: 'Clock',
    category: 'Recovery',
    streak: 4,
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
    content: '- Profil: BB 57.5 kg | TB 168 cm | BMI: 20.4 (Normal)\n- Target Clean Bulk: 62 kg (+4.5 kg otot)\n- Kalori Harian: ~2.350 kkal (surplus 250 kkal)\n- Target Protein: 115g - 120g (~2g/kg BB dari dada ayam, telur, tempe)\n- Budget Belanja Protein: Rp 500.000/bln',
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
  targetWeightKg: 62.0,
  city: 'DKI Jakarta',
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

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent('lifetime-data-change', { detail: { key } }))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

export const Storage = {
  getDailyCaptures: (): DailyCapture[] => safeGet(KEYS.DAILY_CAPTURES, initialDailyCaptures),
  saveDailyCaptures: (data: DailyCapture[]) => safeSet(KEYS.DAILY_CAPTURES, data),

  addDailyCapture: (capture: Omit<DailyCapture, 'id' | 'createdAt'>): DailyCapture => {
    const all = Storage.getDailyCaptures()
    const newEntry: DailyCapture = {
      ...capture,
      id: `dc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    const updated = [newEntry, ...all]
    Storage.saveDailyCaptures(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${KEYS.HAS_CAPTURED_TODAY}_${capture.date}`, 'true')
    }
    return newEntry
  },

  hasCapturedToday: (): boolean => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(`${KEYS.HAS_CAPTURED_TODAY}_${getTodayDateStr()}`) === 'true'
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
        streak: stored?.streak ?? 14,
      }
      safeSet(KEYS.PRAYERS, fresh)
      return fresh
    }
    return stored
  },

  savePrayerStatus: (data: PrayerStatus) => safeSet(KEYS.PRAYERS, data),

  togglePrayer: (prayer: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'): PrayerStatus => {
    const current = Storage.getPrayerStatus()
    const updatedPrayers = {
      ...current.prayers,
      [prayer]: !current.prayers[prayer],
    }
    const allCompleted = Object.values(updatedPrayers).every(Boolean)
    const updated: PrayerStatus = {
      ...current,
      prayers: updatedPrayers,
      streak: allCompleted ? current.streak + 1 : current.streak,
    }
    Storage.savePrayerStatus(updated)
    return updated
  },

  getTransactions: (): Transaction[] => safeGet(KEYS.TRANSACTIONS, initialTransactions),
  saveTransactions: (data: Transaction[]) => safeSet(KEYS.TRANSACTIONS, data),

  addTransaction: (tx: Omit<Transaction, 'id'>): Transaction => {
    const all = Storage.getTransactions()
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    }
    const updated = [newTx, ...all]
    Storage.saveTransactions(updated)
    return newTx
  },

  deleteTransaction: (id: string): void => {
    const all = Storage.getTransactions()
    Storage.saveTransactions(all.filter((t) => t.id !== id))
  },

  getBudgets: (): BudgetCategory[] => safeGet(KEYS.BUDGETS, initialBudgetCategories),
  saveBudgets: (data: BudgetCategory[]) => safeSet(KEYS.BUDGETS, data),

  getWorkoutSession: (): WorkoutSession => {
    const ws = safeGet(KEYS.WORKOUT, initialWorkoutSession)
    const profile = Storage.getUserProfile()
    if (!ws.bodyWeightKg || ws.bodyWeightKg !== profile.bodyWeightKg) {
      ws.bodyWeightKg = profile.bodyWeightKg
    }
    return ws
  },
  saveWorkoutSession: (data: WorkoutSession) => safeSet(KEYS.WORKOUT, data),

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

  getHabits: (): Habit[] => safeGet(KEYS.HABITS, initialHabits),
  saveHabits: (data: Habit[]) => safeSet(KEYS.HABITS, data),

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

  // Today's To-Do List methods
  getTodayTodos: (): TodoItem[] => safeGet(KEYS.TODOS, initialTodos),
  saveTodayTodos: (data: TodoItem[]) => safeSet(KEYS.TODOS, data),

  addTodo: (todo: Omit<TodoItem, 'id'>): TodoItem => {
    const all = Storage.getTodayTodos()
    const newTodo: TodoItem = {
      ...todo,
      id: `td-${Date.now()}`,
    }
    const updated = [newTodo, ...all]
    Storage.saveTodayTodos(updated)
    return newTodo
  },

  toggleTodo: (id: string): TodoItem[] => {
    const all = Storage.getTodayTodos()
    const updated = all.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    Storage.saveTodayTodos(updated)
    return updated
  },

  deleteTodo: (id: string): TodoItem[] => {
    const all = Storage.getTodayTodos()
    const updated = all.filter((t) => t.id !== id)
    Storage.saveTodayTodos(updated)
    return updated
  },

  // Prayer city preference
  getSelectedCity: (): string => safeGet(KEYS.PRAYER_CITY, 'DKI Jakarta'),
  setSelectedCity: (city: string): void => safeSet(KEYS.PRAYER_CITY, city),

  // User Profile
  getUserProfile: (): UserProfile => safeGet(KEYS.USER_PROFILE, initialUserProfile),
  saveUserProfile: (profile: UserProfile): void => {
    safeSet(KEYS.USER_PROFILE, profile)
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
