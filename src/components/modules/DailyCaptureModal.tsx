'use client'

import { useState, useEffect, useId } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faListCheck,
  faPlus,
  faCheck,
  faTrashCan,
  faXmark,
  faBrain,
  faMoon,
  faSun,
  faBed,
  faClock,
  faWandMagicSparkles,
  faLightbulb,
  faPalette,
  faBriefcase,
  faDumbbell,
} from '@fortawesome/free-solid-svg-icons'
import { ProgressBar, showToast, ConfirmModal } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { TodoItem } from '@/types'

interface DailyCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  todos: TodoItem[]
  onToggleTodo: (id: string) => void
  onAddTodo: (text: string, priority?: 'high' | 'medium' | 'low') => void
  onDeleteTodo: (id: string) => void
  onSaveThoughts?: (
    thoughts: string,
    sleep?: { bedTime: string; wakeTime: string; hours: number }
  ) => void
}


interface RecommendationIdea {
  id: string
  category: 'kreatif' | 'kerja' | 'gym' | 'istirahat'
  label: string
  text: string
  priority: 'high' | 'medium' | 'low'
  badge: string
}

const DAILY_RECOMMENDATIONS: RecommendationIdea[] = [
  // 1. Kreatif & Edit Foto (Anime / Visual)
  {
    id: 'rec-cr-1',
    category: 'kreatif',
    label: 'Edit Anime Aesthetic',
    text: 'Edit visual foto anime aesthetic & poster typography',
    priority: 'high',
    badge: 'Foto & Edit',
  },
  {
    id: 'rec-cr-2',
    category: 'kreatif',
    label: 'Color Grading Foto',
    text: 'Eksperimen tone cinematic / dark moody pada foto',
    priority: 'medium',
    badge: 'Foto & Edit',
  },
  {
    id: 'rec-cr-3',
    category: 'kreatif',
    label: 'Kurasi Foto Minggu Ini',
    text: 'Pilih & kurasi 5 foto terbaik untuk diedit',
    priority: 'low',
    badge: 'Foto & Edit',
  },
  {
    id: 'rec-cr-4',
    category: 'kreatif',
    label: 'Layering Artwork Anime',
    text: 'Bikin layering foto blend dengan karakter anime visual',
    priority: 'high',
    badge: 'Foto & Edit',
  },
  // 2. Produktivitas & Kerja
  {
    id: 'rec-wk-1',
    category: 'kerja',
    label: 'Deep Work 45m',
    text: 'Sesi Deep Work 45 menit fokus tanpa distraksi HP',
    priority: 'high',
    badge: 'Fokus Kerja',
  },
  {
    id: 'rec-wk-2',
    category: 'kerja',
    label: 'Rapikan Prioritas',
    text: 'Review & rapikan 3 prioritas deliverable utama',
    priority: 'medium',
    badge: 'Fokus Kerja',
  },
  // 3. Gym & Nutrisi
  {
    id: 'rec-gm-1',
    category: 'gym',
    label: 'Push Day Workout',
    text: 'Latihan Push Day: Bench press, shoulder press & delts',
    priority: 'high',
    badge: 'Gym & Nutrisi',
  },
  {
    id: 'rec-gm-2',
    category: 'gym',
    label: 'Target Protein 116g',
    text: 'Penuhi asupan 116g protein clean bulk hari ini',
    priority: 'high',
    badge: 'Gym & Nutrisi',
  },
  // 4. Istirahat & Recovery
  {
    id: 'rec-sl-1',
    category: 'istirahat',
    label: 'Tidur Tepat Jam 23:00',
    text: 'Screen-off jam 22:30 & tidur sebelum jam 23:00',
    priority: 'high',
    badge: 'Recovery',
  },
  {
    id: 'rec-sl-2',
    category: 'istirahat',
    label: 'Jalan Santai Sore',
    text: 'Jalan santai 15 menit sore hari untuk segarkan pikiran',
    priority: 'low',
    badge: 'Recovery',
  },
]

