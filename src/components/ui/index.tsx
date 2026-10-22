'use client'

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons'

/* ─── Card ─── */
interface CardProps {
  children: ReactNode
  className?: string
  elevated?: boolean
}

export function Card({ children, className = '', elevated = false, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-surface rounded-xl p-4 sm:p-6 transition-all duration-200
        ${elevated ? 'shadow-md border border-border hover:shadow-lg' : 'border border-border shadow-2xs hover:border-navy/30'}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

/* ─── StatCard ─── */
type ColorVariant = 'sage' | 'navy' | 'warning' | 'error' | 'info'

interface StatCardProps {
  label: string
  value: string | number
  sublabel?: string
  icon?: IconDefinition
  trend?: string
  trendUp?: boolean
  color?: ColorVariant
}

const statColorMap: Record<ColorVariant, { bg: string; text: string; icon: string }> = {
  sage: { bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' },
  navy: { bg: 'bg-slate-100 border border-slate-300', text: 'text-navy', icon: 'text-navy' },
  warning: { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-800', icon: 'text-amber-600' },
  error: { bg: 'bg-red-50 border border-red-200', text: 'text-red-700', icon: 'text-red-600' },
  info: { bg: 'bg-sky-50 border border-sky-200', text: 'text-sky-700', icon: 'text-sky-600' },
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  trend,
  trendUp,
  color = 'sage',
}: StatCardProps) {
  const c = statColorMap[color]

  return (
    <Card className="group hover:scale-[1.01] transition-transform duration-200 p-3.5 sm:p-5 rounded-2xl shadow-xs">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] sm:text-caption text-slate font-bold uppercase tracking-wider truncate">
            {label}
          </p>
          <p className="text-body-lg sm:text-h2 font-heading font-bold text-navy mt-1 tabular-nums truncate">
            {value}
          </p>
          {sublabel && <p className="text-[12px] sm:text-caption text-slate-600 font-medium mt-0.5 truncate">{sublabel}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-1.5 text-[11px] sm:text-caption font-semibold truncate ${
                trendUp ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              <FontAwesomeIcon
                icon={trendUp ? faArrowUp : faArrowDown}
                className="text-[9px] shrink-0"
              />
              <span className="truncate">{trend}</span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={`flex h-8.5 w-8.5 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl ${c.bg} transition-colors duration-200`}
          >
            <FontAwesomeIcon icon={icon} className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${c.icon}`} />
          </div>
        )}
      </div>
    </Card>
  )
}

/* ─── Badge / Chip ─── */
type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'navy'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-800 border border-border',
  success: 'bg-[#22C55E]/15 text-[#16A34A] font-semibold',
  warning: 'bg-[#EAB308]/15 text-[#CA8A04] font-semibold',
  error: 'bg-[#EF4444]/15 text-[#DC2626] font-semibold',
  info: 'bg-[#0EA5E9]/15 text-[#0284C7] font-semibold',
  navy: 'bg-navy text-white font-semibold',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md text-caption font-semibold
        uppercase tracking-wider ${badgeVariants[variant]} ${className}
      `}
    >
      {children}
    </span>
  )
}

/* ─── Checkbox ─── */
interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label: string
  sublabel?: string
  id: string
}

export function Checkbox({ checked, onChange, label, sublabel, id }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer group py-1">
      <div className="relative shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <div
          className={`
            h-4.5 w-4.5 rounded flex items-center justify-center
            border-[1.5px] transition-all duration-200
            ${
              checked
                ? 'bg-navy border-navy animate-check'
                : 'border-slate-400 bg-surface group-hover:border-navy'
            }
          `}
        >
          {checked && (
            <FontAwesomeIcon icon={faCheck} className="text-[10px] text-white" />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <span
          className={`text-body-sm font-semibold transition-colors duration-200 ${
            checked ? 'text-slate line-through opacity-75' : 'text-navy'
          }`}
        >
          {label}
        </span>
        {sublabel && <p className="text-caption text-slate-600 mt-0.5">{sublabel}</p>}
      </div>
    </label>
  )
}

/* ─── Button ─── */
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'sage'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-navy text-white hover:bg-navy-hover shadow-sm',
  secondary: 'bg-transparent text-navy border-1.5 border-navy hover:bg-navy/[0.05]',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-navy',
  destructive: 'bg-error text-white hover:bg-red-700 shadow-sm',
  sage: 'bg-sage text-white hover:bg-sage-hover shadow-sm',
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3.5 text-body-sm gap-1.5',
  md: 'h-10.5 px-5.5 text-body-sm gap-2',
  lg: 'h-12 px-7 text-body gap-2.5',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-all duration-200 active:scale-[0.97]
        ${buttonVariants[variant]} ${buttonSizes[size]}
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

/* ─── Input ─── */
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-body-sm font-medium text-navy">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full h-10.5 px-3.5 rounded-lg font-body text-body-sm text-navy
          bg-surface transition-all duration-200 placeholder:text-slate-light
          ${
            error
              ? 'border-2 border-error ring-3 ring-error/10'
              : 'border border-border hover:border-navy focus:border-2 focus:border-navy focus:ring-3 focus:ring-navy/10'
          }
        `}
        {...props}
      />
      {helperText && !error && <p className="text-caption text-slate">{helperText}</p>}
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  )
}

/* ─── ProgressBar ─── */
interface ProgressBarProps {
  value: number
  max?: number
  color?: ColorVariant
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const progressColorMap: Record<ColorVariant, string> = {
  sage: 'bg-sage',
  navy: 'bg-navy',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-info',
}

const progressSizeMap: Record<string, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2.5',
}

export function ProgressBar({
  value,
  max = 100,
  color = 'sage',
  showLabel = true,
  size = 'md',
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex-1 ${progressSizeMap[size]} rounded-full bg-border overflow-hidden`}>
        <div
          className={`h-full rounded-full ${progressColorMap[color]} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-caption font-mono font-medium text-slate tabular-nums min-w-9 text-right">
          {percentage}%
        </span>
      )}
    </div>
  )
}

/* ─── Toast Notifications ─── */
export { default as ToastContainer, showToast } from './Toast'

/* ─── Confirm Modal ─── */
export { default as ConfirmModal } from './ConfirmModal'
