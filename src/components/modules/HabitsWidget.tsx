'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faListCheck,
  faFire,
  faCheck,
  faGlassWater,
  faMosque,
  faDumbbell,
  faBookOpen,
  faCapsules,
  faBed,
  faClock,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, ProgressBar } from '@/components/ui'
import type { Habit } from '@/types'

interface HabitsWidgetProps {
  habits: Habit[]
  onToggleHabit: (id: string) => void
  onAddHabit?: (name: string, category: string) => void
}

export default function HabitsWidget({
  habits,
  onToggleHabit,
}: HabitsWidgetProps) {
  const completedCount = habits.filter((h) => h.completedToday).length
  const totalHabits = habits.length
  const pct = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0

  const getHabitIcon = (name: string): IconDefinition => {
    if (name.includes('Air')) return faGlassWater
    if (name.includes('Sholat')) return faMosque
    if (name.includes('Workout') || name.includes('Gym')) return faDumbbell
    if (name.includes('Buku') || name.includes('Baca')) return faBookOpen
    if (name.includes('Creatine')) return faCapsules
    if (name.includes('Tidur') || name.includes('Jam')) return faClock
    return faCircleCheck
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy">
            <FontAwesomeIcon icon={faListCheck} className="h-4 w-4 sm:h-5 sm:w-5 text-navy" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy truncate">
                Habit Rutinitas Harian
              </h3>
              <Badge variant="navy" className="text-[10px] py-0.5 px-2 shrink-0">
                Atomic Habits
              </Badge>
            </div>
            <p className="text-caption text-slate mt-0.5 truncate sm:whitespace-normal">
              Konsistensi harian penentu pembentukan kebiasaan
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto sm:text-right shrink-0">
          <span className="text-caption font-mono font-bold text-navy tabular-nums">
            {completedCount} / {totalHabits} Selesai
          </span>
          <p className="text-[11px] text-slate font-mono">{pct}% hari ini</p>
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar
          value={completedCount}
          max={totalHabits}
          color={pct === 100 ? 'sage' : 'navy'}
          size="sm"
          showLabel={false}
        />
      </div>

      {/* Habit items */}
      <div className="space-y-2">
        {habits.map((habit) => (
          <div
            key={habit.id}
            onClick={() => onToggleHabit(habit.id)}
            className={`
              flex items-center justify-between p-3 rounded-xl border cursor-pointer
              transition-all duration-150 select-none active:scale-[0.99]
              ${
                habit.completedToday
                  ? 'bg-emerald-50/60 border-emerald-300/70 text-navy'
                  : 'bg-surface border-border hover:border-slate/30 hover:bg-slate-50/50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-5 w-5 rounded-md flex items-center justify-center transition-all ${
                  habit.completedToday
                    ? 'bg-navy text-white shadow-2xs'
                    : 'border-1.5 border-slate-300 bg-white'
                }`}
              >
                {habit.completedToday && (
                  <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-white/80 border border-border/60 flex items-center justify-center w-6 h-6">
                  <FontAwesomeIcon
                    icon={getHabitIcon(habit.name)}
                    className="text-[11px] text-navy"
                  />
                </span>
                <span
                  className={`text-body-sm font-medium ${
                    habit.completedToday ? 'line-through text-slate' : 'text-navy'
                  }`}
                >
                  {habit.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-caption font-semibold font-mono text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
              <FontAwesomeIcon icon={faFire} className="text-xs text-amber-500" />
              <span>{habit.streak}d</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
