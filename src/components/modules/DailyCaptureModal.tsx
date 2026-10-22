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
import { Button, Badge, ProgressBar } from '@/components/ui'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/60 backdrop-blur-xs transition-opacity"
        onClick={handleFinish}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-surface border border-border shadow-2xl overflow-hidden z-10 animate-scale-in">
        {/* Header Bar */}
        <div className="bg-navy px-4 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-sage shrink-0">
              <FontAwesomeIcon icon={faListCheck} className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-body font-heading font-bold text-white truncate sm:text-h4">
                To-Do List & Target Hari Ini
              </h2>
              <p className="text-[11px] text-slate-light truncate">
                Rencanakan prioritas agar harimu terarah & disiplin
              </p>
            </div>
          </div>
          <button
            onClick={handleFinish}
            className="h-8 w-8 rounded-lg text-slate-light hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors shrink-0"
            aria-label="Tutup"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Strip */}
        <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-border/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex-1">
            <div className="flex items-center justify-between text-caption font-medium mb-1">
              <span className="text-slate">Progress Agenda</span>
              <span className="font-mono text-navy font-bold">
                {completedCount}/{totalCount} Selesai ({percentage}%)
              </span>
            </div>
            <ProgressBar value={completedCount} max={totalCount || 1} size="sm" showLabel={false} color={percentage === 100 ? 'sage' : 'navy'} />
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick Add Form */}
          <form onSubmit={handleAdd} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tambah tugas (contoh: Bench press 80kg, Sholat berjamaah...)"
                className="flex-1 h-10 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy placeholder:text-slate-light focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 font-body"
                autoFocus
              />
              <Button type="submit" variant="primary" size="sm" className="shrink-0 gap-1.5 px-3">
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                <span>Tambah</span>
              </Button>
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate font-medium mr-1">Prioritas:</span>
              {(['high', 'medium', 'low'] as const).map((p) => {
                const label = p === 'high' ? 'Tinggi' : p === 'medium' ? 'Sedang' : 'Rendah'
                const isSelected = priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                      isSelected
                        ? p === 'high'
                          ? 'bg-rose-100 text-rose-800 font-semibold ring-1 ring-rose-400'
                          : p === 'medium'
                          ? 'bg-amber-100 text-amber-800 font-semibold ring-1 ring-amber-400'
                          : 'bg-emerald-100 text-emerald-800 font-semibold ring-1 ring-emerald-400'
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
            <span className="text-caption font-semibold uppercase tracking-wider text-slate block mb-1">
              Daftar Tugas Hari Ini:
            </span>

            {todos.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-xl">
                <p className="text-body-sm text-slate">Belum ada to-do list hari ini.</p>
                <p className="text-caption text-slate-light mt-0.5">Ketik rencana di atas lalu tekan Tambah.</p>
              </div>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    todo.done
                      ? 'bg-emerald-50/50 border-emerald-200/60'
                      : 'bg-surface border-border hover:border-slate/30'
                  }`}
                >
                  <div
                    onClick={() => onToggleTodo(todo.id)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                  >
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                        todo.done
                          ? 'bg-sage text-white shadow-xs'
                          : 'border-1.5 border-slate-300 bg-white hover:border-navy'
                      }`}
                    >
                      {todo.done && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                    </div>
                    <span
                      className={`text-body-sm font-medium truncate ${
                        todo.done ? 'line-through text-slate' : 'text-navy'
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {todo.priority && (
                      <Badge
                        variant={todo.priority === 'high' ? 'error' : todo.priority === 'medium' ? 'warning' : 'success'}
                        className="text-[9px] py-0 px-1.5 font-semibold uppercase"
                      >
                        {todo.priority === 'high' ? 'Tinggi' : todo.priority === 'medium' ? 'Sedang' : 'Rendah'}
                      </Badge>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteTodo(todo.id)}
                      className="text-slate-light hover:text-red-600 transition-colors p-1"
                      aria-label="Hapus tugas"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Optional Mind Dump Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowNotes(!showNotes)}
              className="text-caption text-slate hover:text-navy font-medium flex items-center gap-1.5 transition-colors"
            >
              <FontAwesomeIcon icon={faBrain} className="h-3 w-3 text-navy" />
              <span>{showNotes ? 'Sembunyikan Catatan Pikiran' : '+ Tambah Catatan Pikiran Pagi (Opsional)'}</span>
            </button>

            {showNotes && (
              <div className="mt-2.5 animate-slide-down">
                <textarea
                  rows={3}
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  placeholder="Tuangkan unek-unek atau evaluasi ide pagi ini..."
                  className="w-full p-3 rounded-xl border border-border bg-slate-50/60 text-body-sm text-navy placeholder:text-slate-light focus:outline-none focus:border-navy resize-none font-body"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 bg-surface border-t border-border flex items-center justify-end gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleFinish}>
            Tutup
          </Button>
          <Button variant="primary" size="sm" onClick={handleFinish} className="gap-1.5 font-semibold">
            <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-sage" />
            <span>Simpan Rencana</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
