'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDumbbell,
  faCheck,
  faFire,
  faBed,
  faRotate,
  faCircleCheck,
  faWandMagicSparkles,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, showToast } from '@/components/ui'
import { Storage, PPL_PRESETS, SPLIT_NAMES } from '@/lib/storage'
import type { WorkoutSession, WorkoutSplitType } from '@/types'

interface GymWidgetProps {
  session: WorkoutSession
  selectedDate?: string
  recommendation?: { split: WorkoutSplitType; title: string; reason: string }
  onSelectSplit?: (split: WorkoutSplitType | null) => void
  onToggleCompleted?: () => void
}

const SPLIT_LABELS: Record<WorkoutSplitType, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  rest: 'Rest',
}

export default function GymWidget({
  session,
  selectedDate,
  recommendation,
  onSelectSplit,
  onToggleCompleted,
}: GymWidgetProps) {
  const currentSplit = session.splitType
  const isRest = currentSplit === 'rest'
  const isCompleted = Boolean(session.completed && currentSplit && !isRest)
  const rec = recommendation || (typeof window !== 'undefined' ? Storage.getRecommendedWorkout(selectedDate) : null)

  const handleChooseSplit = (split: WorkoutSplitType | null) => {
    if (onSelectSplit) {
      onSelectSplit(split)
    } else {
      Storage.setWorkoutSplit(split)
    }
    if (!split) {
      showToast('Jadwal hari ini dikosongkan', 'info')
    } else {
      showToast(`Jadwal dipilih: ${SPLIT_NAMES[split]}`, 'success')
    }
  }

  const handleToggleCompleted = () => {
    if (onToggleCompleted) {
      onToggleCompleted()
    } else {
      Storage.toggleWorkoutCompleted()
    }
    const nextCompleted = !isCompleted
    showToast(
      nextCompleted
        ? `Sesi ${session.splitName || 'latihan'} selesai! Mantap!`
        : 'Status selesai latihan dibatalkan',
      nextCompleted ? 'success' : 'info'
    )
  }

  const activePreset =
    currentSplit && currentSplit !== 'rest'
      ? PPL_PRESETS[currentSplit]
      : rec && rec.split !== 'rest'
      ? PPL_PRESETS[rec.split]
      : null

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
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy">
                Pilihan Latihan {selectedDate ? `(${selectedDate})` : 'Hari Ini'}
              </h3>
              <Badge
                variant={
                  !currentSplit
                    ? 'default'
                    : isRest
                    ? 'warning'
                    : isCompleted
                    ? 'success'
                    : 'navy'
                }
                className="text-[10px]"
              >
                {!currentSplit
                  ? 'Belum Dipilih'
                  : isRest
                  ? 'Rest Day'
                  : isCompleted
                  ? `${SPLIT_LABELS[currentSplit]} • Selesai`
                  : `${SPLIT_LABELS[currentSplit]} Day`}
              </Badge>
            </div>
            <p className="text-caption text-slate">
              {currentSplit
                ? SPLIT_NAMES[currentSplit]
                : 'Jadwal kosong — tentukan sendiri mau latihan apa hari ini'}
            </p>
          </div>
        </div>

        {currentSplit && (
          <button
            type="button"
            onClick={() => handleChooseSplit(null)}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-white hover:bg-slate-100 text-slate text-[11px] font-semibold flex items-center gap-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="text-xs" />
            <span>Kosongkan Pilihan</span>
          </button>
        )}
      </div>

      {/* Smart Recommendation Strip */}
      {rec && (
        <div className="mb-4 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-caption font-bold text-indigo-950">
              <FontAwesomeIcon icon={faWandMagicSparkles} className="text-indigo-600 text-xs shrink-0" />
              <span>Rekomendasi Hari Ini: {SPLIT_NAMES[rec.split]}</span>
            </div>
            <p className="text-[11px] text-indigo-900/80 mt-0.5 leading-relaxed">
              {rec.reason}
            </p>
          </div>

          {currentSplit !== rec.split && (
            <button
              type="button"
              onClick={() => handleChooseSplit(rec.split)}
              className="px-3 py-1.5 rounded-xl bg-navy text-white hover:bg-navy-hover text-caption font-heading font-bold shrink-0 self-start sm:self-auto cursor-pointer active:scale-95 transition-all"
            >
              Pilih {SPLIT_LABELS[rec.split]} (Rekomendasi)
            </button>
          )}
        </div>
      )}

      {/* Manual Selector Pills: Push / Pull / Legs / Rest */}
      <div className="flex flex-wrap items-center gap-2 mb-4 p-2.5 rounded-xl bg-slate-50 border border-border">
        <span className="text-[11px] font-bold text-slate uppercase tracking-wider pl-1">
          Pilih Sendiri:
        </span>
        {(['push', 'pull', 'legs', 'rest'] as const).map((splitKey) => {
          const isActive = currentSplit === splitKey
          return (
            <button
              key={splitKey}
              type="button"
              onClick={() => handleChooseSplit(splitKey)}
              className={`px-3.5 py-1.5 rounded-lg text-caption font-heading font-bold transition-all cursor-pointer ${
                isActive
                  ? splitKey === 'rest'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-navy text-white shadow-xs'
                  : 'bg-white text-navy border border-border hover:bg-slate-100'
              }`}
            >
              {SPLIT_LABELS[splitKey]}
            </button>
          )
        })}
      </div>

      {/* State 1: Empty / Unselected */}
      {!currentSplit ? (
        <div className="p-4 sm:p-5 rounded-2xl border border-dashed border-border bg-slate-50/50 space-y-3">
          <div className="text-center space-y-1">
            <h4 className="text-body font-heading font-bold text-navy">
              Jadwal Masih Kosong
            </h4>
            <p className="text-caption text-slate">
              Klik <strong>Push</strong>, <strong>Pull</strong>, <strong>Legs</strong>, atau <strong>Rest</strong> di atas sesuai kondisi kamu hari ini.
            </p>
          </div>

          {activePreset && rec && (
            <div className="pt-3 border-t border-border/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate block mb-2">
                Preview Menu Rekomendasi ({SPLIT_LABELS[rec.split]} Day):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePreset.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-2.5 rounded-lg bg-white border border-border/80 flex items-center justify-between gap-2 text-caption"
                  >
                    <span className="font-semibold text-navy wrap-break-word">{ex.name}</span>
                    <span className="font-mono text-[11px] text-slate shrink-0">{ex.targetSets} set</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : isRest ? (
        /* State 2: Rest Day Chosen */
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-2">
          <div className="h-10 w-10 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
            <FontAwesomeIcon icon={faBed} className="h-4 w-4" />
          </div>
          <h4 className="text-body font-heading font-bold text-amber-950">
            Hari Ini Kamu Pilih Rest Day (Istirahat)
          </h4>
          <p className="text-caption text-amber-800 max-w-md mx-auto leading-relaxed">
            Fokus penuhi target kalori & protein harian serta tidur cukup agar otot pulih maksimal.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleChooseSplit(rec && rec.split !== 'rest' ? rec.split : 'push')}
              className="px-4 py-2 rounded-xl bg-navy text-white hover:bg-navy-hover font-heading font-bold text-caption shadow-xs cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faRotate} className="h-3 w-3" />
              <span>Ganti Jadi Latihan</span>
            </button>
          </div>
        </div>
      ) : (
        /* State 3: Push / Pull / Legs Chosen */
        <div className="space-y-4">
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isCompleted
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-surface border-border hover:border-navy/40 shadow-xs'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-navy/10 text-navy'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isCompleted ? faCircleCheck : faFire}
                    className="h-5 w-5"
                  />
                </div>
                <div>
                  <h4 className="text-body sm:text-body-lg font-heading font-bold text-navy">
                    {isCompleted ? `Sesi ${SPLIT_LABELS[currentSplit]} Day Selesai!` : `Pilihan Kamu: ${SPLIT_NAMES[currentSplit]}`}
                  </h4>
                  <p className="text-caption text-slate">
                    {isCompleted
                      ? 'Sesi latihan tercatat selesai di kalender mingguan.'
                      : 'Klik tombol selesai setelah beres latihan.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleCompleted}
                className={`h-10 px-5 rounded-xl font-heading font-bold text-body-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0 ${
                  isCompleted
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    : 'bg-navy text-white hover:bg-navy-hover'
                }`}
              >
                <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
                <span>{isCompleted ? 'Batalkan Selesai' : 'Tandai Selesai Latihan'}</span>
              </button>
            </div>
          </div>

          {activePreset && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate block mb-2">
                Rekomendasi Gerakan Inti ({SPLIT_LABELS[currentSplit]} Day):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePreset.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-2.5 rounded-lg bg-white border border-border/80 flex items-center justify-between gap-2 text-caption"
                  >
                    <span className="font-semibold text-navy wrap-break-word">{ex.name}</span>
                    <span className="font-mono text-[11px] text-slate shrink-0">
                      {ex.targetSets} set × {ex.sets[0]?.reps || 10} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
