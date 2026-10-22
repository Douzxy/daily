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
        ${elevated ? 'shadow-md hover:shadow-lg' : 'border border-border hover:border-slate/20'}
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
  sage: { bg: 'bg-sage/10', text: 'text-sage', icon: 'text-sage' },
  navy: { bg: 'bg-navy/10', text: 'text-navy', icon: 'text-navy' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', icon: 'text-warning' },
  error: { bg: 'bg-error/10', text: 'text-error', icon: 'text-error' },
  info: { bg: 'bg-info/10', text: 'text-info', icon: 'text-info' },
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
    <Card className="group hover:scale-[1.01] transition-transform duration-200 p-3.5 sm:p-5 rounded-2xl shadow-2xs">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-caption text-slate font-semibold uppercase tracking-wider truncate">
            {label}
          </p>
          <p className="text-body-lg sm:text-h2 font-heading font-bold text-navy mt-1 tabular-nums truncate">
            {value}
          </p>
          {sublabel && <p className="text-[11px] sm:text-caption text-slate mt-0.5 truncate">{sublabel}</p>}
          {trend && (
            <div
              className={`flex items-center gap-1 mt-1.5 text-[11px] sm:text-caption font-medium truncate ${
                trendUp ? 'text-sage' : 'text-error'
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
  default: 'bg-border-light text-slate',
  success: 'bg-success-light text-green-700',
  warning: 'bg-warning-light text-yellow-700',
  error: 'bg-error-light text-red-700',
  info: 'bg-info-light text-blue-700',
  navy: 'bg-navy text-white',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md text-caption font-medium
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
                : 'border-slate-300 bg-surface group-hover:border-slate'
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
          className={`text-body-sm font-medium transition-colors duration-200 ${
            checked ? 'text-slate line-through' : 'text-navy'
          }`}
        >
          {label}
        </span>
        {sublabel && <p className="text-caption text-slate mt-0.5">{sublabel}</p>}
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
  secondary: 'bg-transparent text-navy border border-navy hover:bg-navy/[0.04]',
  ghost: 'bg-transparent text-slate hover:bg-border-light hover:text-navy',
  destructive: 'bg-error text-white hover:bg-red-600',
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
