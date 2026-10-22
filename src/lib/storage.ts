import type {
  DailyCapture,
  PrayerStatus,
  Transaction,
  BudgetCategory,
  WorkoutSession,
  Habit,
  NotionNote,
  TodoItem,
} from '@/types'

const getTodayDateStr = () => new Date().toISOString().split('T')[0]

// Initial seed data
const initialTodos: TodoItem[] = [
  { id: 'td-1', text: 'Tuntaskan review cashflow & alokasi budget', done: false, priority: 'high', category: 'Keuangan' },
  { id: 'td-2', text: 'Sholat Dzuhur tepat waktu di masjid', done: true, priority: 'high', category: 'Ibadah' },
  { id: 'td-3', text: 'Gym Push Day: Barbell Bench Press 80kg', done: false, priority: 'medium', category: 'Kebugaran' },
  { id: 'td-4', text: 'Target hidrasi 3 Liter air & suplemen creatine', done: false, priority: 'low', category: 'Kesehatan' },
]

const initialDailyCaptures: DailyCapture[] = [
  {
    id: 'dc-1',
    date: getTodayDateStr(),
    thoughts: 'Fokus tuntaskan dashboard Lifetime hari ini. Energi bagus setelah tidur cukup 7.5 jam.',
    plans: '1. Selesaikan fitur Sholat, Finance & Gym tracking\n2. Gym jam 17:00 (Push Day: Bench target 80kg)\n3. Review pengeluaran minggu ini',
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
    amount: 18500000,
    date: getTodayDateStr(),
    description: 'Transfer payroll bulanan',
    paymentMethod: 'BCA',
  },
  {
    id: 'tx-2',
    type: 'expense',
    category: 'Gym & Suplemen',
    amount: 450000,
    date: getTodayDateStr(),
    description: 'Monthly gym membership & locker',
    paymentMethod: 'QRIS',
  },
  {
    id: 'tx-3',
    type: 'expense',
    category: 'Makanan & Kopi',
    amount: 65000,
    date: getTodayDateStr(),
    description: 'Makan siang ayam geprek & es kopi susu',
    paymentMethod: 'QRIS',
  },
  {
    id: 'tx-4',
    type: 'expense',
    category: 'Belanja & Groceries',
    amount: 820000,
    date: '2026-10-21',
    description: 'Daging sapi, dada ayam fillet, telur, buah',
    paymentMethod: 'Debit Card',
  },
  {
    id: 'tx-5',
    type: 'expense',
    category: 'Transport & Bensin',
    amount: 150000,
    date: '2026-10-20',
    description: 'Isi Pertamax penuh',
    paymentMethod: 'QRIS',
  },
  {
    id: 'tx-6',
    type: 'income',
    category: 'Freelance & Side Project',
    amount: 3200000,
    date: '2026-10-18',
    description: 'Pelunasan landing page client',
    paymentMethod: 'Bank Mandiri',
  },
]

const initialBudgetCategories: BudgetCategory[] = [
  {
    id: 'b-1',
    name: 'Makanan & Kopi',
    spent: 2450000,
    limit: 4000000,
    icon: 'Coffee',
    color: 'sage',
  },
  {
    id: 'b-2',
    name: 'Gym, Suplemen & Nutrisi',
    spent: 1850000,
    limit: 2500000,
    icon: 'Dumbbell',
    color: 'navy',
  },
  {
    id: 'b-3',
    name: 'Belanja Bulanan',
    spent: 1200000,
    limit: 2000000,
    icon: 'ShoppingCart',
    color: 'info',
  },
  {
    id: 'b-4',
    name: 'Transport & Kendaraan',
    spent: 450000,
    limit: 1000000,
    icon: 'Car',
    color: 'warning',
  },
]

const initialWorkoutSession: WorkoutSession = {
  id: 'ws-1',
  date: getTodayDateStr(),
  splitName: 'Push Day A (Chest, Shoulders & Triceps)',
  completed: false,
  bodyWeightKg: 73.4,
  durationMinutes: 65,
  exercises: [
    {
      id: 'ex-1',
      name: 'Flat Barbell Bench Press',
      targetSets: 4,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 70, done: true },
        { setNumber: 2, reps: 8, weightKg: 80, done: true },
        { setNumber: 3, reps: 6, weightKg: 82.5, done: false },
        { setNumber: 4, reps: 8, weightKg: 75, done: false },
      ],
    },
    {
      id: 'ex-2',
      name: 'Incline Dumbbell Press (30°)',
      targetSets: 3,
      sets: [
        { setNumber: 1, reps: 10, weightKg: 26, done: false },
        { setNumber: 2, reps: 10, weightKg: 26, done: false },
        { setNumber: 3, reps: 8, weightKg: 28, done: false },
      ],
    },
    {
      id: 'ex-3',
      name: 'Cable Lateral Raises',
      targetSets: 4,
      sets: [
        { setNumber: 1, reps: 15, weightKg: 10, done: false },
        { setNumber: 2, reps: 12, weightKg: 12.5, done: false },
        { setNumber: 3, reps: 12, weightKg: 12.5, done: false },
        { setNumber: 4, reps: 15, weightKg: 10, done: false },
      ],
    },
    {
      id: 'ex-4',
      name: 'Tricep Rope Overhead Extension',
      targetSets: 3,
      sets: [
        { setNumber: 1, reps: 12, weightKg: 22.5, done: false },
        { setNumber: 2, reps: 12, weightKg: 25, done: false },
        { setNumber: 3, reps: 10, weightKg: 27.5, done: false },
      ],
    },
  ],
  notes: 'Fokus ke tempo turun lambat 3 detik di Bench Press. Pemanasan rotasi rotator cuff sebelum main beban berat.',
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
    content: '- Target Kalori: 2.300 kkal (Lean Bulk)\n- Protein: 160g (Dada ayam, telur, tempe, whey protein)\n- Karbohidrat: 260g (Beras merah, kentang, oat)\n- Lemak: 60g (Kuning telur, minyak zaitun, alpukat)',
    tag: 'Gym',
    pinned: true,
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Alokasi Tabungan & Investasi Q4 2026',
    content: '- Dana Darurat: 6x pengeluaran bulanan (Capai Rp 35.000.000)\n- Tabungan RDN Saham & Reksadana: Rutin sisihkan 30% dari pemasukan\n- Disiplin alokasi sebelum PR bench capai 90kg',
    tag: 'Rencana',
    pinned: false,
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
]

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

  getWorkoutSession: (): WorkoutSession => safeGet(KEYS.WORKOUT, initialWorkoutSession),
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
}
