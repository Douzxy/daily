'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, Button, Badge } from '@/components/ui'
import DailyCaptureModal from '@/components/modules/DailyCaptureModal'
import { Storage } from '@/lib/storage'
import type { DailyCapture, TodoItem } from '@/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faBrain,
  faBullseye,
  faPlus,
} from '@fortawesome/free-solid-svg-icons'

export default function CapturePage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [captures, setCaptures] = useState<DailyCapture[]>(() => {
    if (typeof window !== 'undefined') return Storage.getDailyCaptures()
    return []
  })
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (typeof window !== 'undefined') return Storage.getTodayTodos()
    return []
  })
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const refresh = () => {
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

  const handleToggleTodo = (id: string) => {
    const updated = Storage.toggleTodo(id)
    setTodos(updated)
  }

  const handleAddTodo = (text: string, priority?: 'high' | 'medium' | 'low') => {
    const created = Storage.addTodo({ text, done: false, priority: priority || 'medium' })
    setTodos((prev) => [created, ...prev])
  }

  const handleDeleteTodo = (id: string) => {
    const updated = Storage.deleteTodo(id)
    setTodos(updated)
  }

  const handleSubmit = (data: {
    thoughts: string
    plans: string
    priority?: 'low' | 'medium' | 'high'
    mood?: 'energetic' | 'calm' | 'tired' | 'focused' | 'stressed'
  }) => {
    const today = new Date().toISOString().split('T')[0]
    const saved = Storage.addDailyCapture({
      date: today,
      ...data,
    })
    setCaptures((prev) => [saved, ...prev])
  }

  if (!mounted) {
    return (
      <DashboardLayout title="Daily Capture" subtitle="Jurnal pikiran dan prioritas harian">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 rounded-full border-2 border-navy border-t-transparent animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Daily Capture">
      <DailyCaptureModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        todos={todos}
        onToggleTodo={handleToggleTodo}
        onAddTodo={handleAddTodo}
        onDeleteTodo={handleDeleteTodo}
        onSaveThoughts={(thoughts) => {
          handleSubmit({
            thoughts,
            plans: todos.map((t, idx) => `${idx + 1}. ${t.text}`).join('\n'),
            priority: 'high',
            mood: 'focused',
          })
        }}
      />

      <div className="space-y-6 pb-12">
        {/* Header Action Banner */}
        <div className="flex items-center justify-between p-4 sm:p-6 rounded-2xl bg-surface border border-border shadow-xs">
          <div>
            <h2 className="text-body font-heading font-bold text-navy sm:text-h4">
              Arsip Catatan Harian
            </h2>
            <p className="text-caption text-slate mt-0.5">
              Total {captures.length} catatan refleksi tersimpan
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            className="gap-1.5 shadow-xs shrink-0"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            <span>Tambah</span>
          </Button>
        </div>

        {/* Timeline of Captures */}
        <div className="space-y-4">
          {captures.map((item) => (
            <Card key={item.id} className="relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendar} className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-body-sm font-heading font-bold text-navy">
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h3>
                    <span className="text-[11px] text-slate font-mono">
                      {new Date(item.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.mood && (
                    <Badge variant="navy" className="text-[10px]">
                      Kondisi: {item.mood}
                    </Badge>
                  )}
                  {item.priority && (
                    <Badge
                      variant={
                        item.priority === 'high'
                          ? 'error'
                          : item.priority === 'medium'
                          ? 'warning'
                          : 'default'
                      }
                      className="text-[10px]"
                    >
                      {item.priority}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 rounded-xl bg-slate-50 border border-border/60">
                  <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-slate mb-2">
                    <FontAwesomeIcon icon={faBrain} className="h-3.5 w-3.5 text-navy" />
                    <span>Pikiran & Analisis</span>
                  </div>
                  <p className="text-body-sm text-navy font-body leading-relaxed whitespace-pre-line">
                    {item.thoughts || '-'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-border/60">
                  <div className="flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-slate mb-2">
                    <FontAwesomeIcon icon={faBullseye} className="h-3.5 w-3.5 text-sage" />
                    <span>Prioritas Deliverable</span>
                  </div>
                  <p className="text-body-sm text-navy font-body leading-relaxed whitespace-pre-line">
                    {item.plans || '-'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
