'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faTrashCan, faXmark } from '@fortawesome/free-solid-svg-icons'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning'
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  variant = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null

  const displayMessage = message || description || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border shadow-2xl p-5 z-10 animate-scale-in">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                variant === 'danger'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <FontAwesomeIcon
                icon={variant === 'danger' ? faTrashCan : faTriangleExclamation}
                className="h-4 w-4"
              />
            </div>
            <div>
              <h3 className="text-body font-heading font-bold text-navy leading-tight">
                {title}
              </h3>
              <span className="text-[11px] text-slate font-medium">Tindakan ini memerlukan konfirmasi</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Tutup"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
          </button>
        </div>

        <p className="text-body-sm text-slate-600 leading-relaxed my-3 bg-slate-50 p-3 rounded-xl border border-border/70">
          {displayMessage}
        </p>

        <div className="flex items-center justify-end gap-2 mt-4 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-body-sm font-semibold text-slate hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 rounded-xl text-body-sm font-heading font-bold text-white transition-all shadow-xs cursor-pointer active:scale-95 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
