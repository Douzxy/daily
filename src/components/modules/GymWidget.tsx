'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDumbbell,
  faWeightScale,
  faStopwatch,
  faCheck,
  faCircleInfo,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, ProgressBar } from '@/components/ui'
import type { WorkoutSession } from '@/types'

interface GymWidgetProps {
  session: WorkoutSession
  onToggleSet: (exerciseId: string, setNumber: number) => void
  onUpdateBodyweight?: (weight: number) => void
}

export default function GymWidget({ session, onToggleSet }: GymWidgetProps) {
  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
    0
  )
  const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  return (
    <Card className="relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
            <FontAwesomeIcon icon={faDumbbell} className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy truncate">
                Gym & Progressive Overload
              </h3>
              <Badge variant="navy" className="text-[10px] py-0.5 px-2 shrink-0">
                Hypertrophy Split
              </Badge>
            </div>
            <p className="text-caption text-slate mt-0.5 truncate sm:whitespace-normal">
              {session.splitName}
            </p>
          </div>
        </div>

        {/* Weight & Duration Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-100 text-navy text-caption font-mono font-medium">
            <FontAwesomeIcon icon={faWeightScale} className="text-xs text-slate" />
            <span>{session.bodyWeightKg ?? 73.4} kg</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-100 text-navy text-caption font-mono font-medium">
            <FontAwesomeIcon icon={faStopwatch} className="text-xs text-slate" />
            <span>{session.durationMinutes ?? 60}m</span>
          </div>
        </div>
      </div>

      {/* Progress banner */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-border/80">
        <div className="flex items-center justify-between text-body-sm font-medium mb-2">
          <span className="text-slate">Total Volume Sets Hari Ini</span>
          <span className="font-heading font-bold text-navy tabular-nums">
            {completedSets} / {totalSets} Sets ({completionPercentage}%)
          </span>
        </div>
        <ProgressBar
          value={completedSets}
          max={totalSets}
          color={completionPercentage === 100 ? 'sage' : 'navy'}
          showLabel={false}
          size="md"
        />
        {session.notes && (
          <div className="flex items-center gap-2 text-[12px] text-slate mt-2">
            <FontAwesomeIcon icon={faCircleInfo} className="text-[11px] text-navy" />
            <span>{session.notes}</span>
          </div>
        )}
      </div>

      {/* Exercises List */}
      <div className="space-y-3.5">
        {session.exercises.map((exercise, index) => {
          const isAllSetsDone = exercise.sets.every((s) => s.done)
          return (
            <div
              key={exercise.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 ${
                isAllSetsDone
                  ? 'bg-emerald-50/50 border-emerald-300/60'
                  : 'bg-surface border-border hover:border-slate/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-caption font-mono font-bold text-slate w-5">
                    0{index + 1}
                  </span>
                  <h4
                    className={`text-body-sm font-heading font-bold ${
                      isAllSetsDone ? 'text-emerald-950 line-through' : 'text-navy'
                    }`}
                  >
                    {exercise.name}
                  </h4>
                </div>
                <span className="text-caption font-mono text-slate">
                  {exercise.sets.filter((s) => s.done).length}/{exercise.sets.length} sets
                </span>
              </div>

              {/* Set chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {exercise.sets.map((set) => (
                  <button
                    key={set.setNumber}
                    type="button"
                    onClick={() => onToggleSet(exercise.id, setNumber(set.setNumber))}
                    className={`
                      flex items-center justify-between px-3 py-2 rounded-lg border text-caption
                      transition-all duration-150 active:scale-[0.97]
                      ${
                        set.done
                          ? 'bg-navy text-white border-navy shadow-xs font-semibold'
                          : 'bg-surface text-slate-700 border-border hover:border-navy hover:text-navy'
                      }
                    `}
                  >
                    <span className="font-mono font-medium">Set {set.setNumber}</span>
                    <span className="font-mono font-bold tabular-nums">
                      {set.weightKg}kg × {set.reps}
                    </span>
                    {set.done ? (
                      <FontAwesomeIcon icon={faCheck} className="text-xs text-sage" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-slate-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function setNumber(n: number): number {
  return n
}
