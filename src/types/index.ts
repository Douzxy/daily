export interface TodoItem {
  id: string
  text: string
  done: boolean
  priority?: 'high' | 'medium' | 'low'
  category?: string
  time?: string
}

export interface DailyCapture {
  id: string
  date: string
  thoughts: string
  plans: string
  priority?: 'low' | 'medium' | 'high'
  mood?: 'energetic' | 'calm' | 'tired' | 'focused' | 'stressed'
  sleepBedTime?: string // Jam tidur semalam, misal "23:00"
  sleepWakeTime?: string // Jam bangun pagi ini, misal "06:30"
  sleepHours?: number // Total jam tidur, misal 7.5
  todos?: TodoItem[]
  createdAt: string
}

export type PrayerName = 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'

export interface PrayerStatus {
  date: string
  prayers: Record<PrayerName, boolean>
  streak: number
  location?: string
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  category: string
  amount: number
  date: string
  description: string
  paymentMethod?: string
}

export interface BudgetCategory {
  id: string
  name: string
  spent: number
  limit: number
  icon: string
  color: string
}

export interface ExerciseSet {
  setNumber: number
  reps: number
  weightKg: number
  done: boolean
}

export interface ExerciseItem {
  id: string
  name: string
  targetSets: number
  sets: ExerciseSet[]
}

export type WorkoutSplitType = 'push' | 'pull' | 'legs' | 'rest'

export interface WorkoutSession {
  id: string
  date: string
  splitName: string
  splitType?: WorkoutSplitType
  exercises: ExerciseItem[]
  completed: boolean
  skipped?: boolean
  durationMinutes?: number
  bodyWeightKg?: number
  notes?: string
}

export interface WeeklyWeightLog {
  id: string
  weekLabel: string
  date: string
  weightKg: number
  notes?: string
}

export interface Habit {
  id: string
  name: string
  icon: string
  category: string
  streak: number
  completedToday: boolean
  history: Record<string, boolean>
}

export interface NotionNote {
  id: string
  title: string
  content: string
  tag: 'Ide' | 'Kerja' | 'Gym' | 'Pribadi' | 'Rencana'
  pinned: boolean
  updatedAt: string
}

export interface UserProfile {
  name: string
  email: string
  salary: number
  bodyWeightKg: number
  heightCm: number
  targetWeightKg: number
  city: string
}
