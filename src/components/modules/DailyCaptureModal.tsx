'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faListCheck,
  faPlus,
  faCheck,
  faTrashCan,
  faXmark,
  faBrain,
} from '@fortawesome/free-solid-svg-icons'
import { ProgressBar } from '@/components/ui'
import type { TodoItem } from '@/types'

interface DailyCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  todos: TodoItem[]
  onToggleTodo: (id: string) => void
  onAddTodo: (text: string, priority?: 'high' | 'medium' | 'low') => void
  onDeleteTodo: (id: string) => void
  onSaveThoughts?: (thoughts: string) => void
}

export default function DailyCaptureModal({
  isOpen,
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
  const [thoughts, setThoughts] = useState('')

  if (!isOpen) return null

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputText.trim()) return
    onAddTodo(inputText.trim(), priority)
    setInputText('')
  }

  const handleFinish = () => {
    if (thoughts.trim() && onSaveThoughts) {
      onSaveThoughts(thoughts.trim())
    }
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
        onClick={handleFinish}
      />

      {/* Android Material 3 Bottom Sheet on mobile / Dialog on desktop */}
      <div className="relative w-full max-w-lg max-h-[90dvh] flex flex-col rounded-t-[28px] sm:rounded-2xl bg-surface border border-border shadow-2xl z-10 animate-slide-up sm:animate-scale-in overflow-hidden">
        {/* Android Drag Handle (Mobile) */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.2 rounded-full bg-slate-300" />
        </div>

        {/* Clean Header Bar (Android Style) */}
        <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-border/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8.5 w-8.5 rounded-xl bg-navy text-white flex items-center justify-center shrink-0 shadow-xs">
              <FontAwesomeIcon icon={faListCheck} className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-body font-heading font-bold text-navy truncate">
                Agenda Hari Ini
              </h2>
              <p className="text-[11px] text-slate font-medium">
                Target & prioritas harian
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-navy bg-slate-100 px-2.5 py-1 rounded-full border border-border">
              {completedCount}/{totalCount} ({percentage}%)
            </span>
            <button
              onClick={handleFinish}
              className="h-8 w-8 rounded-full text-slate hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 active:scale-90"
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
          {/* Quick Add Form */}
          <form onSubmit={handleAdd} className="space-y-2.5">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ketik tugas baru..."
                className="flex-1 h-11 px-3.5 rounded-xl border border-border bg-surface text-body-sm text-navy placeholder:text-slate focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 font-body"
                autoFocus
              />
              <button
                type="submit"
                className="h-11 px-4 rounded-xl bg-navy text-white hover:bg-navy-hover font-heading font-bold text-body-sm active:scale-95 transition-all shadow-xs shrink-0 flex items-center gap-1.5"
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
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
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

          {/* List of Tasks */}
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
                      onClick={() => onDeleteTodo(todo.id)}
                      className="h-7 w-7 rounded-lg text-slate hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center active:scale-90"
                      aria-label="Hapus tugas"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Optional Mind Dump Section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-caption text-slate hover:text-navy font-semibold flex items-center gap-1.5 transition-colors"
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
            onClick={handleFinish}
            className="h-9.5 px-4 rounded-xl text-slate hover:text-navy hover:bg-slate-100 font-heading font-semibold text-body-sm transition-all"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="h-9.5 px-4 rounded-xl bg-navy text-white hover:bg-navy-hover font-heading font-bold text-body-sm active:scale-95 transition-all shadow-xs flex items-center gap-1.5"
          >
            <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-white" />
            <span>Simpan Rencana</span>
          </button>
        </div>
      </div>
    </div>
  )
}
