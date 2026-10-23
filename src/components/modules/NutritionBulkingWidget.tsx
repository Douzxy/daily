'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUtensils,
  faPlus,
  faFire,
  faDna,
  faCookieBite,
  faPenToSquare,
  faTrashCan,
  faXmark,
  faSliders,
  faCircleCheck,
  faTriangleExclamation,
  faBolt,
  faRotateRight,
  faWeightScale,
  faRulerVertical,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import { Card, Badge, Button, ProgressBar, showToast, ConfirmModal } from '@/components/ui'
import type { MealLog, MealCategory, NutritionTarget } from '@/types'
import { Storage, calculateNutritionFromBiometrics } from '@/lib/storage'
import { getTodayDateStr } from '@/lib/dateUtils'

interface NutritionBulkingWidgetProps {
  selectedDate?: string // YYYY-MM-DD
  meals: MealLog[]
  nutritionTarget: NutritionTarget
  onAddMeal: (meal: Omit<MealLog, 'id'>) => void
  onUpdateMeal: (id: string, updates: Partial<MealLog>) => void
  onDeleteMeal: (id: string) => void
  onUpdateTarget: (target: NutritionTarget) => void
}

const CATEGORY_LABELS: Record<MealCategory, string> = {
  sarapan: 'Sarapan',
  makan_siang: 'Makan Siang',
  makan_malam: 'Makan Malam',
  nyemil: 'Camilan / Nyemil',
  pre_post_workout: 'Pre / Post Workout',
}

const QUICK_BULKING_PRESETS = [
  { name: '1 Scoop Whey Protein', calories: 120, protein: 25, category: 'pre_post_workout' as MealCategory },
  { name: '2 Butir Telur Rebus', calories: 155, protein: 13, category: 'nyemil' as MealCategory },
  { name: 'Susu UHT Full Cream (250ml)', calories: 150, protein: 8, category: 'nyemil' as MealCategory },
  { name: 'Dada Ayam Panggang (150g)', calories: 247, protein: 46, category: 'makan_siang' as MealCategory },
  { name: 'Pisang + Selai Kacang (2 sdm)', calories: 230, protein: 7, category: 'nyemil' as MealCategory },
  { name: 'Nasi Putih (200g)', calories: 260, protein: 5, category: 'makan_siang' as MealCategory },
]

