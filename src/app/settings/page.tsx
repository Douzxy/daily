'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Card, Button, showToast } from '@/components/ui'
import { formatDots, parseDots } from '@/lib/format'
import { Storage } from '@/lib/storage'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faShieldHalved,
  faDownload,
  faRotateLeft,
  faArrowsRotate,
  faDatabase,
  faCloudArrowDown,
  faCircleCheck,
  faWeightScale,
  faWallet,
  faRulerVertical,
  faHeartPulse,
  faLock,
  faKey,
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
      city: 'Tangerang Selatan',
    }
  })

  const [salaryStr, setSalaryStr] = useState(() => formatDots(profile.salary || 2800000))
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Calculations
  const heightM = profile.heightCm > 0 ? profile.heightCm / 100 : 1.68
  const bmi = profile.bodyWeightKg > 0 ? (profile.bodyWeightKg / (heightM * heightM)).toFixed(1) : '20.4'
  const weightDiff = (profile.targetWeightKg - profile.bodyWeightKg).toFixed(1)
  const dailyCalories = Math.round(profile.bodyWeightKg * 33 + 400) // ~2.300 kcal clean bulk
  const dailyProtein = Math.round(profile.bodyWeightKg * 2.0) // ~115g

  // Synchronize salaryStr when profile loads or updates
  useEffect(() => {
    if (profile.salary) {
      setSalaryStr(formatDots(profile.salary))
    }
  }, [profile.salary])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    await Storage.syncBeforeAction()
    const numericSalary = parseDots(salaryStr)
    const updatedProfile = { ...profile, salary: numericSalary }
    setProfile(updatedProfile)
    Storage.saveUserProfile(updatedProfile)
    setSavedSuccess(true)
    showToast(`Profil Edo (Gaji Rp ${formatDots(numericSalary)}, BB ${profile.bodyWeightKg} kg, ${profile.city}) berhasil disimpan & disinkron ke database!`, 'success')
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleSyncFromDatabase = async () => {
    showToast('Menghubungi database Neon PostgreSQL...', 'info')
    const ok = await Storage.syncFromDatabase()
    if (ok) {
      const latest = Storage.getUserProfile()
      setProfile(latest)
      setSalaryStr(formatDots(latest.salary || 2800000))
      showToast('Seluruh data berhasil disinkronkan dari Neon PostgreSQL!', 'success')
    } else {
      showToast('Gagal menyinkronkan data dari cloud database', 'error')
    }
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordInput.trim()) return
    Storage.setAppPassword(passwordInput.trim())
    setPasswordSuccess(true)
    setPasswordInput('')
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  const handleQuickSyncDefaults = () => {
    const updated = {
      ...profile,
      salary: 2800000,
      bodyWeightKg: 57.5,
      heightCm: 168,
      targetWeightKg: 62.0,
      city: 'Tangerang Selatan',
    }
    setProfile(updated)
    setSalaryStr('2.800.000')
    Storage.saveUserProfile(updated)
    showToast('Data default Edo disinkronkan ke cloud database!', 'success')
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
    a.download = `daily_backup_${new Date().toISOString().split('T')[0]}.json`
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
    <DashboardLayout title="Pengaturan">
      <div className="space-y-6 pb-12 max-w-4xl">
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-2 animate-fade-in text-body-sm font-medium">
            <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4 text-emerald-700" />
            <span>Perubahan data profil berhasil disimpan permanen dan disinkronkan ke seluruh widget!</span>
          </div>
        )}

        {/* 1. App Password & Security Lock Card */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-navy text-white flex items-center justify-center">
              <FontAwesomeIcon icon={faLock} className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-h4 font-heading font-bold text-navy">
                Keamanan & Password Kunci Aplikasi
              </h3>
              <p className="text-caption text-slate">
                Aplikasi dilindungi password (tanpa username).
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-2 text-caption font-semibold">
              <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-700" />
              <span>Password baru berhasil disimpan! Gunakan password ini untuk membuka aplikasi berikutnya.</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-3.5">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-body-sm font-medium text-navy mb-1.5">
                  Ubah Password / PIN Baru
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-border bg-surface text-body-sm text-navy focus:outline-none focus:border-navy font-mono"
                  />
                  <FontAwesomeIcon
                    icon={faKey}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate text-xs"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto">
                Simpan Password
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => Storage.lock()}
                className="w-full sm:w-auto gap-1.5"
              >
                <FontAwesomeIcon icon={faLock} className="h-3 w-3 text-navy" />
                <span>Kunci Sekarang</span>
              </Button>
            </div>
          </form>
        </Card>

        {/* 2. Profile Card */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-navy" />
              </div>
              <div className="min-w-0">
                <h3 className="text-body sm:text-h4 font-heading font-bold text-navy truncate">
                  Profil & Parameter Pribadi
                </h3>
                <p className="text-caption text-slate truncate">
                  Gaji bulanan, berat badan, tinggi badan & target kebugaran
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickSyncDefaults}
              className="w-full sm:w-auto group h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 hover:border-navy text-navy font-heading font-bold text-caption sm:text-body-sm shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              title="Sinkronkan ke Gaji Rp 2.800.000 & BB 57.5 kg (Tangsel)"
            >
              <FontAwesomeIcon
                icon={faArrowsRotate}
                className="h-3.5 w-3.5 text-navy group-hover:rotate-180 transition-transform duration-500"
              />
              <span>Sinkronkan Data Edo</span>
            </button>
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
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate text-body-sm">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={salaryStr}
                    onChange={(e) => {
                      const formatted = formatDots(e.target.value)
                      setSalaryStr(formatted)
                      const parsed = parseDots(formatted)
                      setProfile((prev) => ({ ...prev, salary: parsed }))
                    }}
                    className="w-full h-11 pl-11 pr-3.5 rounded-lg border border-border bg-surface text-body-sm font-mono font-bold text-navy focus:outline-none focus:border-navy"
                    placeholder="2.800.000"
                  />
                </div>
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
            <div className="p-4 rounded-xl bg-slate-50 border border-border mt-4">
              <span className="text-caption font-bold text-navy uppercase tracking-wider block mb-2">
                Ringkasan Biometrik & Nutrisi
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[11px] text-slate block">Indeks Massa Tubuh</span>
                  <span className="text-h3 font-bold text-navy font-mono">{bmi}</span>
                  <span className="text-[10px] text-sage block font-medium">Ideal / Normal</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-border">
                  <span className="text-[11px] text-slate block">Target Selisih BB</span>
                  <span className="text-h3 font-bold text-navy font-mono">
                    {Number(weightDiff) >= 0 ? `+${weightDiff}` : weightDiff} kg
                  </span>
                  <span className="text-[10px] text-slate block font-medium">Menuju {profile.targetWeightKg} kg</span>
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

                {/* Database & Multi-Device Sync Card */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <FontAwesomeIcon icon={faDatabase} className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-body sm:text-h4 font-heading font-bold text-navy">
                    Database Neon PostgreSQL
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    Aktif & Terhubung
                  </span>
                </div>
                <p className="text-caption text-slate mt-0.5">
                  Sinkronisasi multi-device otomatis antara HP, tablet & komputer
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncFromDatabase}
              className="w-full sm:w-auto h-9 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-navy text-navy font-heading font-bold text-caption shadow-xs hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              title="Tarik & sinkronkan data terbaru dari server Neon PostgreSQL"
            >
              <FontAwesomeIcon icon={faCloudArrowDown} className="h-3.5 w-3.5 text-navy" />
              <span>Tarik Data Cloud</span>
            </button>
          </div>
          <p className="text-caption text-slate bg-slate-50 p-3 rounded-xl border border-border leading-relaxed">
            Setiap perubahan data (gaji, to-do list, catatan tidur, berat badan & transaksi) otomatis tersimpan ke server database Neon PostgreSQL sehingga data Anda tetap sama saat berganti perangkat.
          </p>
        </Card>

        {/* 3. Data & Backup Card */}
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-border">
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-200 mt-3">
            <div>
              <h4 className="text-body-sm font-semibold text-red-900">
                Reset Seluruh Data
              </h4>
              <p className="text-caption text-red-700 mt-0.5">
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