function calculateSleep(bed: string, wake: string) {
  if (!bed || !wake) return { hours: 7, minutes: 30, totalHours: 7.5 }
  const [bh, bm] = bed.split(':').map(Number)
  const [wh, wm] = wake.split(':').map(Number)
  if (isNaN(bh) || isNaN(bm) || isNaN(wh) || isNaN(wm)) {
    return { hours: 7, minutes: 30, totalHours: 7.5 }
  }
  let bedMins = bh * 60 + bm
  let wakeMins = wh * 60 + wm
  if (wakeMins <= bedMins) {
    wakeMins += 24 * 60 // Lewat tengah malam
  }
  const diff = wakeMins - bedMins
  const hours = Math.floor(diff / 60)
  const minutes = diff % 60
  const totalHours = Math.round((diff / 60) * 10) / 10
  return { hours, minutes, totalHours }
}

export default function DailyCaptureModal(props: DailyCaptureModalProps) {
  if (!props.isOpen) return null
  return <DailyCaptureModalDialog {...props} />
}

function DailyCaptureModalDialog({
  onClose,
  todos,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onSaveThoughts,
}: DailyCaptureModalProps) {
  const [inputText, setInputText] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [showNotes, setShowNotes] = useState(false)
  const [activeRecCategory, setActiveRecCategory] = useState<'semua' | 'kreatif' | 'kerja' | 'gym' | 'istirahat'>('semua')
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null)

  // Sleep State (Loaded fresh when modal opens)
  const existingCapture = typeof window !== 'undefined' ? Storage.getTodayDailyCapture() : undefined
  const [sleepBedTime, setSleepBedTime] = useState(existingCapture?.sleepBedTime ?? '23:00')
  const [sleepWakeTime, setSleepWakeTime] = useState(existingCapture?.sleepWakeTime ?? '06:30')
  const [thoughts, setThoughts] = useState(existingCapture?.thoughts ?? '')

  const inputId = useId()

  useEffect(() => {
    Storage.syncBeforeAction()
  }, [])

  const sleepCalc = calculateSleep(sleepBedTime, sleepWakeTime)

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed) return
    onAddTodo(trimmed, priority)
    setInputText('')
  }

  const handleDismiss = () => {
    onClose()
  }

  const handleSaveAndFinish = () => {
    Storage.saveTodaySleep(sleepBedTime, sleepWakeTime, sleepCalc.totalHours)

    if (onSaveThoughts) {
      onSaveThoughts(thoughts.trim(), {
        bedTime: sleepBedTime,
        wakeTime: sleepWakeTime,
        hours: sleepCalc.totalHours,
      })
    }

    showToast(`Rekap tidur ${sleepCalc.hours}j ${sleepCalc.minutes}m & agenda tersimpan`, 'success')
    onClose()
  }

  const completedCount = todos.filter((t) => t.done).length
  const totalCount = todos.length
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/60 backdrop-blur-sm transition-opacity"
        onClick={handleDismiss}
      />

      {/* Android Material 3 Bottom Sheet on mobile / Dialog on desktop */}
      <div className="relative w-full max-w-lg max-h-[90dvh] flex flex-col rounded-t-[28px] sm:rounded-2xl bg-surface border border-border shadow-2xl z-10 animate-slide-up sm:animate-scale-in overflow-hidden">
        {/* Android Drag Handle (Mobile) */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Clean Header Bar */}
        <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-border/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8.5 w-8.5 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
              <FontAwesomeIcon icon={faListCheck} className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-body-sm sm:text-body font-heading font-bold text-navy">
                Agenda & Rekap Hari Ini
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate font-medium truncate">
                Tidur semalam & target prioritas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-navy bg-slate-100 px-2.5 py-1 rounded-full border border-border">
              {completedCount}/{totalCount} ({percentage}%)
            </span>
            <button
              onClick={handleDismiss}
              className="h-8 w-8 rounded-full text-slate hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 active:scale-90 cursor-pointer"
              aria-label="Tutup"
            >
              <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slim Progress Bar */}
        <div className="px-5 pt-2 pb-1 shrink-0">
          <ProgressBar
            value={completedCount}
            max={totalCount || 1}
            size="sm"
            showLabel={false}
            color={percentage === 100 ? 'sage' : 'navy'}
          />
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          {/* 1. Rekap Tidur Semalam (Promoted at Top) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faBed} className="h-3 w-3 text-navy" />
                </div>
                <span className="text-caption font-heading font-bold text-navy uppercase tracking-wider">
                  Rekap Tidur & Bangun
                </span>
              </div>
              <span
                className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  sleepCalc.totalHours >= 7
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : sleepCalc.totalHours >= 6
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                {sleepCalc.hours} Jam {sleepCalc.minutes > 0 ? `${sleepCalc.minutes}m` : ''} ({sleepCalc.totalHours >= 7 ? 'Optimal' : sleepCalc.totalHours >= 6 ? 'Cukup' : 'Kurang'})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="min-w-0">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate mb-1 truncate">
                  <FontAwesomeIcon icon={faMoon} className="text-navy text-[10px] shrink-0" />
                  <span className="truncate">Tidur Semalam</span>
                </label>
                <div className="relative flex items-center min-w-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 text-navy/60" />
                  </span>
                  <input
                    type="time"
                    value={sleepBedTime}
                    onChange={(e) => setSleepBedTime(e.target.value)}
                    className="w-full min-w-0 h-10 pl-8 pr-1.5 rounded-lg border border-border bg-white text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy box-border"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate mb-1 truncate">
                  <FontAwesomeIcon icon={faSun} className="text-amber-600 text-[10px] shrink-0" />
                  <span className="truncate">Bangun Pagi</span>
                </label>
                <div className="relative flex items-center min-w-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center justify-center">
                    <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5 text-navy/60" />
                  </span>
                  <input
                    type="time"
                    value={sleepWakeTime}
                    onChange={(e) => setSleepWakeTime(e.target.value)}
                    className="w-full min-w-0 h-10 pl-8 pr-1.5 rounded-lg border border-border bg-white text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy box-border"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Quick Add Task Form (NO autoFocus so mobile keyboard doesn't cover modal) */}
          <form onSubmit={handleAdd} className="space-y-2.5">
            {/* Smart Recommendation Chips (Anti-Bingung Hari Ini) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-border/80">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs text-navy" />
                  <span className="text-[11px] font-heading font-bold text-navy uppercase tracking-wider">
                    Bingung Hari Ini Mau Ngapain? Klik Rekomendasi:
                  </span>
                </div>
                <span className="text-[10px] text-slate font-medium hidden sm:inline">Tinggal klik langsung masuk input</span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide text-[11px]">
                {[
                  { id: 'semua', label: 'Semua' },
                  { id: 'kreatif', label: 'Foto & Edit', icon: faPalette },
                  { id: 'kerja', label: 'Kerja', icon: faBriefcase },
                  { id: 'gym', label: 'Gym', icon: faDumbbell },
                  { id: 'istirahat', label: 'Recovery', icon: faMoon },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveRecCategory(cat.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-caption font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      activeRecCategory === cat.id
                        ? 'bg-navy text-white shadow-2xs'
                        : 'bg-white border border-border/70 text-slate hover:text-navy hover:bg-slate-100'
                    }`}
                  >
                    {cat.icon && <FontAwesomeIcon icon={cat.icon} className="text-[10px]" />}
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Recommendation Buttons Grid */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {DAILY_RECOMMENDATIONS.filter(
                  (r) => activeRecCategory === 'semua' || r.category === activeRecCategory
                ).map((rec) => (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => {
                      setInputText(rec.text)
                      setPriority(rec.priority)
                      showToast(`Rekomendasi "${rec.label}" dimasukkan ke input target!`, 'info')
                    }}
                    className="group px-2.5 py-1.5 rounded-lg border border-border/80 bg-white hover:border-navy hover:bg-navy/5 text-left transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                    title="Klik untuk memasukkan ide ini ke input tugas"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-navy/60 group-hover:bg-navy" />
                    <span className="text-caption font-semibold text-navy">
                      {rec.label}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase px-1.5 py-0.2 rounded bg-slate-100">
                      {rec.priority === 'high' ? 'Tinggi' : 'Sedang'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <label htmlFor={inputId} className="text-caption font-bold uppercase tracking-wider text-slate block">
              Tambah Target Hari Ini
            </label>
            <div className="flex gap-2">
              <input
                id={inputId}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Klik di sini untuk ketik tugas baru..."
                className="flex-1 h-11 px-3.5 rounded-xl border border-border bg-surface text-body-sm text-navy placeholder:text-slate focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 font-body"
              />
              <button
                type="submit"
                className="h-11 px-4 rounded-xl bg-navy text-white hover:bg-navy-hover font-heading font-bold text-body-sm active:scale-95 transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                <span>Tambah</span>
              </button>
            </div>

            {/* Priority Selector Pills */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate font-medium">Prioritas:</span>
              {(['high', 'medium', 'low'] as const).map((p) => {
                const label = p === 'high' ? 'Tinggi' : p === 'medium' ? 'Sedang' : 'Rendah'
                const isSelected = priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? p === 'high'
                          ? 'bg-red-600 text-white shadow-2xs'
                          : p === 'medium'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </form>

          {/* 3. List of Tasks */}
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-caption font-bold uppercase tracking-wider text-slate block mb-1">
              Daftar Tugas Hari Ini ({todos.length})
            </span>

            {todos.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-xl">
                <p className="text-body-sm font-medium text-navy">Belum ada to-do list hari ini.</p>
                <p className="text-caption text-slate mt-0.5">Ketik rencana di atas lalu tekan Tambah.</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    todo.done
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-surface border-border hover:border-slate/40'
                  }`}
                >
                  <div
                    onClick={() => onToggleTodo(todo.id)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                  >
                    <div
                      className={`h-5 w-5 rounded flex items-center justify-center shrink-0 transition-all ${
                        todo.done
                          ? 'bg-navy text-white shadow-xs'
                          : 'border-1.5 border-slate-400 bg-white hover:border-navy'
                      }`}
                    >
                      {todo.done && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                    </div>
                    <span
                      className={`text-body-sm font-semibold truncate ${
                        todo.done ? 'line-through text-slate opacity-75' : 'text-navy'
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {todo.priority && (
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                          todo.priority === 'high'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : todo.priority === 'medium'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {todo.priority === 'high' ? 'Tinggi' : todo.priority === 'medium' ? 'Sedang' : 'Rendah'}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setTodoToDelete(todo.id)}
                      className="h-7 w-7 rounded-lg text-slate hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center active:scale-90 cursor-pointer"
                      aria-label="Hapus tugas"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 4. Optional Mind Dump Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-caption text-slate hover:text-navy font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faBrain} className="h-3 w-3 text-navy" />
              <span>{showNotes ? 'Sembunyikan Catatan Pikiran' : '+ Tambah Catatan Pikiran Pagi'}</span>
            </button>

            {showNotes && (
              <div className="mt-2.5 animate-slide-down">
                <textarea
                  rows={3}
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  placeholder="Tuangkan evaluasi atau unek-unek pagi ini..."
                  className="w-full p-3 rounded-xl border border-border bg-slate-50 text-body-sm text-navy placeholder:text-slate focus:outline-none focus:border-navy resize-none font-body"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer (Always Visible) */}
        <div className="px-5 py-3 bg-surface border-t border-border flex items-center justify-end gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleDismiss}
            className="h-9.5 px-4 rounded-xl text-slate hover:text-navy hover:bg-slate-100 font-heading font-semibold text-body-sm transition-all cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleSaveAndFinish}
            className="h-9.5 px-4 rounded-xl bg-navy text-white hover:bg-navy-hover font-heading font-bold text-body-sm active:scale-95 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-white" />
            <span>Simpan Rencana</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!todoToDelete}
        onClose={() => setTodoToDelete(null)}
        onConfirm={() => {
          if (todoToDelete) {
            onDeleteTodo(todoToDelete)
            setTodoToDelete(null)
          }
        }}
        title="Hapus Target To-Do?"
        description="Target tugas ini akan dihapus dari daftar agenda hari ini."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  )
}
