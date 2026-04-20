'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  maxLength?: number
  showCount?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, showCount, maxLength, value, ...props }, ref) => {
    const charCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            value={value}
            maxLength={maxLength}
            className={cn(
              'w-full h-11 rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary',
              'placeholder:text-text-light',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:opacity-50 disabled:bg-surface-grey',
              error && 'border-error focus:ring-error',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light">
              {rightIcon}
            </div>
          )}
        </div>
        <div className="flex justify-between">
          {error && <p className="text-xs text-error">{error}</p>}
          {hint && !error && <p className="text-xs text-text-secondary">{hint}</p>}
          {showCount && maxLength && (
            <p className="text-xs text-text-light ml-auto">
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
