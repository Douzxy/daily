'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, Button } from '@/components/ui'
import { Storage } from '@/lib/storage'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faShieldHalved,
  faDownload,
  faRotateLeft,
  faCircleCheck,
  faWeightScale,
  faWallet,
  faRulerVertical,
  faHeartPulse,
} from '@fortawesome/free-solid-svg-icons'

export default function SettingsPage() {
  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      return Storage.getUserProfile()
    }
    return {
      name: 'Edo',
      email: 'edopriyatna.tech@gmail.com',
      salary: 2800000,
      bodyWeightKg: 57.5,
      heightCm: 168,
      targetWeightKg: 62.0,
      city: 'DKI Jakarta',
    }
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  // Calculations
  const heightM = profile.heightCm > 0 ? profile.heightCm / 100 : 1.68
  const bmi = profile.bodyWeightKg > 0 ? (profile.bodyWeightKg / (heightM * heightM)).toFixed(1) : '20.4'
  const weightDiff = (profile.targetWeightKg - profile.bodyWeightKg).toFixed(1)
  const dailyCalories = Math.round(profile.bodyWeightKg * 33 + 400) // ~2.300 kcal clean bulk
  const dailyProtein = Math.round(profile.bodyWeightKg * 2.0) // ~115g

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    Storage.saveUserProfile(profile)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleExportData = () => {
    if (typeof window === 'undefined') return
    const exportData: Record<string, any> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('lifetime_')) {
        try {
          exportData[key] = JSON.parse(localStorage.getItem(key) || '{}')
        } catch {
          exportData[key] = localStorage.getItem(key)
        }
      }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lifetime_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mereset seluruh data ke data awal?')) {
      if (typeof window !== 'undefined') {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('lifetime_')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k))
        window.location.reload()
      }
    }
  }

  return (
    <DashboardLayout
      title="Pengaturan & Profil"
      subtitle="Kustomisasi identitas, gaji, target berat badan & kelola data aplikasi"
    >
      <div className="space-y-6 pb-12 max-w-4xl">
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 animate-fade-in text-body-sm">
            <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 text-sage" />
            <span>Perubahan data profil berhasil disimpan!</span>
          </div>
        )}

        {/* Profile Card */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-navy" />
            </div>
            <div>
              <h3 className="text-h4 font-heading font-bold text-navy">
                Profil & Parameter Pribadi
              </h3>
              <p className="text-caption text-slate">
                Gaji bulanan, berat badan, tinggi badan & target kebugaran
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Nama Lengkap / Panggilan
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-body-sm font-medium text-navy mb-1.5">
                  <FontAwesomeIcon icon={faWallet} className="h-3.5 w-3.5 text-sage" />
                  <span>Gaji Pokok Bulanan (Rp)</span>
                </label>
                <input
                  type="number"
                  value={profile.salary}
                  onChange={(e) => setProfile({ ...profile, salary: Number(e.target.value) || 0 })}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy font-mono"
                  placeholder="2800000"
                />
              </div>

              <div>
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Kota Lokasi Sholat
                </label>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-body-sm font-medium text-navy mb-1.5">
                  <FontAwesomeIcon icon={faWeightScale} className="h-3.5 w-3.5 text-navy" />
                  <span>Berat Badan Saat Ini (kg)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.bodyWeightKg}
                  onChange={(e) => setProfile({ ...profile, bodyWeightKg: parseFloat(e.target.value) || 0 })}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy font-mono"
                  placeholder="57.5"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-body-sm font-medium text-navy mb-1.5">
                  <FontAwesomeIcon icon={faRulerVertical} className="h-3.5 w-3.5 text-navy" />
                  <span>Tinggi Badan (cm)</span>
                </label>
                <input
                  type="number"
                  value={profile.heightCm}
                  onChange={(e) => setProfile({ ...profile, heightCm: parseFloat(e.target.value) || 0 })}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy font-mono"
                  placeholder="168"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-body-sm font-medium text-navy mb-1.5">
                  <FontAwesomeIcon icon={faHeartPulse} className="h-3.5 w-3.5 text-sage" />
                  <span>Target Berat Badan (Clean Bulk, kg)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.targetWeightKg}
                  onChange={(e) => setProfile({ ...profile, targetWeightKg: parseFloat(e.target.value) || 0 })}
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy font-mono"
                  placeholder="62.0"
                />
              </div>
            </div>

            {/* Live Health & Fitness Summary Pill */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border mt-4">
              <span className="text-caption font-bold text-navy uppercase tracking-wider block mb-2">
                Analisis Kesehatan & Rekomendasi Nutrisi
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[11px] text-slate block">Indeks Massa Tubuh (BMI)</span>
                  <span className="text-h3 font-bold text-navy font-mono">{bmi}</span>
                  <span className="text-[10px] text-sage block font-medium">Normal / Ideal</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[11px] text-slate block">Target Selisih BB</span>
                  <span className="text-h3 font-bold text-navy font-mono">
                    {Number(weightDiff) >= 0 ? `+${weightDiff}` : weightDiff} kg
                  </span>
                  <span className="text-[10px] text-slate block font-medium">Menuju 62 kg</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[11px] text-slate block">Target Kalori Harian</span>
                  <span className="text-h3 font-bold text-sage font-mono">~{dailyCalories}</span>
                  <span className="text-[10px] text-slate block font-medium">kkal / hari</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[11px] text-slate block">Kebutuhan Protein</span>
                  <span className="text-h3 font-bold text-navy font-mono">{dailyProtein} g</span>
                  <span className="text-[10px] text-slate block font-medium">2.0g per kg BB</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button type="submit" variant="primary" size="md">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>

        {/* Data & Backup Card */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center">
              <FontAwesomeIcon icon={faShieldHalved} className="h-4 w-4 text-navy" />
            </div>
            <div>
              <h3 className="text-h4 font-heading font-bold text-navy">
                Kelola Data & Cadangan
              </h3>
              <p className="text-caption text-slate">
                Seluruh data tersimpan secara lokal di browser Anda dengan zero latency
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-border/70">
            <div>
              <h4 className="text-body-sm font-semibold text-navy">
                Ekspor Backup JSON
              </h4>
              <p className="text-caption text-slate mt-0.5">
                Unduh seluruh data sholat, keuangan, catatan gym & to-do harian
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportData}
              className="gap-2 w-full sm:w-auto"
            >
              <FontAwesomeIcon icon={faDownload} className="h-3.5 w-3.5" />
              <span>Unduh Backup</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200/60 dark:border-red-900/40 mt-3">
            <div>
              <h4 className="text-body-sm font-semibold text-red-900 dark:text-red-300">
                Reset Seluruh Data
              </h4>
              <p className="text-caption text-red-700/80 dark:text-red-400/80 mt-0.5">
                Mengembalikan seluruh data ke kondisi bawaan awal
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetData}
              className="gap-2 w-full sm:w-auto"
            >
              <FontAwesomeIcon icon={faRotateLeft} className="h-3.5 w-3.5" />
              <span>Reset Data</span>
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
