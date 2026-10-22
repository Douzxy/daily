'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDumbbell,
  faCheck,
  faFire,
  faBed,
  faRotate,
  faCircleCheck,
  faWeightScale,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, ProgressBar, showToast } from '@/components/ui'
import { Storage } from '@/lib/storage'
import type { WorkoutSession, WorkoutSplitType } from '@/types'

interface GymWidgetProps {
  session: WorkoutSession
  onToggleSet?: (exerciseId: string, setNumber: number) => void
  onToggleCompleted?: () => void
  onUpdateBodyweight?: (weight: number) => void
  onSwitchSplit?: (split: WorkoutSplitType) => void
}

export default function GymWidget({
  session,
  onToggleCompleted,
  onSwitchSplit,
}: GymWidgetProps) {
  const currentSplit = session.splitType || 'push'
  const isSkipped = session.skipped === true
  const isCompleted = session.completed === true

  const profile = typeof window !== 'undefined' ? Storage.getUserProfile() : null
  const currentWeight = session.bodyWeightKg ?? profile?.bodyWeightKg ?? 57.5
  const targetWeight = profile?.targetWeightKg ?? 68.0

  // Progress clean bulk menuju target 68.0 kg (baseline 55.0 kg ke 68.0 kg)
  const baselineWeight = 55.0
  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(((currentWeight - baselineWeight) / (targetWeight - baselineWeight)) * 100)
    )
  )
  const remainingWeight = Math.max(0, targetWeight - currentWeight).toFixed(1)

  const handleSplitChange = async (split: WorkoutSplitType) => {
    await Storage.syncBeforeAction()
    if (onSwitchSplit) {
      onSwitchSplit(split)
    } else {
      Storage.setWorkoutSplit(split)
    }
    const label =
      split === 'push'
        ? 'Push Day'
        : split === 'pull'
        ? 'Pull Day'
        : split === 'legs'
        ? 'Legs Day'
        : 'Rest Day'
    showToast(`Split hari ini disetel ke ${label}`, 'success')
  }

  const handleToggleSkip = async () => {
    await Storage.syncBeforeAction()
    Storage.toggleWorkoutSkipped()
    const nextSkipped = !isSkipped
    showToast(
      nextSkipped
        ? 'Hari ini ditandai Istirahat (Rest Day). Selamat beristirahat!'
        : 'Jadwal latihan aktif kembali. Semangat!',
      nextSkipped ? 'info' : 'success'
    )
  }

  const handleToggleCompleted = async () => {
    await Storage.syncBeforeAction()
    if (onToggleCompleted) {
      onToggleCompleted()
    } else {
      Storage.toggleWorkoutCompleted()
    }
    const nextCompleted = !isCompleted
    showToast(
      nextCompleted
        ? `Sesi ${session.splitName || 'latihan'} berhasil ditandai selesai! Mantap!`
        : 'Status selesai latihan dibatalkan',
      nextCompleted ? 'success' : 'info'
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
                Gym & Program Latihan
              </h3>
              <Badge
                variant={isSkipped ? 'warning' : isCompleted ? 'success' : 'navy'}
                className="text-[10px]"
              >
                {isSkipped ? 'Istirahat' : isCompleted ? 'Selesai Hari Ini' : currentSplit.toUpperCase()}
              </Badge>
            </div>
            <p className="text-caption text-slate truncate">
              {isSkipped
                ? 'Jadwal istirahat & pemulihan otot'
                : session.splitName || 'Program latihan Push / Pull / Legs'}
            </p>
          </div>
        </div>

        {/* Target Clean Bulk Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-border text-right">
            <span className="text-[10px] text-slate block font-medium">Target Clean Bulk</span>
            <span className="text-body-sm font-heading font-bold text-navy font-mono">
              {currentWeight.toFixed(1)} / {targetWeight.toFixed(1)} kg
            </span>
          </div>
        </div>
      </div>

      {/* Split Selector Pills (Push / Pull / Legs) & Skip Day Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4 p-2.5 rounded-xl bg-slate-50 border border-border">
        <div className="flex items-center gap-1.5 flex-wrap">
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
          <span>{isSkipped ? 'Batalkan Istirahat (Mulai Latihan)' : 'Tidak Bisa Latihan (Istirahat)'}</span>
        </button>
      </div>

      {/* Rest Day State */}
      {isSkipped ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-2">
          <div className="h-10 w-10 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
            <FontAwesomeIcon icon={faBed} className="h-4 w-4" />
          </div>
          <h4 className="text-body font-heading font-bold text-amber-950">
            Hari Ini Ditandai Istirahat (Rest Day)
          </h4>
          <p className="text-caption text-amber-800 max-w-md mx-auto leading-relaxed">
            Tidak masalah jika hari ini belum sempat latihan. Pemulihan otot sama krusialnya dengan angkat beban untuk program clean bulk menuju target {targetWeight.toFixed(1)} kg.
          </p>
          <div className="pt-1">
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
        /* Active Workout Day: Action & Weight Progress */
        <div className="space-y-4">
          {/* Main Workout Status Action Card */}
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
                    {isCompleted ? 'Latihan Hari Ini Selesai!' : `Jadwal Hari Ini: ${currentSplit.toUpperCase()} DAY`}
                  </h4>
                  <p className="text-caption text-slate">
                    {isCompleted
                      ? 'Kerja bagus! Konsistensi latihan hari ini tercatat.'
                      : 'Fokus intensitas latihan sesuai jadwal mingguan PPL.'}
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
                <span>{isCompleted ? 'Batalkan Status Selesai' : 'Tandai Selesai Latihan Hari Ini'}</span>
              </button>
            </div>
          </div>

          {/* Clean Bulk Progress Card towards 68 kg */}
          <div className="p-4 rounded-xl bg-slate-50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faWeightScale} className="text-navy text-xs" />
                <span className="text-caption font-bold text-navy uppercase tracking-wider">
                  Progres Berat Badan Menuju Target {targetWeight.toFixed(1)} kg
                </span>
              </div>
              <span className="text-caption font-mono font-bold text-navy">
                {currentWeight.toFixed(1)} kg / {targetWeight.toFixed(1)} kg ({progressPercent}%)
              </span>
            </div>

            <ProgressBar
              value={progressPercent}
              max={100}
              color={progressPercent >= 80 ? 'sage' : 'navy'}
              size="md"
              showLabel={false}
            />

            <div className="flex items-center justify-between text-[11px] text-slate mt-2 font-mono">
              <span>Sisa: +{remainingWeight} kg lagi</span>
              <span className="text-sage font-medium">Target Clean Bulk {targetWeight.toFixed(1)} kg</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
