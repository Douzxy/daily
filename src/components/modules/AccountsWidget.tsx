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
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons'
import { Storage } from '@/lib/storage'
import type { FinancialAccount, AccountType } from '@/types'
import { formatRupiah, formatDots, parseDots } from '@/lib/format'
import { showToast } from '@/components/ui'

const TYPE_CONFIG: Record<
  AccountType,
  { label: string; icon: any; defaultColor: string }
> = {
  cash: { label: 'Cash / Tunai', icon: faMoneyBillWave, defaultColor: 'emerald' },
  bank: { label: 'Bank', icon: faBuildingColumns, defaultColor: 'sky' },
  investment: { label: 'Investasi', icon: faChartLine, defaultColor: 'amber' },
  ewallet: { label: 'E-Wallet', icon: faMobileScreenButton, defaultColor: 'purple' },
}

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  sky: {
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/5',
    text: 'text-sky-400',
    badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  teal: {
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/5',
    text: 'text-teal-400',
    badge: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  },
  indigo: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/5',
    text: 'text-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  },
  purple: {
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    text: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  },
  rose: {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/5',
    text: 'text-rose-400',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  },
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
  const [accColor, setAccColor] = useState('sky')

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
    setBalanceInput(formatDots(String(acc.balance)))
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
    showToast(`Saldo ${editingBalanceAcc.name} berhasil diubah ke ${formatRupiah(numeric)}`, 'success')
    setEditingBalanceAcc(null)
  }

  const handleOpenAddModal = () => {
    setEditingAcc(null)
    setAccName('')
    setAccType('bank')
    setAccBalance('0')
    setAccNotes('')
    setAccColor('sky')
    setShowAccountModal(true)
  }

  const handleOpenEditModal = (acc: FinancialAccount) => {
    setEditingAcc(acc)
    setAccName(acc.name)
    setAccType(acc.type)
    setAccBalance(formatDots(String(acc.balance)))
    setAccNotes(acc.notes || '')
    setAccColor(acc.color || TYPE_CONFIG[acc.type].defaultColor)
    setShowAccountModal(true)
  }

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!accName.trim()) {
      showToast('Nama rekening/dompet harus diisi', 'error')
      return
    }
    const numeric = parseDots(accBalance) || 0

    if (editingAcc) {
      const updated = Storage.updateAccount(editingAcc.id, {
        name: accName.trim(),
        type: accType,
        balance: numeric,
        notes: accNotes.trim(),
        color: accColor,
      })
      setAccounts(updated)
      showToast(`Rekening ${accName} berhasil diperbarui!`, 'success')
    } else {
      const newAcc = Storage.addAccount({
        name: accName.trim(),
        type: accType,
        balance: numeric,
        notes: accNotes.trim(),
        color: accColor,
      })
      setAccounts(Storage.getAccounts())
      showToast(`Rekening ${newAcc.name} berhasil ditambahkan!`, 'success')
    }
    setShowAccountModal(false)
  }

  const handleDeleteAccount = (acc: FinancialAccount) => {
    if (accounts.length <= 1) {
      showToast('Minimal harus ada 1 akun rekening/dompet', 'error')
      return
    }
    if (confirm(`Yakin ingin menghapus rekening "${acc.name}"?`)) {
      Storage.deleteAccount(acc.id)
      setAccounts(Storage.getAccounts())
      showToast(`Rekening ${acc.name} dihapus`, 'info')
    }
  }

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-navy text-white shadow-sm border border-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
              Posisi Saldo Riil Saat Ini
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Saldo Langsung (Bukan Pemasukan)
            </span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-1">
            <h2 className="text-h3 sm:text-h2 font-heading font-bold text-white tabular-nums tracking-tight">
              {formatRupiah(totalWealth)}
            </h2>
            <span className="text-caption text-slate-400 font-mono">
              Total Seluruh Rekening ({accounts.length})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="h-8.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-[11px] font-heading font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faPlus} className="text-xs" />
            <span>+ Tambah Bank / Dompet</span>
          </button>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map((acc) => {
          const cfg = TYPE_CONFIG[acc.type] || TYPE_CONFIG.bank
          const theme = COLOR_MAP[acc.color || cfg.defaultColor] || COLOR_MAP.sky

          return (
            <div
              key={acc.id}
              className={`p-3.5 rounded-xl border ${theme.border} ${theme.bg} relative group transition-all hover:border-white/30`}
            >
              {/* Card Top: Type badge & Actions */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border ${theme.badge} flex items-center gap-1.5`}>
                  <FontAwesomeIcon icon={cfg.icon} className="text-[10px]" />
                  <span>{cfg.label}</span>
                </span>

                <div className="flex items-center gap-1 opacity-90 sm:opacity-75 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleOpenBalanceEdit(acc)}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                    title="Ubah Saldo Langsung"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} className="text-[10px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(acc)}
                    className="h-6 w-6 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
                    title="Edit Nama / Keterangan"
                  >
                    <span className="text-[10px] font-mono">···</span>
                  </button>
                  {accounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(acc)}
                      className="h-6 w-6 rounded-md bg-white/10 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Hapus Rekening"
                    >
                      <FontAwesomeIcon icon={faTrashCan} className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Account Name */}
              <h3 className="text-body-sm font-heading font-bold text-white truncate" title={acc.name}>
                {acc.name}
              </h3>

              {/* Saldo (Clickable for fast update) */}
              <div
                onClick={() => handleOpenBalanceEdit(acc)}
                className="mt-1 cursor-pointer group/val"
                title="Klik untuk langsung ubah saldo"
              >
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-h4 font-mono font-bold ${theme.text} tabular-nums tracking-tight`}>
                    {formatRupiah(acc.balance)}
                  </span>
                  <span className="text-[10px] text-slate-400 opacity-0 group-hover/val:opacity-100 transition-opacity font-mono underline">
                    edit
                  </span>
                </div>
              </div>

              {/* Notes / Sisa info */}
              <p className="text-[11px] text-slate-300 mt-1 truncate" title={acc.notes}>
                {acc.notes || '—'}
              </p>
            </div>
          )
        })}
      </div>

      {/* Quick Balance Edit Modal */}
      {editingBalanceAcc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Ubah Saldo Akun
                </span>
                <h4 className="text-body-md font-heading font-bold text-white">
                  {editingBalanceAcc.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setEditingBalanceAcc(null)}
                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveBalance} className="mt-4 space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Nominal Saldo Aktual (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm font-mono text-slate-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoFocus
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(formatDots(e.target.value))}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white font-mono text-body-lg font-bold focus:outline-hidden focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <span className="block text-[10px] font-mono text-slate-400 mb-1.5">
                  Preset Cepat
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '81rb', val: 81000 },
                    { label: '73rb', val: 73000 },
                    { label: '1 Jt', val: 1000000 },
                    { label: '2 Jt', val: 2000000 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setBalanceInput(formatDots(String(p.val)))}
                      className="py-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] font-mono text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer text-center"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingBalanceAcc(null)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-body-xs font-heading font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-body-xs font-heading font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faCheck} className="text-xs" />
                  <span>Simpan Saldo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Detail Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="text-body-md font-heading font-bold text-white">
                {editingAcc ? 'Edit Rekening / Dompet' : 'Tambah Bank / Dompet Baru'}
              </h4>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Nama Rekening / Akun (Contoh: Bank BSI, SeaBank, BCA, Dompet)
                </label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="Misal: Bank BSI"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-white font-medium text-body-sm focus:outline-hidden focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Tipe Akun
                  </label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/20 text-white font-medium text-body-sm focus:outline-hidden focus:border-sky-400"
                  >
                    <option value="bank">Bank</option>
                    <option value="cash">Cash / Tunai</option>
                    <option value="investment">Investasi / Reksadana</option>
                    <option value="ewallet">E-Wallet (Dana/Gopay/Shopee)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1">
                    Warna Aksen
                  </label>
                  <select
                    value={accColor}
                    onChange={(e) => setAccColor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/20 text-white font-medium text-body-sm focus:outline-hidden focus:border-sky-400"
                  >
                    <option value="sky">Sky (Biru Terang)</option>
                    <option value="emerald">Emerald (Hijau Cash)</option>
                    <option value="amber">Amber (Kuning Emas)</option>
                    <option value="teal">Teal (Hijau BSI)</option>
                    <option value="indigo">Indigo (Ungu SeaBank)</option>
                    <option value="purple">Purple (Ungu OVO)</option>
                    <option value="rose">Rose (Merah)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Saldo Saat Ini (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-body-sm font-mono text-slate-400 font-bold">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={accBalance}
                    onChange={(e) => setAccBalance(formatDots(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/20 text-white font-mono text-body-md font-bold focus:outline-hidden focus:border-sky-400"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 mb-1">
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={accNotes}
                  onChange={(e) => setAccNotes(e.target.value)}
                  placeholder="Misal: Kantong Operasional, Dana Darurat, Gaji"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-white text-body-sm focus:outline-hidden focus:border-sky-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-body-xs font-heading font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-body-xs font-heading font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FontAwesomeIcon icon={faCheck} className="text-xs" />
                  <span>{editingAcc ? 'Perbarui Akun' : 'Simpan Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