export default function NutritionBulkingWidget({
  selectedDate,
  meals,
  nutritionTarget,
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
  onUpdateTarget,
}: NutritionBulkingWidgetProps) {
  const activeDate = selectedDate || getTodayDateStr()

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null)
  const [deleteConfirmMeal, setDeleteConfirmMeal] = useState<MealLog | null>(null)
  const [showTargetModal, setShowTargetModal] = useState(false)

  // Form states
  const [mealName, setMealName] = useState('')
  const [mealCategory, setMealCategory] = useState<MealCategory>('nyemil')
  const [mealCalories, setMealCalories] = useState('')
  const [mealProtein, setMealProtein] = useState('')
  const [mealDate, setMealDate] = useState(activeDate)

  // User profile for automatic nutrition calculations
  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      return Storage.getUserProfile()
    }
    return { name: 'Edo', email: '', salary: 2800000, heightCm: 168, bodyWeightKg: 57.8, targetWeightKg: 68.0, city: 'Tangerang Selatan' }
  })

  // Biometrics & Surplus state for automatic calculation
  const [heightInput, setHeightInput] = useState(String(profile.heightCm || 168))
  const [weightInput, setWeightInput] = useState(String(profile.bodyWeightKg || 57.8))
  const [targetWeightInput, setTargetWeightInput] = useState(String(profile.targetWeightKg || 68.0))
  const [surplusMode, setSurplusMode] = useState<number>(350)
  const [isManualOverride, setIsManualOverride] = useState(false)
  const [targetCaloriesInput, setTargetCaloriesInput] = useState(String(nutritionTarget.targetCalories))
  const [targetProteinInput, setTargetProteinInput] = useState(String(nutritionTarget.targetProtein))

  // Filter meals for the active date
  const dayMeals = meals.filter((m) => m.date === activeDate)

  // Calculate consumed totals
  const totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0)
  const totalProtein = dayMeals.reduce((sum, m) => sum + m.protein, 0)

  const caloriesPct = Math.min(Math.round((totalCalories / nutritionTarget.targetCalories) * 100), 150)
  const proteinPct = Math.min(Math.round((totalProtein / nutritionTarget.targetProtein) * 100), 150)

  const remainingCalories = Math.max(0, nutritionTarget.targetCalories - totalCalories)
  const remainingProtein = Math.max(0, nutritionTarget.targetProtein - totalProtein)

  // Bulking Evaluation Status
  const getBulkingStatus = () => {
    if (totalCalories >= nutritionTarget.targetCalories && totalProtein >= nutritionTarget.targetProtein) {
      if (totalCalories > nutritionTarget.targetCalories + 500) {
        return {
          level: 'excess',
          title: 'Surplus Sangat Tinggi (Waspada Dirty Bulk)',
          desc: `Total kalori melebihi target (+${totalCalories - nutritionTarget.targetCalories} kkal). Jaga proporsi agar kenaikan didominasi massa otot.`,
          variant: 'warning' as const,
        }
      }
      return {
        level: 'optimal',
        title: 'Optimal Clean Bulk! Target Hari Ini Tercapai 🎉',
        desc: `Surplus kalori (+${totalCalories - nutritionTarget.targetCalories} kkal) dan protein (${totalProtein}g) terpenuhi sempurna untuk sintesis protein otot!`,
        variant: 'success' as const,
      }
    }

    if (totalCalories >= nutritionTarget.targetCalories * 0.8 || totalProtein >= nutritionTarget.targetProtein * 0.8) {
      return {
        level: 'almost',
        title: 'Hampir Cukup! Tambah Camilan / Protein',
        desc: `Kurang ${remainingCalories} kkal dan ${remainingProtein}g protein lagi. Nyemil telur, susu, atau shake sebelum tidur!`,
        variant: 'warning' as const,
      }
    }

    return {
      level: 'deficit',
      title: 'Asupan Belum Cukup untuk Bulking!',
      desc: `Baru terisi ${totalCalories}/${nutritionTarget.targetCalories} kkal. Tubuh masih defisit/maintenance, segera tambah porsi makan atau nyemil agar berat naik!`,
      variant: 'error' as const,
    }
  }

  const bulkingStatus = getBulkingStatus()

  // Handlers
  const openAddModal = () => {
    setEditingMeal(null)
    setMealName('')
    setMealCategory('nyemil')
    setMealCalories('')
    setMealProtein('')
    setMealDate(activeDate)
    setShowAddModal(true)
  }

  const openEditModal = (meal: MealLog) => {
    setEditingMeal(meal)
    setMealName(meal.name)
    setMealCategory(meal.category)
    setMealCalories(String(meal.calories))
    setMealProtein(String(meal.protein))
    setMealDate(meal.date)
    setShowAddModal(true)
  }

  const handleQuickAdd = (preset: typeof QUICK_BULKING_PRESETS[0]) => {
    onAddMeal({
      name: preset.name,
      calories: preset.calories,
      protein: preset.protein,
      category: preset.category,
      date: activeDate,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    })
    showToast(`+${preset.name} (${preset.calories} kkal, ${preset.protein}g protein) dicatat!`, 'success')
  }

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault()
    const cal = parseInt(mealCalories, 10)
    const prot = parseFloat(mealProtein)

    if (!mealName.trim()) {
      showToast('Masukkan nama makanan atau camilan', 'error')
      return
    }
    if (isNaN(cal) || cal <= 0) {
      showToast('Masukkan estimasi kalori yang valid', 'error')
      return
    }

    if (editingMeal) {
      onUpdateMeal(editingMeal.id, {
        name: mealName.trim(),
        calories: cal,
        protein: isNaN(prot) ? 0 : prot,
        category: mealCategory,
        date: mealDate,
      })
      showToast(`Makanan "${mealName.trim()}" berhasil diperbarui!`, 'success')
    } else {
      onAddMeal({
        name: mealName.trim(),
        calories: cal,
        protein: isNaN(prot) ? 0 : prot,
        category: mealCategory,
        date: mealDate,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      })
      showToast(`+${mealName.trim()} (${cal} kkal, ${prot || 0}g protein) dicatat!`, 'success')
    }

    setShowAddModal(false)
  }

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault()
    const h = parseFloat(heightInput) || profile.heightCm || 168
    const w = parseFloat(weightInput) || profile.bodyWeightKg || 57.8
    const tw = parseFloat(targetWeightInput) || profile.targetWeightKg || 68.0

    const computed = calculateNutritionFromBiometrics(h, w, surplusMode)
    const cal = isManualOverride ? (parseInt(targetCaloriesInput, 10) || computed.targetCalories) : computed.targetCalories
    const prot = isManualOverride ? (parseInt(targetProteinInput, 10) || computed.targetProtein) : computed.targetProtein

    if (!cal || cal < 1000 || !prot || prot < 30) {
      showToast('Masukkan target kalori & protein yang realistis', 'error')
      return
    }

    const updatedProfile = {
      ...profile,
      heightCm: h,
      bodyWeightKg: w,
      targetWeightKg: tw,
    }
    setProfile(updatedProfile)
    Storage.saveUserProfile(updatedProfile)
    onUpdateTarget({ targetCalories: cal, targetProtein: prot })
    setShowTargetModal(false)
    showToast(`Target nutrisi otomatis (TB ${h} cm, BB ${w} kg): ${cal} kkal & ${prot}g protein berhasil disimpan ke Neon DB!`, 'success')
  }

  return (
    <Card className="relative overflow-hidden border border-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <FontAwesomeIcon icon={faUtensils} className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy">
                Nutrisi & Camilan Clean Bulk
              </h3>
              <Badge variant="warning" className="text-[10px] py-0.5 px-2">
                Surplus Tracker
              </Badge>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-border">
                TB: {profile.heightCm} cm • BB: {profile.bodyWeightKg} kg (Auto)
              </span>
            </div>
            <p className="text-caption text-slate mt-0.5">
              Target otomatis menyesuaikan TB & BB harian untuk memastikan surplus kalori & sintesis protein otot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              setHeightInput(String(profile.heightCm || 168))
              setWeightInput(String(profile.bodyWeightKg || 57.8))
              setTargetWeightInput(String(profile.targetWeightKg || 68.0))
              setShowTargetModal(true)
            }}
            className="h-8.5 px-2.5 rounded-lg border border-border bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sesuaikan TB, BB & Target Nutrisi Otomatis"
          >
            <FontAwesomeIcon icon={faSliders} className="text-xs" />
            <span>Atur Target (TB/BB)</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            className="gap-1.5 shadow-xs"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
            <span>Catat Makan</span>
          </Button>
        </div>
      </div>

      {/* Bulking Status Evaluator Banner */}
      <div
        className={`p-4 rounded-xl border mb-5 transition-all ${
          bulkingStatus.variant === 'success'
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            : bulkingStatus.variant === 'warning'
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-rose-50/80 border-rose-300 text-rose-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {bulkingStatus.variant === 'success' ? (
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-700 text-lg" />
            ) : bulkingStatus.variant === 'warning' ? (
              <FontAwesomeIcon icon={faBolt} className="text-amber-700 text-lg" />
            ) : (
              <FontAwesomeIcon icon={faTriangleExclamation} className="text-rose-700 text-lg" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-bold text-body-sm leading-tight">
              {bulkingStatus.title}
            </h4>
            <p className="text-caption mt-0.5 leading-relaxed opacity-90">
              {bulkingStatus.desc}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider block">
              {activeDate}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Main Macro Progress Cards: Calories & Protein */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Calories Card */}
        <div className="p-4 rounded-xl border border-border bg-surface shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 bg-amber-50 p-1.5 rounded-lg border border-amber-200 flex items-center justify-center w-7 h-7">
                <FontAwesomeIcon icon={faFire} className="text-xs" />
              </span>
              <div>
                <span className="text-caption font-bold uppercase tracking-wider text-slate block">
                  Total Kalori Harian
                </span>
                <span className="text-[11px] text-slate-500">
                  Target Clean Bulk: {nutritionTarget.targetCalories.toLocaleString('id-ID')} kkal
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-h3 font-mono font-bold text-navy tabular-nums">
                {totalCalories.toLocaleString('id-ID')}
              </span>
              <span className="text-caption font-mono text-slate block">
                / {nutritionTarget.targetCalories.toLocaleString('id-ID')} kkal
              </span>
            </div>
          </div>

          <ProgressBar
            value={totalCalories}
            max={nutritionTarget.targetCalories}
            color={caloriesPct >= 100 ? 'sage' : caloriesPct >= 80 ? 'warning' : 'error'}
            size="md"
            showLabel={false}
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-slate mt-2">
            <span className={caloriesPct >= 100 ? 'text-sage font-bold' : 'text-slate-600'}>
              Tercapai {caloriesPct}%
            </span>
            <span className="text-navy font-semibold">
              {remainingCalories > 0 ? `Sisa: ${remainingCalories} kkal lagi` : 'Surplus Tercapai!'}
            </span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-4 rounded-xl border border-border bg-surface shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-600 bg-blue-50 p-1.5 rounded-lg border border-blue-200 flex items-center justify-center w-7 h-7">
                <FontAwesomeIcon icon={faDna} className="text-xs" />
              </span>
              <div>
                <span className="text-caption font-bold uppercase tracking-wider text-slate block">
                  Total Protein Harian
                </span>
                <span className="text-[11px] text-slate-500">
                  Target Otot: {nutritionTarget.targetProtein}g (~2g/kg BB)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-h3 font-mono font-bold text-navy tabular-nums">
                {totalProtein.toFixed(1)}g
              </span>
              <span className="text-caption font-mono text-slate block">
                / {nutritionTarget.targetProtein}g
              </span>
            </div>
          </div>

          <ProgressBar
            value={totalProtein}
            max={nutritionTarget.targetProtein}
            color={proteinPct >= 100 ? 'sage' : proteinPct >= 80 ? 'warning' : 'navy'}
            size="md"
            showLabel={false}
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-slate mt-2">
            <span className={proteinPct >= 100 ? 'text-sage font-bold' : 'text-slate-600'}>
              Tercapai {proteinPct}%
            </span>
            <span className="text-navy font-semibold">
              {remainingProtein > 0 ? `Sisa: ${remainingProtein.toFixed(1)}g lagi` : 'Protein Optimal!'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Presets ("Nyemil Cepat") */}
      <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-caption font-bold text-navy">
            <FontAwesomeIcon icon={faCookieBite} className="text-amber-500 text-xs" />
            <span>Pilihan Camilan / Makanan Cepat (1-Klik Tambah):</span>
          </div>
          <span className="text-[10px] text-slate font-mono">Clean Bulk Friendly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {QUICK_BULKING_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickAdd(p)}
              className="p-2 rounded-lg bg-white border border-border hover:border-navy hover:bg-navy/5 text-left transition-all cursor-pointer shadow-2xs group"
            >
              <span className="text-caption font-bold text-navy block truncate group-hover:text-navy">
                + {p.name.split('(')[0].trim()}
              </span>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate mt-0.5">
                <span className="text-amber-700 font-semibold">{p.calories} kkal</span>
                <span className="text-blue-700 font-semibold">{p.protein}g P</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Meals List for Active Day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-body-sm font-heading font-bold text-navy">
            Daftar Makanan & Camilan Tercatat ({dayMeals.length})
          </h4>
          <span className="text-caption text-slate font-mono">
            Total: {totalCalories} kkal • {totalProtein}g protein
          </span>
        </div>

        {dayMeals.length === 0 ? (
          <div className="p-6 text-center text-caption text-slate border border-dashed border-border rounded-xl bg-slate-50/40">
            <FontAwesomeIcon icon={faUtensils} className="text-slate-300 text-2xl mb-2 block mx-auto" />
            <p className="font-semibold text-navy">Belum ada makanan/camilan tercatat untuk tanggal {activeDate}</p>
            <p className="text-[11px] text-slate mt-0.5">
              Klik salah satu camilan cepat di atas atau tombol <strong>Catat Makan</strong> untuk mulai memantau asupan bulking kamu
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayMeals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:border-slate/40 transition-colors"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-body-sm font-heading font-bold text-navy">
                      {meal.name}
                    </span>
                    <Badge variant="default" className="text-[10px] py-0 px-2 font-medium">
                      {CATEGORY_LABELS[meal.category] || 'Makan'}
                    </Badge>
                    {meal.time && (
                      <span className="text-[10px] font-mono text-slate bg-slate-100 px-1.5 rounded">
                        {meal.time}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-body-sm font-mono font-bold text-navy tabular-nums block">
                      {meal.calories} kkal
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-blue-700 block">
                      {meal.protein}g protein
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(meal)}
                      className="h-7 w-7 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Ubah catatan makanan"
                      aria-label="Edit makanan"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmMeal(meal)}
                      className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                      title="Hapus catatan makanan"
                      aria-label="Hapus makanan"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-6 z-10 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faUtensils} className="h-4 w-4 text-navy" />
                <h3 className="text-h4 font-heading font-bold text-navy">
                  {editingMeal ? 'Ubah Catatan Makanan' : 'Catat Makan & Nyemil Bulking'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMeal} className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Nama Makanan / Minuman / Camilan
                </label>
                <input
                  type="text"
                  required
                  list="bulkingSuggestions"
                  placeholder="Contoh: Dada Ayam 200g + Nasi, Whey Protein, Telur Rebus"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
                <datalist id="bulkingSuggestions">
                  <option value="Dada Ayam 150g" />
                  <option value="Dada Ayam 200g + Nasi Putih" />
                  <option value="1 Scoop Whey Protein" />
                  <option value="2 Butir Telur Rebus" />
                  <option value="3 Butir Telur Dadar" />
                  <option value="Susu UHT Full Cream 250ml" />
                  <option value="Pisang Cavendish + Selai Kacang" />
                  <option value="Nasi Padang Lauk Ayam Bakar" />
                  <option value="Tempe Goreng 4 Potong" />
                  <option value="Oatmeal + Susu + Whey" />
                </datalist>
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Kategori Waktu Makan
                </label>
                <select
                  value={mealCategory}
                  onChange={(e) => setMealCategory(e.target.value as MealCategory)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy cursor-pointer"
                >
                  <option value="sarapan">Sarapan Pagi</option>
                  <option value="makan_siang">Makan Siang</option>
                  <option value="makan_malam">Makan Malam</option>
                  <option value="nyemil">Camilan / Nyemil</option>
                  <option value="pre_post_workout">Pre / Post Workout</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm font-medium text-navy mb-1.5">
                    Estimasi Kalori (kkal)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="350"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface font-mono font-bold text-body-sm text-navy focus:outline-none focus:border-navy"
                  />
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-navy mb-1.5">
                    Protein (gram)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="25"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface font-mono font-bold text-body-sm text-navy focus:outline-none focus:border-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Tanggal Pencatatan
                </label>
                <input
                  type="date"
                  required
                  value={mealDate}
                  onChange={(e) => setMealDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface font-mono text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md">
                  {editingMeal ? 'Simpan Perubahan' : 'Catat Makan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Target Modal with Automatic Biometrics Calculation */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={() => setShowTargetModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border shadow-2xl p-5 sm:p-6 z-10 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8.5 w-8.5 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-body sm:text-h4 font-heading font-bold text-navy">
                    Kalkulator Nutrisi Otomatis
                  </h3>
                  <p className="text-[11px] text-slate">
                    Kalori & protein dihitung otomatis dari TB & BB kamu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="h-8 w-8 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTargets} className="space-y-4">
              {/* Biometrics Inputs: TB & BB */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-navy mb-1">
                    <FontAwesomeIcon icon={faRulerVertical} className="text-navy text-[10px]" />
                    <span>Tinggi Badan (cm)</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={heightInput}
                    onChange={(e) => setHeightInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface font-mono font-bold text-navy focus:outline-none focus:border-navy text-body-sm"
                    placeholder="168"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-navy mb-1">
                    <FontAwesomeIcon icon={faWeightScale} className="text-navy text-[10px]" />
                    <span>Berat Badan (kg)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-surface font-mono font-bold text-navy focus:outline-none focus:border-navy text-body-sm"
                    placeholder="57.8"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center justify-between text-[11px] font-semibold text-navy mb-1">
                  <span>Target Berat Badan (Goal, kg)</span>
                  <span className="text-[10px] font-mono text-sage font-bold">
                    Selisih: {((parseFloat(targetWeightInput) || 68) - (parseFloat(weightInput) || 57.8)).toFixed(1)} kg
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={targetWeightInput}
                  onChange={(e) => setTargetWeightInput(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-surface font-mono font-bold text-navy focus:outline-none focus:border-navy text-body-sm"
                  placeholder="68.0"
                />
              </div>

              {/* Surplus Mode Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-navy mb-1.5">
                  Target Surplus Kalori Bulking
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Lean Bulk', surplus: 200, note: '+200 kkal' },
                    { label: 'Clean Bulk', surplus: 350, note: '+350 kkal' },
                    { label: 'Aggressive', surplus: 500, note: '+500 kkal' },
                  ].map((s) => (
                    <button
                      key={s.surplus}
                      type="button"
                      onClick={() => setSurplusMode(s.surplus)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        surplusMode === s.surplus
                          ? 'border-navy bg-navy/5 shadow-2xs font-bold text-navy'
                          : 'border-border bg-surface text-slate hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-[11px] font-bold">{s.label}</span>
                      <span className="block text-[10px] font-mono opacity-80">{s.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Auto Calculation Live Preview */}
              {(() => {
                const curH = parseFloat(heightInput) || profile.heightCm || 168
                const curW = parseFloat(weightInput) || profile.bodyWeightKg || 57.8
                const computed = calculateNutritionFromBiometrics(curH, curW, surplusMode)
                const bmr = Math.round(10 * curW + 6.25 * curH - 5 * 24 + 5)
                const tdee = Math.round(bmr * 1.45)

                return (
                  <div className="p-3.5 rounded-xl bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FontAwesomeIcon icon={faBolt} className="text-amber-600 text-[10px]" />
                        <span>Kalkulasi Otomatis (Mifflin - St Jeor)</span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-600">
                        BMR: {bmr} • TDEE: {tdee}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-surface/90 border border-border shadow-2xs">
                        <span className="text-[10px] text-slate block">Target Kalori Harian</span>
                        <span className="text-body font-mono font-bold text-amber-700">
                          {isManualOverride ? targetCaloriesInput : computed.targetCalories} kkal
                        </span>
                        <span className="text-[9px] text-slate-500 block">Surplus +{surplusMode} kkal</span>
                      </div>
                      <div className="p-2 rounded-lg bg-surface/90 border border-border shadow-2xs">
                        <span className="text-[10px] text-slate block">Target Protein Harian</span>
                        <span className="text-body font-mono font-bold text-blue-700">
                          {isManualOverride ? targetProteinInput : computed.targetProtein} g
                        </span>
                        <span className="text-[9px] text-slate-500 block">2.0g per kg BB ({curW} kg)</span>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Manual Override Option */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsManualOverride(!isManualOverride)}
                  className="text-[11px] text-slate hover:text-navy font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faSliders} className="text-[10px]" />
                  <span>{isManualOverride ? 'Tutup Input Manual' : 'Sesuaikan Angka Manual (Opsional)'}</span>
                </button>

                {isManualOverride && (
                  <div className="grid grid-cols-2 gap-2.5 mt-2.5 p-3 rounded-xl bg-slate-50 border border-border animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-medium text-navy mb-1">
                        Manual Kalori (kkal)
                      </label>
                      <input
                        type="number"
                        value={targetCaloriesInput}
                        onChange={(e) => setTargetCaloriesInput(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-surface font-mono font-bold text-navy text-caption"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-navy mb-1">
                        Manual Protein (g)
                      </label>
                      <input
                        type="number"
                        value={targetProteinInput}
                        onChange={(e) => setTargetProteinInput(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-surface font-mono font-bold text-navy text-caption"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setShowTargetModal(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="md">
                  Simpan ke Neon DB
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Meal Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmMeal}
        onClose={() => setDeleteConfirmMeal(null)}
        onConfirm={() => {
          if (deleteConfirmMeal) {
            onDeleteMeal(deleteConfirmMeal.id)
            showToast(`Makanan "${deleteConfirmMeal.name}" berhasil dihapus`, 'info')
          }
        }}
        title="Hapus Catatan Makanan"
        message={`Yakin ingin menghapus catatan "${deleteConfirmMeal?.name}" (${deleteConfirmMeal?.calories} kkal)? Data nutrisi ini akan dihapus permanen.`}
        confirmText="Ya, Hapus"
        variant="danger"
      />
    </Card>
  )
}
