'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDumbbell,
  faWeightScale,
  faStopwatch,
  faCheck,
  faCircleInfo,
  faBed,
  faRotate,
  faBan,
  faFire,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, ProgressBar, showToast } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { WorkoutSession, WorkoutSplitType } from '@/types'

interface GymWidgetProps {
  session: WorkoutSession
  onToggleSet: (exerciseId: string, setNumber: number) => void
  onUpdateBodyweight?: (weight: number) => void
  onSwitchSplit?: (split: WorkoutSplitType) => void
}

export default function GymWidget({ session, onToggleSet, onSwitchSplit }: GymWidgetProps) {
  const currentSplit = session.splitType || 'push'
  const isSkipped = session.skipped === true

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
  const completedSets = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.done).length,
    0
  )
  const completionPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

  const handleSplitChange = (split: WorkoutSplitType) => {
    if (onSwitchSplit) {
      onSwitchSplit(split)
    } else {
      Storage.setWorkoutSplit(split)
    }
    const label = split === 'push' ? 'Push Day (Dada & Triceps)' : split === 'pull' ? 'Pull Day (Punggung & Biceps)' : 'Legs Day (Kaki & Core)'
    showToast(`Split hari ini disetel ke ${label}`, 'success')
  }

  const handleToggleSkip = () => {
    Storage.toggleWorkoutSkipped()
    const nextSkipped = !isSkipped
    showToast(
      nextSkipped
        ? 'Hari ini ditandai Istirahat (Rest Day). Selamat beristirahat!'
        : 'Jadwal latihan aktif kembali. Semangat!',
      nextSkipped ? 'info' : 'success'
    )
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-white shadow-xs">
            <FontAwesomeIcon icon={faDumbbell} className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy truncate">
                Gym & Progressive Overload
              </h3>
              <Badge variant={isSkipped ? 'default' : 'navy'} className="text-[10px] py-0.5 px-2 shrink-0">
                {isSkipped ? 'Rest Day' : 'PPL Hypertrophy'}
              </Badge>
            </div>
            <p className="text-caption text-slate mt-0.5 truncate sm:whitespace-normal">
              {isSkipped ? 'Hari ini istirahat pemulihan otot' : session.splitName}
            </p>
          </div>
        </div>

        {/* Weight & Duration Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-100 text-navy text-caption font-mono font-medium">
            <FontAwesomeIcon icon={faWeightScale} className="text-xs text-slate" />
            <span>{session.bodyWeightKg ?? 57.5} kg</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-slate-100 text-navy text-caption font-mono font-medium">
            <FontAwesomeIcon icon={faStopwatch} className="text-xs text-slate" />
            <span>{session.durationMinutes ?? 55}m</span>
          </div>
        </div>
      </div>

      {/* Split Selector Pills (Push / Pull / Legs) & Skip Day Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-5 p-2.5 rounded-xl bg-slate-50 border border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate uppercase tracking-wider pl-1">
            Split Hari Ini:
          </span>
          {(['push', 'pull', 'legs'] as const).map((splitKey) => {
            const isActive = currentSplit === splitKey && !isSkipped
            const label = splitKey === 'push' ? 'Push' : splitKey === 'pull' ? 'Pull' : 'Legs'
            return (
              <button
                key={splitKey}
                type="button"
                onClick={() => handleSplitChange(splitKey)}
                className={`px-3 py-1.5 rounded-lg text-caption font-heading font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-navy text-white shadow-xs'
                    : 'bg-white text-navy border border-border hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Toggle Rest / Skip Day Button */}
        <button
          type="button"
          onClick={handleToggleSkip}
          className={`px-3 py-1.5 rounded-lg text-caption font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isSkipped
              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
              : 'bg-white text-slate hover:text-navy border border-border hover:bg-slate-100'
          }`}
          title="Tandai jika hari ini tidak sempat latihan atau jadwal istirahat"
        >
          <FontAwesomeIcon icon={isSkipped ? faRotate : faBed} className="h-3 w-3" />
          <span>{isSkipped ? 'Batalkan Istirahat (Latihan)' : 'Tidak Bisa Latihan (Istirahat)'}</span>
        </button>
      </div>

      {/* If Skipped / Rest Day Active */}
      {isSkipped ? (
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 text-center space-y-2">
          <div className="h-10 w-10 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
            <FontAwesomeIcon icon={faBed} className="h-5 w-5" />
          </div>
          <h4 className="text-body font-heading font-bold text-amber-950">
            Hari Ini Ditandai Istirahat (Rest Day)
          </h4>
          <p className="text-caption text-amber-800 max-w-md mx-auto leading-relaxed">
            Tidak masalah jika hari ini belum bisa latihan. Pemulihan otot sama krusialnya dengan angkat beban untuk program clean bulk. Tetap penuhi target protein 115g & hidrasi 2.5L!
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleToggleSkip}
              className="px-4 py-2 rounded-xl bg-navy text-white hover:bg-navy-hover font-heading font-bold text-caption shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              Ubah Pikiran: Mulai Latihan Hari Ini
            </button>
          </div>
        </div>
      ) : (
        <>
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
              const isAllSetsDone = exercise.sets.length > 0 && exercise.sets.every((s) => s.done)
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
                        onClick={() => {
                          onToggleSet(exercise.id, set.setNumber)
                          const nextDone = !set.done
                          showToast(
                            nextDone
                              ? `${exercise.name} Set ${set.setNumber} (${set.weightKg}kg × ${set.reps}) selesai!`
                              : `Set ${set.setNumber} dibatalkan`,
                            nextDone ? 'success' : 'info'
                          )
                        }}
                        className={`
                          flex items-center justify-between px-3 py-2 rounded-lg border text-caption cursor-pointer
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
                          <FontAwesomeIcon icon={faCheck} className="text-xs text-white" />
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
        </>
      )}
    </Card>
  )
}
