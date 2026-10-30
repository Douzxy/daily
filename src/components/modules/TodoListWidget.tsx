'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faListCheck,
  faPlus,
  faCheck,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, Button, ProgressBar, ConfirmModal } from '@/components/ui'
import type { TodoItem } from '@/types'

interface TodoListWidgetProps {
  todos: TodoItem[]
  onToggleTodo: (id: string) => void
  onAddTodo: (text: string, priority?: 'high' | 'medium' | 'low') => void
  onDeleteTodo: (id: string) => void
  onOpenModal: () => void
}

export default function TodoListWidget({
  todos,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onOpenModal,
}: TodoListWidgetProps) {
  const [quickInput, setQuickInput] = useState('')
  const [deleteConfirmTodo, setDeleteConfirmTodo] = useState<TodoItem | null>(null)

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickInput.trim()) return
    onAddTodo(quickInput.trim(), 'medium')
    setQuickInput('')
  }

  const completed = todos.filter((t) => t.done).length
  const total = todos.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <Card className="relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-xs">
            <FontAwesomeIcon icon={faListCheck} className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy">
                Target & To-Do Hari Ini
              </h3>
              <Badge variant={pct === 100 ? 'success' : 'navy'} className="text-[10px] py-0.5 px-2 shrink-0">
                {completed}/{total} Tuntas
              </Badge>
            </div>
            <p className="text-caption text-slate mt-0.5">
              Agenda tindakan utama agar hari tetap disiplin & terkontrol
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenModal}
          className="gap-1.5 self-start sm:self-auto shrink-0 shadow-xs"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
          <span>Tambah</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-border/70">
        <div className="flex items-center justify-between text-caption font-medium mb-1.5">
          <span className="text-slate">Kedisiplinan Eksekusi Rencana</span>
          <span className="font-mono text-navy font-bold">{pct}% Selesai</span>
        </div>
        <ProgressBar value={completed} max={total || 1} size="sm" showLabel={false} color={pct === 100 ? 'sage' : 'navy'} />
      </div>

      {/* Quick Add Input */}
      <form onSubmit={handleQuickAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder="Ketik tugas baru & tekan Tambah..."
          className="flex-1 h-9 px-3 rounded-lg border border-border bg-surface text-body-sm text-navy placeholder:text-slate-light focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy font-body"
        />
        <Button type="submit" variant="secondary" size="sm" className="gap-1 px-3 shrink-0">
          <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
          <span>Tambah</span>
        </Button>
      </form>

      {/* Task List */}
      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-border rounded-xl">
            <p className="text-body-sm text-slate">Belum ada to-do list hari ini.</p>
            <p className="text-caption text-slate-light mt-0.5">Ketik rencana di atas untuk memulai hari dengan teratur.</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
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
                  className={`h-4.5 w-4.5 rounded flex items-center justify-center shrink-0 transition-all ${
                    todo.done
                      ? 'bg-navy text-white shadow-xs'
                      : 'border-1.5 border-slate-400 bg-white group-hover:border-navy'
                  }`}
                >
                  {todo.done && <FontAwesomeIcon icon={faCheck} className="text-[10px]" />}
                </div>
                <span
                  className={`text-body-sm font-semibold wrap-break-word ${
                    todo.done ? 'line-through text-slate opacity-75' : 'text-navy'
                  }`}
                >
                  {todo.text}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                {todo.priority && (
                  <Badge
                    variant={todo.priority === 'high' ? 'error' : todo.priority === 'medium' ? 'warning' : 'success'}
                    className="text-[9px] py-0 px-1.5 uppercase font-semibold"
                  >
                    {todo.priority === 'high' ? 'Tinggi' : todo.priority === 'medium' ? 'Sedang' : 'Rendah'}
                  </Badge>
                )}
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTodo(todo)}
                  className="text-slate-light hover:text-red-600 transition-colors p-1 cursor-pointer"
                  aria-label="Hapus tugas"
                >
                  <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Delete Todo Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmTodo}
        onClose={() => setDeleteConfirmTodo(null)}
        onConfirm={() => {
          if (deleteConfirmTodo) {
            onDeleteTodo(deleteConfirmTodo.id)
          }
        }}
        title="Hapus Agenda Tugas"
        message={`Yakin ingin menghapus tugas "${deleteConfirmTodo?.text}" dari agenda hari ini?`}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </Card>
  )
}
