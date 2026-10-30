'use client'

import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faWallet,
  faBuildingColumns,
  faChartLine,
  faMobileScreenButton,
  faPlus,
  faPenToSquare,
  faTrashCan,
  faCheck,
  faXmark,
  faMoneyBillWave,
  faBullseye,
} from '@fortawesome/free-solid-svg-icons'
import { Storage } from '@/lib/storage'
import type { FinancialAccount, AccountType } from '@/types'
import { formatRupiah, formatDots, parseDots } from '@/lib/format'
import { Card, Badge, Button, showToast } from '@/components/ui'

const TYPE_CONFIG: Record<
  AccountType,
  { label: string; icon: any }
> = {
  cash: { label: 'Cash / Tunai', icon: faMoneyBillWave },
  bank: { label: 'Bank', icon: faBuildingColumns },
  investment: { label: 'Investasi', icon: faChartLine },
  ewallet: { label: 'E-Wallet', icon: faMobileScreenButton },
}

export default function AccountsWidget() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])

  // Modal edit saldo cepat
  const [editingBalanceAcc, setEditingBalanceAcc] = useState<FinancialAccount | null>(null)
  const [balanceInput, setBalanceInput] = useState('')

  // Modal tambah / edit detail akun
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [editingAcc, setEditingAcc] = useState<FinancialAccount | null>(null)
  const [accName, setAccName] = useState('')
  const [accType, setAccType] = useState<AccountType>('bank')
  const [accBalance, setAccBalance] = useState('')
  const [accNotes, setAccNotes] = useState('')
  const [accGoalTitle, setAccGoalTitle] = useState('')
  const [accTargetAmount, setAccTargetAmount] = useState('')

  // Load & listen to changes
  useEffect(() => {
    const refresh = () => {
      setAccounts(Storage.getAccounts())
    }
    refresh()
    window.addEventListener('lifetime-data-change', refresh)
    return () => window.removeEventListener('lifetime-data-change', refresh)
  }, [])

  const totalWealth = accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0)

  // Handlers
  const handleOpenBalanceEdit = (acc: FinancialAccount) => {
    setEditingBalanceAcc(acc)
    setBalanceInput(acc.balance ? formatDots(acc.balance) : '')
  }

  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBalanceAcc) return
    const numeric = parseDots(balanceInput)
    if (isNaN(numeric) || numeric < 0) {
      showToast('Masukkan nominal saldo yang valid', 'error')
      return
    }
    const updated = Storage.updateAccountBalance(editingBalanceAcc.id, numeric)
    setAccounts(updated)
    showToast(`Saldo ${editingBalanceAcc.name} diubah ke ${formatRupiah(numeric)}`, 'success')
    setEditingBalanceAcc(null)
  }

  const handleOpenAddModal = () => {
    setEditingAcc(null)
    setAccName('')
    setAccType('bank')
    setAccBalance('')
    setAccNotes('')
    setAccGoalTitle('')
    setAccTargetAmount('')
    setShowAccountModal(true)
  }

  const handleOpenEditModal = (acc: FinancialAccount) => {
    setEditingAcc(acc)
    setAccName(acc.name)
    setAccType(acc.type)
    setAccBalance(acc.balance ? formatDots(acc.balance) : '')
    setAccNotes(acc.notes || '')
    setAccGoalTitle(acc.goalTitle || '')
    setAccTargetAmount(acc.targetAmount ? formatDots(acc.targetAmount) : '')
    setShowAccountModal(true)
  }

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accName.trim()) {
      showToast('Nama rekening/dompet harus diisi', 'error')
      return
    }
    const numericBalance = parseDots(accBalance) || 0
    const numericTarget = parseDots(accTargetAmount) || undefined

    const accountData: Partial<FinancialAccount> = {
      name: accName.trim(),
      type: accType,
      balance: numericBalance,
      notes: accNotes.trim(),
      goalTitle: accGoalTitle.trim() || undefined,
      targetAmount: numericTarget,
    }

    if (editingAcc) {
      const updated = Storage.updateAccount(editingAcc.id, accountData)
      setAccounts(updated)
      showToast(`Rekening ${accName} berhasil diperbarui`, 'success')
    } else {
      const newAcc = Storage.addAccount({
        name: accName.trim(),
        type: accType,
        balance: numericBalance,
        notes: accNotes.trim(),
        goalTitle: accGoalTitle.trim() || undefined,
        targetAmount: numericTarget,
      })
      setAccounts(Storage.getAccounts())
      showToast(`Rekening ${newAcc.name} berhasil ditambahkan`, 'success')
    }
    setShowAccountModal(false)
  }

  const handleDeleteAccount = (acc: FinancialAccount) => {
    if (accounts.length <= 1) {
      showToast('Minimal harus ada 1 akun rekening/dompet', 'error')
      return
    }
    if (confirm(`Hapus rekening "${acc.name}"?`)) {
      Storage.deleteAccount(acc.id)
      setAccounts(Storage.getAccounts())
      showToast(`Rekening ${acc.name} dihapus`, 'info')
    }
  }

  return (
    <Card className="p-4 sm:p-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-sage/10 text-sage">
            <FontAwesomeIcon icon={faBuildingColumns} className="h-4 w-4 sm:h-5 sm:w-5 text-sage" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-body-lg sm:text-h4 font-heading font-bold text-navy">
                Posisi Saldo & Alokasi Rekening
              </h3>
              <Badge variant="success" className="text-[10px] py-0.5 px-2">
                Real-Time
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-h3 font-bold text-navy tabular-nums font-mono">
                {formatRupiah(totalWealth)}
              </span>
              <span className="text-caption text-slate font-mono">
                Total {accounts.length} Akun
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleOpenAddModal}
          className="gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
          <span>Tambah Akun</span>
        </Button>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map((acc) => {
          const cfg = TYPE_CONFIG[acc.type] || TYPE_CONFIG.bank
          const hasTarget = Boolean(acc.targetAmount && acc.targetAmount > 0)
          const pct = hasTarget
            ? Math.min(100, Math.round((acc.balance / acc.targetAmount!) * 100))
            : 0
          const remaining = hasTarget ? Math.max(0, acc.targetAmount! - acc.balance) : 0

          return (
            <div
              key={acc.id}
              className="p-3.5 rounded-xl border border-border bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Type badge & Actions */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border border-border bg-white text-slate font-semibold flex items-center gap-1.5">
                    <FontAwesomeIcon icon={cfg.icon} className="text-[10px] text-slate" />
                    <span>{cfg.label}</span>
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenBalanceEdit(acc)}
                      className="h-6 w-6 rounded-md hover:bg-slate-200 text-slate hover:text-navy flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Ubah Saldo"
                      aria-label="Ubah Saldo"
                    >
                      <FontAwesomeIcon icon={faPenToSquare} className="text-[10px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(acc)}
                      className="h-6 w-6 rounded-md hover:bg-slate-200 text-slate hover:text-navy flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Edit Detail / Target"
                      aria-label="Edit Detail"
                    >
                      <span className="text-[10px] font-mono leading-none">···</span>
                    </button>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAccount(acc)}
                        className="h-6 w-6 rounded-md hover:bg-rose-100 text-slate-400 hover:text-rose-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title="Hapus Akun"
                        aria-label="Hapus Akun"
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Account Name */}
                <h4 className="text-body-sm font-heading font-bold text-navy wrap-break-word">
                  {acc.name}
                </h4>

                {/* Saldo */}
                <div
                  onClick={() => handleOpenBalanceEdit(acc)}
                  className="mt-1 cursor-pointer group/val"
                  title="Klik untuk ubah saldo"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-h3 font-mono font-bold text-navy tabular-nums">
                      {formatRupiah(acc.balance)}
                    </span>
                    <span className="text-[10px] text-slate-400 opacity-0 group-hover/val:opacity-100 transition-opacity font-mono underline">
                      ubah
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <p className="text-[11px] text-slate mt-0.5 wrap-break-word">
                  {acc.notes || '—'}
                </p>
              </div>

              {/* INTEGRATED SAVINGS TARGET (Solid Progress Bar, Zero Gradient, Zero Emoji) */}
              {hasTarget ? (
                <div className="mt-3 pt-2.5 border-t border-border/80">
                  <div className="flex items-start justify-between gap-2 text-[11px] mb-1 font-mono">
                    <div className="flex items-start gap-1.5 min-w-0 pr-1">
                      <FontAwesomeIcon icon={faBullseye} className="text-navy text-[10px] mt-0.5 shrink-0" />
                      <span className="font-semibold text-navy wrap-break-word">
                        {acc.goalTitle || 'Target Tabungan'}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-navy font-bold shrink-0">
                      {pct}%
                    </span>
                  </div>

                  {/* Solid Progress Bar (NO GRADIENT) */}
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden relative">
                    <div
                      className="h-full bg-navy rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-1 text-[10px] text-slate mt-1 font-mono">
                    <span>
                      {acc.balance >= acc.targetAmount!
                        ? 'Target Tercapai Penuh'
                        : `Target: ${formatRupiah(acc.targetAmount!)}`}
                    </span>
                    <span className="text-sage font-medium shrink-0">
                      {acc.balance >= acc.targetAmount! ? 'Tuntas' : `Sisa ${formatRupiah(remaining)}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px] text-slate font-mono">
                  <span>Operasional harian</span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(acc)}
                    className="text-[10px] text-navy hover:underline cursor-pointer"
                  >
                    + Target Tabungan
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Quick Balance Edit Modal (Matching System Theme) */}
      {editingBalanceAcc && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface border border-border p-5 shadow-2xl text-navy animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate font-semibold">
                  Ubah Saldo Akun
                </span>
                <h4 className="text-body-md font-heading font-bold text-navy">
                  {editingBalanceAcc.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingBalanceAcc(null)}
                className="h-7 w-7 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveBalance} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate mb-1">
                  Nominal Saldo Aktual (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm font-mono text-slate font-bold">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(formatDots(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-border bg-surface text-navy font-mono text-body-lg font-bold focus:outline-hidden focus:border-navy"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="block text-[10px] font-mono text-slate mb-1.5">
                  Preset Cepat
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '100rb', val: 100000 },
                    { label: '250rb', val: 250000 },
                    { label: '500rb', val: 500000 },
                    { label: '1 Jt', val: 1000000 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setBalanceInput(formatDots(String(p.val)))}
                      className="py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-navy border border-border transition-colors cursor-pointer text-center"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingBalanceAcc(null)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                >
                  <FontAwesomeIcon icon={faCheck} className="text-xs" />
                  <span>Simpan Saldo</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Detail Account & Linked Target Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-surface border border-border p-5 shadow-2xl text-navy animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h4 className="text-body-md font-heading font-bold text-navy">
                {editingAcc ? 'Edit Rekening & Target Tabungan' : 'Tambah Rekening Baru'}
              </h4>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="h-7 w-7 rounded-lg text-slate hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-slate mb-1">
                  Nama Rekening / Akun (Contoh: Bank BSI, SeaBank, Bank Jago, Dompet)
                </label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Misal: Bank BSI"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-navy font-medium text-body-sm focus:outline-hidden focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate mb-1">
                  Tipe Akun
                </label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as AccountType)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-navy font-medium text-body-sm focus:outline-hidden focus:border-navy"
                >
                  <option value="bank">Bank</option>
                  <option value="cash">Cash / Tunai</option>
                  <option value="investment">Investasi / Reksadana</option>
                  <option value="ewallet">E-Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate mb-1">
                  Saldo Saat Ini (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm font-mono text-slate font-bold">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accBalance}
                    onChange={(e) => setAccBalance(formatDots(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-border bg-surface text-navy font-mono text-body-md font-bold focus:outline-hidden focus:border-navy"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* INTEGRATED TARGET GOAL SECTION */}
              <div className="p-3 rounded-xl bg-slate-50 border border-border space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-navy font-bold">
                  <FontAwesomeIcon icon={faBullseye} />
                  <span>Target Tabungan / Rencana (Opsional)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate mb-1">
                      Nama Target
                    </label>
                    <input
                      type="text"
                      value={accGoalTitle}
                      onChange={(e) => setAccGoalTitle(e.target.value)}
                      placeholder="Contoh: Tabungan Motor"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-navy text-caption focus:outline-hidden focus:border-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate mb-1">
                      Nominal Target (Rp)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={accTargetAmount}
                      onChange={(e) => setAccTargetAmount(formatDots(e.target.value))}
                      placeholder="Contoh: 20.000.000"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-navy font-mono text-caption font-bold focus:outline-hidden focus:border-navy"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate mb-1">
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={accNotes}
                  onChange={(e) => setAccNotes(e.target.value)}
                  placeholder="Misal: Kantong Operasional, Reksa Dana, dll"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-navy text-body-sm focus:outline-hidden focus:border-navy"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAccountModal(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                >
                  <FontAwesomeIcon icon={faCheck} className="text-xs" />
                  <span>{editingAcc ? 'Perbarui Akun' : 'Simpan Akun'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  )
}
